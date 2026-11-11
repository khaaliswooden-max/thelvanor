// Sensor layer with explicit fault handling.
// True physical state passes through sensor models; faults (stale / biased /
// missing) are injected per scenario. Two fault classes, by design:
//   DETECTABLE   — missing / out-of-range / stale-with-freeze-detection:
//                  read() returns { ok:false } and consumers must fail safe
//                  (explicit degraded mode). Invalid data is never silently
//                  accepted.
//   UNDETECTABLE — an in-range bias looks like a valid reading ({ ok:true }
//                  with the corrupted value). The system cannot see it; the
//                  fault is recorded in the oracle event log so the hazard
//                  chain (inflated SoC -> over-admission -> late protection)
//                  is visible in the results. This is deliberate: scenario S6
//                  exists to show what an undetected bias does.
export const FAULT = { STALE: 'stale', BIASED: 'biased', MISSING: 'missing', RANGE: 'range' };
// faults whose reading is flagged invalid to consumers (fail-safe triggers)
export const DETECTABLE = new Set([FAULT.MISSING, FAULT.RANGE, FAULT.STALE]);

export class SensorSuite {
  constructor(faults) {
    // faults: [{ sensor:'soc'|'t_node'|'pv'|'t_amb', type:'stale'|'biased'|'missing',
    //            start_s, end_s(Infinity), bias }]
    this.faults = faults || [];
    this.lastGood = new Map();
    this.lastGoodT = new Map();
  }

  _faultFor(sensor, tS) {
    for (const f of this.faults) {
      if (f.sensor === sensor && tS >= f.start_s && tS < (f.end_s ?? Infinity)) return f;
    }
    return null;
  }

  // Returns { ok, value, fault|null, detectable }
  read(sensor, tS, trueValue, validRange) {
    const f = this._faultFor(sensor, tS);
    if (f) {
      if (f.type === 'missing') {
        return { ok: false, value: null, fault: { sensor, type: FAULT.MISSING }, detectable: true };
      }
      if (f.type === 'stale') {
        // frozen at the last good value before fault start; the twin models a
        // watchdog that flags the freeze, so the reading is marked invalid
        const frozen = this.lastGood.get(sensor);
        if (frozen == null) {
          return { ok: false, value: null, fault: { sensor, type: FAULT.MISSING }, detectable: true };
        }
        return { ok: false, value: frozen, fault: { sensor, type: FAULT.STALE, frozen_value: frozen }, detectable: true };
      }
      if (f.type === 'biased') {
        // in-range bias: indistinguishable from a real reading
        return { ok: true, value: trueValue + (f.bias ?? 0), fault: { sensor, type: FAULT.BIASED, bias: f.bias }, detectable: false };
      }
    }
    // no injected fault: still validate range — a physically impossible reading is a fault
    if (validRange && (trueValue < validRange[0] || trueValue > validRange[1])) {
      return { ok: false, value: trueValue, fault: { sensor, type: FAULT.RANGE, value: trueValue }, detectable: true };
    }
    this.lastGood.set(sensor, trueValue);
    this.lastGoodT.set(sensor, tS);
    return { ok: true, value: trueValue, fault: null, detectable: false };
  }
}
