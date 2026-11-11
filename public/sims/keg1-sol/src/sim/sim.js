// Keg-1 SOL digital-twin integrator.
// Deterministic, fixed-step. Telemetry every `telemetry_every_s` (default 10 s).
// Safety protection (reserve shed, BMS brownout) is implemented HERE, identically
// for all schedulers; scheduling policy lives in scheduler.js.
//
// Protection semantics:
//   - Reserve protection uses the MEASURED SoC (what a real controller would see).
//     If measured SoC <= reserve.fraction: shed compute to idle (u=0) until
//     measured SoC recovers above reserve * (1 + hysteresis).
//   - BMS brownout uses TRUE battery state (hardware Coulomb counter assumption):
//     if true E <= E_min, all loads are shed to zero.
import { Battery, electricalStep, newLedger, conservationResidual } from './electrical.js';
import { ThermalNetwork } from './thermal.js';
import { SensorSuite } from './sensors.js';
import { makeScheduler } from './scheduler.js';
import { buildWeatherTrace } from './weather.js';
import { buildWorkload } from './workload.js';

export const TELEMETRY_EVERY_S = 10;

export function runSimulation(scenario, params, opts = {}) {
  const dt = scenario.dt_s ?? params.integration_dt_s;
  if (!(dt > 0)) throw new Error('integration step must be positive');
  const duration = scenario.duration_s;
  const nSteps = Math.floor(duration / dt);
  const teleEveryS = opts.telemetry_every_s ?? TELEMETRY_EVERY_S;
  const teleEvery = Math.max(1, Math.round(teleEveryS / dt));

  // --- exogenous traces (deterministic, dt-independent) ---
  const weather = buildWeatherTrace(scenario.weather, scenario.seed, duration);
  const jobs = buildWorkload(scenario.workload, scenario.seed + 1);
  let nextJob = 0;

  // --- physical state ---
  const batt = new Battery(params.battery_capacity_wh, params.battery_soc_min_bms,
    params.battery_eta_charge, params.battery_eta_discharge);
  batt.initSoc(scenario.initial_soc);
  const eStartWh = batt.energyWh();

  const thermal = new ThermalNetwork({
    node_count: params.node_count,
    c_node_j_k: params.thermal_c_node_j_k,
    r_node_plate_k_w: params.thermal_r_node_plate_k_w,
    c_plate_j_k: params.thermal_c_plate_j_k,
    r_plate_wall_k_w: params.thermal_r_plate_wall_k_w,
    c_wall_j_k: params.thermal_c_wall_j_k,
    r_wall_amb_k_w: params.thermal_r_wall_amb_k_w,
  });
  const t0amb = weather.ambientC(0);
  thermal.init(scenario.initial_t_node_c ?? t0amb, scenario.initial_t_plate_c ?? t0amb,
    scenario.initial_t_wall_c ?? t0amb);

  const sensors = new SensorSuite(scenario.sensor_faults || []);
  const sched = makeScheduler(scenario.scheduler, params.scheduler, params);
  const ledger = newLedger();
  const reserveWh = params.reserve_fraction * params.battery_capacity_wh;
  const hysteresis = 0.05; // reserve recovery hysteresis (5% of reserve)

  // --- control state ---
  let protection = 'normal';           // 'normal' | 'reserve_shed'
  let thermalThrottle = false;
  let utilCap = 1.0;
  let lastControlS = -Infinity;
  const active = new Array(params.node_count).fill(null); // active job per node
  const queue = [];
  const events = [];
  const telemetry = [];
  const faultEvents = [];          // all faults seen this run (oracle view, incl. undetectable bias)
  const detectedFaults = [];       // faults the system itself can detect (drives degraded mode)

  // --- metrics ---
  let completedCU = 0;      // node-seconds at u=1 actually executed
  let completedJobs = 0;
  let rejectedJobs = 0;
  let reserveViolations = 0;      // count of reserve-shed entries
  let reserveShedSeconds = 0;
  let brownoutSeconds = 0;
  let brownoutWasOn = false;
  let throttleSeconds = 0;
  let maxNodeC = -Infinity;
  let minSoc = Infinity;
  let deferredRejectedCU = 0;     // work rejected outright (static quota exhausted)

  const emit = (t, type, detail) => events.push({ t_s: Math.round(t * 1000) / 1000, type, detail });

  const nodeUtil = new Float64Array(params.node_count);
  const nodePowerW = new Float64Array(params.node_count);

  for (let step = 0; step <= nSteps; step++) {
    const t = step * dt;

    // ---------- exogenous ----------
    const G = weather.irradiance(t);
    const tAmb = weather.ambientC(t);

    // arrivals enter the queue
    while (nextJob < jobs.length && jobs[nextJob].arrive_s <= t) {
      queue.push(jobs[nextJob]);
      emit(t, 'job_arrived', `job ${jobs[nextJob].id} (${jobs[nextJob].work_s.toFixed(0)} node-s)`);
      nextJob++;
    }

    // ---------- sensors (measured state, possibly faulted) ----------
    const socReading = sensors.read('soc', t, batt.soc(), [-0.01, 1.01]);
    const tNodeReading = sensors.read('t_node', t, thermal.maxNodeC(), [-40, 125]);
    const pvReading = sensors.read('pv', t, G * params.pv_rated_power_w / params.pv_stc_irradiance_w_m2, [-1, 1.5 * params.pv_rated_power_w]);
    for (const key of ['soc', 't_node', 'pv']) {
      const r = key === 'soc' ? socReading : key === 't_node' ? tNodeReading : pvReading;
      if (r.fault) {
        const fkey = `${r.fault.sensor}:${r.fault.type}`;
        if (!faultEvents.includes(fkey)) {
          faultEvents.push(fkey);
          if (r.detectable) {
            detectedFaults.push(fkey);
            emit(t, 'fault', `${fkey} detected — explicit degraded handling active`);
          } else {
            emit(t, 'fault', `${fkey} injected — in-range bias, NOT detectable by the system (oracle event)`);
          }
        }
      }
    }
    const faultActive = detectedFaults.length > 0;
    // measured values used by policy: fall back to conservative constants when invalid
    const measSoc = socReading.ok ? socReading.value : null;
    const measReserveMarginWh = measSoc == null ? 0 : (measSoc * params.battery_capacity_wh) - reserveWh;

    // ---------- scheduler control (control period) ----------
    if (t - lastControlS >= params.control_period_s) {
      lastControlS = t;
      // expected PV harvest until sunset (ASSUMPTION-class forecast):
      // clear-sky integral x clearness nowcast x 0.85 forecast haircut.
      // Sun up: blend observed transmittance (from the PV power SENSOR, not the
      // true trace) with today's weather factor. Sensor invalid/missing -> fall
      // back to the daily-factor forecast. Sun down: forecast only.
      const clearNow = weather.clearIrradiance(t);
      const dailyToday = weather.daily[Math.min(Math.floor(t / 86400), weather.daily.length - 1)];
      const pvMeasW = pvReading.ok ? pvReading.value : null;
      const clearPvW = clearNow / params.pv_stc_irradiance_w_m2 * params.pv_rated_power_w;
      const clearness = Math.min(1, 0.85 * (clearPvW > 1 && pvMeasW != null
        ? 0.5 * Math.min(1, pvMeasW / clearPvW) + 0.5 * dailyToday
        : dailyToday));
      const expectedSolarWh = weather.clearEnergyToSunset(t) / params.pv_stc_irradiance_w_m2
        * params.pv_rated_power_w * params.mppt_efficiency * clearness / 3600;
      const ctx = {
        t_s: t,
        measured_soc: measSoc,
        measured_reserve_margin_wh: measReserveMarginWh,
        seconds_to_sunrise: weather.secondsToNextSunrise(t),
        night_s: weather.night_s,
        expected_solar_to_sunset_wh: expectedSolarWh,
        p_idle_system_w: params.system_p_idle_w,
        p_node_full_w: params.node_p_full_w,
        eta_buck: params.buck_efficiency,
        eta_dis: params.battery_eta_discharge,
        fault_active: faultActive,
      };
      const c = sched.control(ctx);
      utilCap = scenario.util_cap_override ?? c.utilCap;
      if (c.reasons) for (const r of c.reasons) emit(t, 'control', r);

      // admission from queue (skipped when the scenario drives utilization directly)
      if (!scenario.util_profile) for (let qi = queue.length - 1; qi >= 0; qi--) {
        const freeNode = active.findIndex(a => a === null);
        if (freeNode < 0) break;
        const job = queue[qi];
        const decision = sched.admitJob(job, ctx);
        if (decision.admit) {
          active[freeNode] = { ...job, remaining_s: job.work_s };
          queue.splice(qi, 1);
          emit(t, 'admitted', `job ${job.id} on node ${freeNode}: ${decision.reason}`);
        } else {
          if (!job._deferLogged) {
            job._deferLogged = true;
            emit(t, 'deferred', `job ${job.id}: ${decision.reason}`);
          }
          if (sched.mode === 'static') { queue.splice(qi, 1); rejectedJobs++; job.rejected = true; deferredRejectedCU += job.work_s; }
          // soc-aware: job stays queued for later re-admission
        }
      }
    }

    // ---------- protection (safety layer, scheduler-independent) ----------
    if (protection === 'normal') {
      const socForProtection = measSoc == null ? 0 : measSoc; // fail safe
      if (socForProtection * params.battery_capacity_wh <= reserveWh) {
        protection = 'reserve_shed';
        reserveViolations++;
        emit(t, 'protection', `reserve shed ON (measured SoC ${(socForProtection * 100).toFixed(1)}% <= reserve ${(params.reserve_fraction * 100).toFixed(0)}%)`);
      }
    } else if (protection === 'reserve_shed') {
      reserveShedSeconds += dt;
      const socForProtection = measSoc == null ? 0 : measSoc;
      if (socForProtection * params.battery_capacity_wh >= reserveWh * (1 + hysteresis)) {
        protection = 'normal';
        emit(t, 'protection', 'reserve shed OFF (reserve recovered with hysteresis)');
      }
    }

    // ---------- thermal throttle (uses MEASURED node temperature) ----------
    // invalid/missing temperature reading -> assume hot (fail safe)
    const tMax = tNodeReading.ok ? tNodeReading.value : params.thermal_throttle_c;
    if (!thermalThrottle && tMax >= params.thermal_throttle_c) {
      thermalThrottle = true;
      emit(t, 'thermal', `throttle ON (node ${tMax.toFixed(1)} °C >= ${params.thermal_throttle_c} °C)`);
    } else if (thermalThrottle && tMax <= params.thermal_resume_c) {
      thermalThrottle = false;
      emit(t, 'thermal', `throttle OFF (node ${tMax.toFixed(1)} °C <= ${params.thermal_resume_c} °C)`);
    }
    if (thermalThrottle) throttleSeconds += dt;

    // ---------- utilization & device power ----------
    let deviceW = params.switch_p_w + params.sensors_p_w;
    let profileU = null;
    if (scenario.util_profile) {
      for (const [s, e, u] of scenario.util_profile) if (t >= s && t < e) profileU = u;
      if (profileU === null) profileU = 0;
    }
    for (let i = 0; i < params.node_count; i++) {
      let u = 0;
      if (protection === 'normal') {
        if (profileU !== null) u = profileU;
        else if (active[i] !== null) u = Math.min(utilCap, 1);
        if (thermalThrottle) u *= 0.5;
      }
      nodeUtil[i] = u;
      nodePowerW[i] = params.node_p_idle_w + (params.node_p_full_w - params.node_p_idle_w) * u;
      deviceW += nodePowerW[i];
    }

    // ---------- electrical step ----------
    // physical PV generation continues regardless of PV-sensor health;
    // the sensor reading only affects scheduler decisions (handled above)
    const pvW = G * params.pv_rated_power_w / params.pv_stc_irradiance_w_m2;
    const flow = electricalStep(paramsEl(params), batt, ledger, pvW, deviceW, dt);
    if (flow.brownout) {
      brownoutSeconds += dt;
      if (brownoutSeconds === dt) emit(t, 'protection', 'BMS brownout ON: load shed, demand unserved');
    } else if (brownoutSeconds > 0 && !flow.brownout && brownoutWasOn) {
      emit(t, 'protection', 'BMS brownout OFF: bus demand served again');
    }
    brownoutWasOn = flow.brownout;

    // ---------- work accounting ----------
    for (let i = 0; i < params.node_count; i++) {
      if (profileU !== null) {
        // util_profile drives synthetic work directly (thermal/step tests)
        if (nodeUtil[i] > 0) completedCU += nodeUtil[i] * dt;
      } else if (active[i] !== null && nodeUtil[i] > 0) {
        const done = nodeUtil[i] * dt;
        active[i].remaining_s -= done;
        completedCU += done;
        if (active[i].remaining_s <= 0) {
          emit(t, 'completed', `job ${active[i].id} done on node ${i}`);
          completedJobs++;
          active[i] = null;
        }
      }
    }

    // ---------- thermal step ----------
    thermal.step(nodePowerW, params.switch_p_w + params.sensors_p_w, tAmb, dt);
    maxNodeC = Math.max(maxNodeC, thermal.maxNodeC());
    minSoc = Math.min(minSoc, batt.soc());

    // ---------- telemetry ----------
    if (step % teleEvery === 0 || step === nSteps) {
      telemetry.push({
        step,
        t_s: t,
        timestamp_utc: new Date((scenario.epoch_utc_s + t) * 1000).toISOString(),
        pv_power_w: round3(pvW),
        pv_curtailed_w: round3(flow.curtailedW),
        mppt_out_w: round3(flow.pvAfterMpptW),
        bus_power_w: round3(flow.busDemandW),
        device_power_w: round3(deviceW),
        batt_out_w: round3(flow.battOutW),
        batt_charge_w: round3(flow.chargeInW),
        battery_energy_wh: round3(batt.energyWh()),
        soc: round4(batt.soc()),
        reserve_margin_wh: round3(batt.energyWh() - reserveWh),
        node0_util: round3(nodeUtil[0]), node1_util: round3(nodeUtil[1]), node2_util: round3(nodeUtil[2]),
        node0_power_w: round3(nodePowerW[0]), node1_power_w: round3(nodePowerW[1]), node2_power_w: round3(nodePowerW[2]),
        t_node0_c: round2(thermal.T_node[0]), t_node1_c: round2(thermal.T_node[1]), t_node2_c: round2(thermal.T_node[2]),
        t_plate_c: round2(thermal.T_plate), t_wall_c: round2(thermal.T_wall), t_amb_c: round2(tAmb),
        completed_cu: round1(completedCU),
        queued_jobs: queue.length,
        active_jobs: active.filter(a => a !== null).length,
        scheduler_mode: sched.mode,
        util_cap: round3(utilCap),
        protection_state: protection,
        thermal_throttle: thermalThrottle ? 1 : 0,
        brownout: flow.brownout ? 1 : 0,
        fault_active: faultActive ? 1 : 0,
        fault_list: faultEvents.join('|'),
      });
    }
  }

  // deferred work = still queued + rejected under static policy
  const deferredCU = queue.reduce((s, j) => s + j.work_s, 0) + deferredRejectedCU;

  const summary = {
    scenario: scenario.name,
    scheduler: scenario.scheduler,
    duration_s: duration,
    dt_s: dt,
    seed: scenario.seed,
    initial_soc: scenario.initial_soc,
    final_soc: round4(batt.soc()),
    final_battery_wh: round3(batt.energyWh()),
    min_soc: round4(minSoc),
    reserve_wh: reserveWh,
    reserve_margin_end_wh: round3(batt.energyWh() - reserveWh),
    reserve_violations: reserveViolations,
    reserve_shed_s: reserveShedSeconds,
    brownout_s: brownoutSeconds,
    thermal_throttle_s: throttleSeconds,
    max_node_c: round2(maxNodeC),
    final_t_node_c: round2(thermal.maxNodeC()),
    final_t_plate_c: round2(thermal.T_plate),
    final_t_wall_c: round2(thermal.T_wall),
    completed_cu: round1(completedCU),
    completed_jobs: completedJobs,
    deferred_cu: round1(deferredCU),
    rejected_jobs: rejectedJobs,
    jobs_arrived: jobs.length,
    pv_generated_wh: round3(ledger.pv_generated_Wh),
    curtailed_wh: round3(ledger.curtailed_Wh),
    device_consumed_wh: round3(ledger.device_consumed_Wh),
    losses_wh: round3(ledger.mppt_loss_Wh + ledger.buck_loss_Wh + ledger.batt_charge_loss_Wh + ledger.batt_dis_loss_Wh),
    unserved_wh: round3(ledger.unserved_Wh),
    energy_conservation_residual_wh: conservationResidual(ledger, eStartWh, batt.energyWh()),
    fault_events: faultEvents,
    n_events: events.length,
  };

  return { telemetry, events, summary, ledger };
}

function paramsEl(p) {
  return { mppt_efficiency: p.mppt_efficiency, buck_efficiency: p.buck_efficiency };
}
const round1 = x => Math.round(x * 10) / 10;
const round2 = x => Math.round(x * 100) / 100;
const round3 = x => Math.round(x * 1000) / 1000;
const round4 = x => Math.round(x * 10000) / 10000;
export { conservationResidual };
