// Deterministic PRNG (mulberry32) + helpers.
// All synthetic weather/workload randomness flows through this so that
// identical seeds produce bit-identical traces regardless of integration dt.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed) {
  const f = mulberry32(seed);
  return {
    next: f,
    range: (lo, hi) => lo + (hi - lo) * f(),
    int: (lo, hi) => Math.floor(lo + (hi - lo + 1) * f()),
    pick: (arr) => arr[Math.floor(f() * arr.length)],
  };
}
