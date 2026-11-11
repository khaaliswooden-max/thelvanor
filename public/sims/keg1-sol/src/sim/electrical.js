// Electrical chain: PV -> MPPT -> LiFePO4 battery <-> protected DC bus -> buck -> loads.
// Internal units: W and J. A full energy ledger is kept so conservation can be
// audited to machine precision at every step (Wh accumulators alongside J state).

export class Battery {
  constructor(capWh, socMin, etaChg, etaDis) {
    this.capJ = capWh * 3600;
    this.eMinJ = socMin * this.capJ;
    this.etaChg = etaChg;
    this.etaDis = etaDis;
    this.E = 0; // J, set by init
  }
  initSoc(soc) { this.E = soc * this.capJ; }
  soc() { return this.E / this.capJ; }
  energyWh() { return this.E / 3600; }
}

export function newLedger() {
  return {
    pv_generated_Wh: 0,      // at panel terminals (pre-MPPT)
    mppt_loss_Wh: 0,
    pv_to_bus_Wh: 0,         // PV energy delivered straight to the bus
    pv_to_charge_in_Wh: 0,   // surplus PV offered to the charger (pre eta_chg)
    batt_charge_loss_Wh: 0,
    batt_stored_in_Wh: 0,    // actually stored
    curtailed_Wh: 0,         // surplus PV rejected because battery full
    batt_out_Wh: 0,          // drawn from storage (pre eta_dis)
    batt_dis_loss_Wh: 0,
    bus_delivered_Wh: 0,     // into the buck converters
    buck_loss_Wh: 0,
    device_consumed_Wh: 0,   // useful device-side energy
    unserved_Wh: 0,          // demanded but impossible (brownout)
  };
}

// One electrical step. Returns per-step flow detail for telemetry.
// pvW: panel terminal power; deviceLoadW: device-side demand (post-buck);
// dt s. Mutates battery and ledger. brownoutAllowed=false => protection should
// have already shed load; we still guard physically.
export function electricalStep(p, batt, ledger, pvW, deviceLoadW, dt) {
  const pvAfterMppt = pvW * p.mppt_efficiency;
  const busDemand = deviceLoadW / p.buck_efficiency; // bus-side demand

  const pvToBus = Math.min(pvAfterMppt, busDemand);
  let deficit = busDemand - pvToBus;      // must come from battery
  let surplus = pvAfterMppt - pvToBus;    // can charge battery

  // Discharge side, physically limited by stored energy above BMS floor
  let battOut = 0, unserved = 0;
  if (deficit > 0) {
    const battSideMax = Math.max(0, batt.E - batt.eMinJ) / dt; // battery-side W available
    battOut = Math.min(deficit / batt.etaDis, battSideMax);     // battery-side W drawn
    const busFromBatt = battOut * batt.etaDis;
    unserved = deficit - busFromBatt;
    batt.E -= battOut * dt;
  }

  // Charge side, physically limited by headroom
  let chargeIn = 0, curtailed = 0;
  if (surplus > 0) {
    const maxStore = Math.max(0, batt.capJ - batt.E) / (batt.etaChg * dt); // W acceptable pre-eta
    chargeIn = Math.min(surplus, maxStore);
    curtailed = surplus - chargeIn;
    batt.E += chargeIn * batt.etaChg * dt;
  }

  // Numerical guards
  if (batt.E < -1e-6) throw new Error(`battery energy below zero: ${batt.E}`);
  if (batt.E > batt.capJ + 1e-6) throw new Error(`battery energy above capacity: ${batt.E}`);
  if (batt.E < 0) batt.E = 0;
  if (batt.E > batt.capJ) batt.E = batt.capJ;
  if (!Number.isFinite(batt.E)) throw new Error('battery energy non-finite');

  const busDelivered = pvToBus + battOut * batt.etaDis;
  const servedDeviceW = busDelivered * p.buck_efficiency; // device-side power actually served
  const Wh = dt / 3600;
  ledger.pv_generated_Wh += pvW * Wh;
  ledger.mppt_loss_Wh += (pvW - pvAfterMppt) * Wh;
  ledger.pv_to_bus_Wh += pvToBus * Wh;
  ledger.pv_to_charge_in_Wh += chargeIn * Wh;
  ledger.batt_charge_loss_Wh += chargeIn * (1 - batt.etaChg) * Wh;
  ledger.batt_stored_in_Wh += chargeIn * batt.etaChg * Wh;
  ledger.curtailed_Wh += curtailed * Wh;
  ledger.batt_out_Wh += battOut * Wh;
  ledger.batt_dis_loss_Wh += battOut * (1 - batt.etaDis) * Wh;
  ledger.bus_delivered_Wh += busDelivered * Wh;
  ledger.buck_loss_Wh += busDelivered * (1 - p.buck_efficiency) * Wh;
  ledger.device_consumed_Wh += servedDeviceW * Wh;
  ledger.unserved_Wh += (deviceLoadW - servedDeviceW) * Wh;

  return {
    pvW, pvAfterMpptW: pvAfterMppt, busDemandW: busDemand,
    pvToBusW: pvToBus, battOutW: battOut, chargeInW: chargeIn,
    curtailedW: curtailed, unservedBusW: unserved,
    servedDeviceW,
    brownout: unserved > 1e-9,
  };
}

// Conservation audit: returns residual Wh (should be ~0).
// pv_generated = mppt_loss + pv_to_bus + pv_to_charge_in + curtailed
// pv_to_charge_in = batt_charge_loss + batt_stored_in
// batt_out = batt_dis_loss + bus-from-batt; bus_delivered = pv_to_bus + batt_out*eta_dis
// bus_delivered = buck_loss + device_consumed
// E_end - E_start = batt_stored_in - batt_out
export function conservationResidual(ledger, eStartWh, eEndWh) {
  const inflow = ledger.pv_generated_Wh + eStartWh;
  const outflow = ledger.device_consumed_Wh + ledger.mppt_loss_Wh
    + ledger.batt_charge_loss_Wh + ledger.batt_dis_loss_Wh + ledger.buck_loss_Wh
    + ledger.curtailed_Wh + eEndWh;
  return inflow - outflow;
}
