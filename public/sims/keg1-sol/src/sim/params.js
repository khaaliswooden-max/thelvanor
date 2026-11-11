// Parameter register handling: converts params/v0.2.json (with provenance)
// into the flat runtime parameter object. Environment-agnostic (no fs here).
export function flattenParams(register) {
  const p = {};
  for (const [key, entry] of Object.entries(register.parameters)) {
    if (typeof entry.value === 'number') p[key.replaceAll('.', '_')] = entry.value;
  }
  // derived / nested structures used by the sim core
  p.integration_dt_s = register.parameters['integration.dt_s'].value;
  p.scheduler = {
    static: {
      quota_wh_per_day: register.parameters['scheduler.static.quota_wh_per_day'].value,
      util_cap: register.parameters['scheduler.static.util_cap'].value,
    },
    socaware: {
      safety_factor: register.parameters['scheduler.socaware.safety_factor'].value,
    },
  };
  return p;
}

export function provenanceOf(register, flatKey) {
  const key = flatKey.replaceAll('_', '.');
  return register.parameters[key] || null;
}
