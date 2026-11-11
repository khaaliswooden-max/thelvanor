// Versioned scenario definitions (v0.2). All times in seconds from scenario epoch.
// Epochs are UTC; weather traces are defined in scenario-local solar time where the
// first simulated day starts at local midnight (epoch chosen accordingly: 06:00 UTC = 00:00 CST).
//
// Scenario epochs (ASSUMPTION): winter week of 2026-12-18 (near solstice), San Marcos TX.
export const EPOCH_WINTER = Date.UTC(2026, 11, 18, 6, 0, 0) / 1000; // 2026-12-18T06:00:00Z = local midnight

// Clear-sky peak irradiance in the plane of the panel (ASSUMPTION).
// v0.1 used 620 W/m^2, a horizontal-panel value. CAD rev E fixes the panel at
// 30 deg tilt facing south, so v0.2 uses the plane-of-array peak. Derivation in
// params/v0.2.json under solar.clear_peak_w_m2.
export const G_PEAK_WINTER_W_M2 = 830;

const WINTER_WEATHER = {
  sunrise_h: 7.4, sunset_h: 17.6,       // ~10.2 h winter day (ASSUMPTION)
  g_peak_w_m2: G_PEAK_WINTER_W_M2,
  cloudiness: 0.25,
  temp_mean_c: 8, temp_amp_c: 6.5, temp_day_spread_c: 4,
};

