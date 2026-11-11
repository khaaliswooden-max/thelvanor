// Deterministic exogenous traces: solar irradiance and ambient temperature.
// Traces are precomputed on fixed-resolution grids (cloud: 300 s, ambient: analytic
// + per-day seeded offsets) so results do NOT depend on the integration step.
//
// Model (ASSUMPTION class, no real weather data used):
//   clear-sky G(t) = G_peak * max(0, sin(pi * dayfrac))^1.15
//   cloud transmittance from a seeded Ornstein-Uhlenbeck process on a 5-min grid
//   per-day "weather factor" scales both irradiance and ambient mean
import { makeRng } from './rng.js';

export const CLOUD_GRID_S = 300; // 5-minute cloud grid, dt-independent

export function buildWeatherTrace(cfg, seed, durationS) {
  // cfg: { sunrise_h, sunset_h, g_peak_w_m2, daily_factors: [f..] | null,
  //        cloudiness: 0..1 base OU mean, temp_mean_c, temp_amp_c, temp_day_spread_c,
  //        solar_scale (stress scenarios), no_solar }
  // durationS: scenario duration in seconds (traces are sized to cover it)
  const duration_s = durationS ?? cfg.duration_s;
  if (!(duration_s > 0)) throw new Error('buildWeatherTrace: duration_s required');
  const rng = makeRng(seed);
  const nGrid = Math.ceil(duration_s / CLOUD_GRID_S) + 2;
  const days = Math.ceil(duration_s / 86400) + 1;

  // Per-day weather factors (seeded): 1 = clear, lower = overcast day
  const daily = [];
  for (let d = 0; d < days; d++) {
    const f = cfg.daily_factors && cfg.daily_factors[d] != null
      ? cfg.daily_factors[d]
      : rng.range(0.55, 1.0);
    daily.push(f);
    rng.range(0, 1); // keep stream alignment stable across branches
  }

  // OU cloud process on fixed grid
  const cloud = new Float64Array(nGrid);
  let c = cfg.cloudiness;
  const theta = 0.25, sigma = 0.35;
  for (let i = 0; i < nGrid; i++) {
    const u1 = Math.max(rng.next(), 1e-12), u2 = rng.next();
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    c = c + theta * (cfg.cloudiness - c) + sigma * gauss * 0.1;
    c = Math.min(1, Math.max(0, c));
    cloud[i] = c;
  }
  // Per-day ambient mean offset (seeded)
  const tempOffset = [];
  for (let d = 0; d < days; d++) tempOffset.push(rng.range(-cfg.temp_day_spread_c, cfg.temp_day_spread_c));

  const sunriseS = cfg.sunrise_h * 3600, sunsetS = cfg.sunset_h * 3600;
  const dayLen = sunsetS - sunriseS;

  function localSeconds(tS) { return tS; } // traces are defined in scenario-local time; epoch handled by caller

  function irradiance(tS) {
    if (cfg.no_solar) return 0;
    const dayIndex = Math.floor(tS / 86400);
    const tDay = tS - dayIndex * 86400;
    if (tS < 0 || tDay < sunriseS || tDay > sunsetS) return 0;
    const frac = (tDay - sunriseS) / dayLen;
    const clear = cfg.g_peak_w_m2 * Math.pow(Math.sin(Math.PI * frac), 1.15);
    const gi = Math.min(nGrid - 1, Math.floor(tS / CLOUD_GRID_S));
    const trans = (1 - 0.85 * cloud[gi]) * daily[Math.min(dayIndex, daily.length - 1)];
    return clear * trans * (cfg.solar_scale ?? 1);
  }

  // cloud-free clear-sky irradiance (climatology baseline for solar nowcasts)
  function clearIrradiance(tS) {
    if (cfg.no_solar) return 0;
    const dayIndex = Math.floor(tS / 86400);
    const tDay = tS - dayIndex * 86400;
    if (tS < 0 || tDay < sunriseS || tDay > sunsetS) return 0;
    const frac = (tDay - sunriseS) / dayLen;
    return cfg.g_peak_w_m2 * Math.pow(Math.sin(Math.PI * frac), 1.15) * (cfg.solar_scale ?? 1);
  }

  // integrated clear-sky irradiance from tS to today's sunset (J/m^2), 10-min sampling;
  // zero when the sun is already down (conservative: tomorrow's sun is not counted for tonight)
  function clearEnergyToSunset(tS) {
    const dayStart = Math.floor(tS / 86400) * 86400;
    const sunsetAbs = dayStart + sunsetS;
    if (tS >= sunsetAbs) return 0;
    let j = 0;
    for (let t = Math.max(tS, dayStart + sunriseS); t < sunsetAbs; t += 600) {
      j += clearIrradiance(t) * 600;
    }
    return j;
  }

  function ambientC(tS) {
    const dayIndex = Math.floor(tS / 86400);
    const tH = (tS - dayIndex * 86400) / 3600;
    // diurnal cycle peaking at 15:00 local
    return cfg.temp_mean_c
      + tempOffset[Math.min(dayIndex, tempOffset.length - 1)]
      + cfg.temp_amp_c * Math.sin(2 * Math.PI * (tH - 15) / 24);
  }

  function secondsToNextSunrise(tS) {
    const dayIndex = Math.floor(tS / 86400);
    const tDay = tS - dayIndex * 86400;
    if (tDay < sunriseS) return sunriseS - tDay;
    return (86400 - tDay) + sunriseS;
  }

  return { irradiance, clearIrradiance, clearEnergyToSunset, ambientC, secondsToNextSunrise, daily, sunrise_s: sunriseS, sunset_s: sunsetS, night_s: 86400 - dayLen, localSeconds };
}
