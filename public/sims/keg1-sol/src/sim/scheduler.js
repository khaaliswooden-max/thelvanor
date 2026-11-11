// Schedulers + protection layer.
// SAFETY PROTECTION IS SEPARATE FROM SCHEDULING POLICY:
//   - Protection (reserve shed / BMS brownout) applies identically to both
//     schedulers and is implemented in sim.js from measured SoC.
//   - Schedulers below only decide admission + utilization caps.
//
// Both controllers expose: control(ctx) -> { utilCap, admitJob(job)->{admit,reason} }
// ctx carries MEASURED state (possibly faulted) + exogenous predictions.
// Every decision returns a human-readable reason, logged by the integrator.

export class StaticQuotaScheduler {
  constructor(cfg) {
    this.mode = 'static';
    this.quotaWhPerDay = cfg.quota_wh_per_day;
    this.utilCap = cfg.util_cap;
    this.dayUsedWh = 0;
    this.dayIndex = -1;
  }
  control(ctx) {
    const d = Math.floor(ctx.t_s / 86400);
    if (d !== this.dayIndex) { this.dayIndex = d; this.dayUsedWh = 0; }
    return { utilCap: this.utilCap };
  }
  admitJob(job, ctx) {
    const jobWh = job.work_s * ctx.p_node_full_w / 3600;
    if (this.dayUsedWh + jobWh > this.quotaWhPerDay) {
      return { admit: false, reason: `daily quota exhausted (${this.dayUsedWh.toFixed(1)}/${this.quotaWhPerDay} Wh)` };
    }
    this.dayUsedWh += jobWh;
    return { admit: true, reason: `within daily quota (${this.dayUsedWh.toFixed(1)}/${this.quotaWhPerDay} Wh)` };
  }
}

export class SocAwareScheduler {
  constructor(cfg, params) {
    this.mode = 'soc-aware';
    this.safety = cfg.safety_factor;
    this.p = params;
    this.lastReasons = [];
  }
  // Battery-side energy needed to hold the IDLE system through the coming night.
  // Uses the fixed night length (sunset->sunrise), NOT seconds-to-next-sunrise:
  // the question at admission time is "can we afford this job AND still idle
  // through tonight", so the need is tonight's full idle draw.
  nightNeedWh(ctx) {
    const hNight = ctx.night_s / 3600;
    return ctx.p_idle_system_w / ctx.eta_buck / ctx.eta_dis * hNight;
  }
  // Energy budget available for compute right now (Wh, battery side):
  //   measured margin above reserve
  //   + expected PV harvest until sunset (clear-sky integral x clearness nowcast)
  //   - tonight's idle need x safety factor
  budgetWh(ctx) {
    return ctx.measured_reserve_margin_wh
      + ctx.expected_solar_to_sunset_wh
      - this.nightNeedWh(ctx) * this.safety;
  }
  control(ctx) {
    const reasons = [];
    let utilCap = 1.0;
    if (ctx.fault_active) {
      // explicit degraded mode: conservative cap, admission by trivial-job rule
      utilCap = 0.4;
      reasons.push('sensor fault active -> conservative util cap 0.4');
    } else {
      const budget = this.budgetWh(ctx);
      const need = this.nightNeedWh(ctx);
      if (budget > 2 * need) utilCap = 1.0;
      else if (budget > 0.5 * need) utilCap = 0.6;
      else utilCap = 0.3;
      reasons.push(`budget ${budget.toFixed(1)} Wh (margin ${ctx.measured_reserve_margin_wh.toFixed(1)} + solar ${ctx.expected_solar_to_sunset_wh.toFixed(1)} - night ${(need * this.safety).toFixed(1)}) -> util cap ${utilCap}`);
    }
    this.lastReasons = reasons;
    return { utilCap, reasons };
  }
  admitJob(job, ctx) {
    const jobWh = job.work_s * ctx.p_node_full_w / 3600 / ctx.eta_buck; // battery-side cost
    if (ctx.fault_active) {
      // cannot trust SoC: admit only trivial work, defer the rest explicitly
      if (jobWh < 2) return { admit: true, reason: 'fault mode: trivial job admitted (<2 Wh)' };
      return { admit: false, reason: 'fault mode: cannot verify energy budget -> deferred' };
    }
    const budget = this.budgetWh(ctx);
    if (jobWh <= Math.max(0, budget)) {
      return { admit: true, reason: `job ${jobWh.toFixed(1)} Wh within budget ${budget.toFixed(1)} Wh` };
    }
    return { admit: false, reason: `job ${jobWh.toFixed(1)} Wh exceeds budget ${budget.toFixed(1)} Wh -> deferred` };
  }
}

export function makeScheduler(mode, cfg, params) {
  if (mode === 'static') return new StaticQuotaScheduler(cfg.static);
  if (mode === 'soc-aware') return new SocAwareScheduler(cfg.socaware, params);
  throw new Error(`unknown scheduler mode: ${mode}`);
}