export const SCENARIOS = [
  {
    name: 'S1-winter-night-idle',
    description: '14-hour winter night at idle, no solar input. Documents ending energy, reserve margin, protective action.',
    duration_s: 14 * 3600,
    epoch_utc_s: EPOCH_WINTER + 17.6 * 3600, // start at local sunset
    seed: 101,
    initial_soc: 0.80, // ASSUMPTION: documented initial state matching the planning context of the ~26 Wh margin estimate
    scheduler: 'static',
    weather: {
      sunrise_h: 7.4, sunset_h: 17.6, g_peak_w_m2: G_PEAK_WINTER_W_M2, cloudiness: 0,
      no_solar: true,
      temp_mean_c: -4, temp_amp_c: 2, temp_day_spread_c: 0, // -6..-2 °C night profile (ASSUMPTION)
      daily_factors: [1],
    },
    workload: { mode: 'none', duration_s: 14 * 3600, jobs_per_day: [0, 0], job_work_s: [0, 0], arrival_window_h: [0, 0] },
    note: '14 h at 12.8 W device idle -> ~183 Wh battery-side drain incl. losses; start 204.8 Wh. Outcome (survival vs reserve breach) is EMERGENT, not hard-coded.',
  },
  {
    name: 'S2-sustained-full-load',
    description: 'Sustained full load from full charge at night; find when reserve protection activates; report completed work and thermal peaks.',
    duration_s: 12 * 3600,
    epoch_utc_s: EPOCH_WINTER + 18 * 3600,
    seed: 202,
    initial_soc: 1.0,
    scheduler: 'static',
    weather: {
      sunrise_h: 7.4, sunset_h: 17.6, g_peak_w_m2: G_PEAK_WINTER_W_M2, cloudiness: 0,
      no_solar: true,
      temp_mean_c: 25, temp_amp_c: 0, temp_day_spread_c: 0, // constant 25 °C ambient (ASSUMPTION lab-like)
      daily_factors: [1],
    },
    workload: { mode: 'clustered', duration_s: 12 * 3600, jobs_per_day: [60, 60], job_work_s: [1800, 1800], arrival_window_h: [0, 11.9] },
    util_cap_override: 1.0, // sustained FULL load: static cap overridden to 1.0 for this scenario
  },
  {
    name: 'S3-step-load-thermal',
    description: 'Step-load thermal test: 2 h idle equilibration, 2 h full load, 2 h cooling. Reports trajectories and apparent time constants.',
    duration_s: 6 * 3600,
    epoch_utc_s: EPOCH_WINTER,
    seed: 303,
    initial_soc: 1.0,
    scheduler: 'static',
    weather: {
      sunrise_h: 7.4, sunset_h: 17.6, g_peak_w_m2: G_PEAK_WINTER_W_M2, cloudiness: 0,
      no_solar: true,
      temp_mean_c: 20, temp_amp_c: 0, temp_day_spread_c: 0, // constant 20 °C chamber (ASSUMPTION)
      daily_factors: [1],
    },
    workload: { mode: 'clustered', duration_s: 6 * 3600, jobs_per_day: [0, 0], job_work_s: [0, 0], arrival_window_h: [0, 0] },
    util_profile: [ // direct utilization schedule (no jobs): [start_s, end_s, u]
      [0, 2 * 3600, 0],
      [2 * 3600, 4 * 3600, 1],
      [4 * 3600, 6 * 3600, 0],
    ],
  },
  {
    name: 'S4-week-paired-static',
    description: 'One-week winter trace, STATIC quota scheduler. Paired with S4b (identical seeds/traces).',
    duration_s: 7 * 86400,
    epoch_utc_s: EPOCH_WINTER,
    seed: 404,
    initial_soc: 0.9,
    scheduler: 'static',
    weather: { ...WINTER_WEATHER },
    workload: { mode: 'clustered', duration_s: 7 * 86400, jobs_per_day: [12, 18], job_work_s: [1200, 3600], arrival_window_h: [8, 18] },
  },
  {
    name: 'S4-week-paired-soc-aware',
    description: 'One-week winter trace, SoC-AWARE scheduler. Identical seed -> identical solar/ambient/workload traces as S4a.',
    duration_s: 7 * 86400,
    epoch_utc_s: EPOCH_WINTER,
    seed: 404,
    initial_soc: 0.9,
    scheduler: 'soc-aware',
    weather: { ...WINTER_WEATHER },
    workload: { mode: 'clustered', duration_s: 7 * 86400, jobs_per_day: [12, 18], job_work_s: [1200, 3600], arrival_window_h: [8, 18] },
  },
  {
    name: 'S5-low-solar-stress',
    description: 'Five heavily overcast days (solar scaled to ~15%). Verifies scheduler/protection coherence under energy starvation.',
    duration_s: 5 * 86400,
    epoch_utc_s: EPOCH_WINTER,
    seed: 505,
    initial_soc: 0.9,
    scheduler: 'soc-aware',
    weather: { ...WINTER_WEATHER, cloudiness: 0.8, solar_scale: 0.15, daily_factors: [0.12, 0.1, 0.18, 0.14, 0.11, 0.15] },
    workload: { mode: 'clustered', duration_s: 5 * 86400, jobs_per_day: [6, 10], job_work_s: [600, 3600], arrival_window_h: [8, 18] },
  },
  {
    name: 'S6-sensor-fault',
    description: '48 h with injected sensor faults after a normal day-1 baseline: biased SoC (+0.15, in-range, undetectable) from 20 h, stale node temperature (watchdog-detectable) from 26 h, missing PV power from 32-38 h. Demonstrates both fail-safe degraded mode and the undetected-bias hazard chain.',
    duration_s: 2 * 86400,
    epoch_utc_s: EPOCH_WINTER,
    seed: 606,
    initial_soc: 0.85,
    scheduler: 'soc-aware',
    weather: { ...WINTER_WEATHER },
    workload: { mode: 'clustered', duration_s: 2 * 86400, jobs_per_day: [8, 10], job_work_s: [600, 2400], arrival_window_h: [8, 18] },
    sensor_faults: [
      { sensor: 'soc', type: 'biased', start_s: 20 * 3600, bias: 0.15 },
      { sensor: 't_node', type: 'stale', start_s: 26 * 3600 },
      { sensor: 'pv', type: 'missing', start_s: 32 * 3600, end_s: 38 * 3600 },
    ],
  },
];

export function getScenario(name) {
  const s = SCENARIOS.find(s => s.name === name);
  if (!s) throw new Error(`unknown scenario: ${name}`);
  return s;
}
