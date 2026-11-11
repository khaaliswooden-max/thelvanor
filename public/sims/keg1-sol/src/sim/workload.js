// Synthetic workload generation (seeded, dt-independent).
// Jobs arrive at minute resolution; work is measured in node-seconds at u=1
// (1 CU = 1 second of one node at full utilization).
import { makeRng } from './rng.js';

export function buildWorkload(cfg, seed) {
  // cfg: { duration_s, jobs_per_day: [lo,hi], job_work_s: [lo,hi],
  //        arrival_window_h: [start,end] (local), mode: 'clustered'|'none' }
  const jobs = [];
  if (cfg.mode === 'none') return jobs;
  const rng = makeRng(seed);
  const days = Math.ceil(cfg.duration_s / 86400);
  let id = 0;
  for (let d = 0; d < days; d++) {
    const n = rng.int(cfg.jobs_per_day[0], cfg.jobs_per_day[1]);
    for (let j = 0; j < n; j++) {
      const h = rng.range(cfg.arrival_window_h[0], cfg.arrival_window_h[1]);
      const arrive_s = d * 86400 + Math.floor(h * 60) * 60; // minute resolution
      if (arrive_s >= cfg.duration_s) continue;
      jobs.push({
        id: id++,
        arrive_s,
        work_s: rng.range(cfg.job_work_s[0], cfg.job_work_s[1]),
      });
    }
  }
  jobs.sort((a, b) => a.arrive_s - b.arrive_s || a.id - b.id);
  return jobs;
}
