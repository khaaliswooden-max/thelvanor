// Single source of truth for structured site content.
// Numbers here are pre-build estimates from the preprint and BOM (Sep–Oct 2026)
// unless a row says otherwise. Measured values replace estimates line by line.

export type Grade = "verified" | "plausible" | "speculative" | "lesson";

export const site = {
  name: "Thelvanor",
  legal: "Thelvanor, PBC",
  tagline: "A data center the size of a keg, built to be measured.",
  url: "https://thelvanor.com",
  founder: "Aldrich K. Wooden, Sr.",
  founderShort: "Khaalis Wooden",
  orcid: "0009-0004-7679-5142",
  email: "khaaliswooden@gmail.com",
  github: "https://github.com/khaaliswooden-max/thelvanor",
  preprint: {
    title:
      "Thelvanor Keg-1: Pre-Build Design of a Sub-$1,000 Solar-Powered Three-Node Data Center in a Stainless Keg",
    venue: "SSRN preprint, v1.0",
    date: "October 2026",
    url: "https://ssrn.com/abstract=7631278",
    id: "SSRN 7631278",
    license: "CC BY 4.0",
  },
};

// Live state of the build. Update this when the state changes; the home page reads it.
export const status = {
  phase: 0,
  phaseName: "Pre-build",
  asOf: "2026-10-26",
  measurements: 0,
  claimsUnderTest: 10,
  budget: 1000,
  spent: 0,
  nextGate: "Phase 1 gate: node 1 runs from the fused bus; both INA226s report watts.",
  nextStep: "Keg-1 hardware begins after the move to Seguin, Texas.",
};

export const phases = [
  {
    n: 1,
    name: "Energy",
    weeks: "Weeks 1–4",
    volume: "Poles",
    volumeN: "Vol. I",
    budget: 315,
    summary:
      "Panel, MPPT controller, LiFePO₄ battery, the main fuse, the fused 12 V bus, and the first node as sensor host.",
    gate: "Node 1 runs from the fused bus; both INA226 monitors report sensible watts in and watts out.",
  },
  {
    n: 2,
    name: "Compute",
    weeks: "Weeks 5–8",
    volume: "Chips",
    volumeN: "Vol. II",
    budget: 185,
    summary:
      "Nodes 2 and 3, the gigabit switch, wired network, and a three-node load test under a stop rule set in advance.",
    gate: "Three-node load test completes under the pre-set stop rule without a brownout.",
  },
  {
    n: 3,
    name: "Keg",
    weeks: "Weeks 9–12",
    volume: "Halls",
    volumeN: "Vol. III",
    budget: 265,
    summary:
      "Primer and safety-orange paint, IP68 gland and RJ45 bulkhead, the passive heat path to the keg wall, sensors, desiccant.",
    gate: "Water-only leak test of the empty keg, then a seven-day sealed soak with a flat humidity trend.",
  },
  {
    n: 4,
    name: "Deploy",
    weeks: "Weeks 13–16",
    volume: "Deployed",
    volumeN: "Vol. IV",
    budget: 65,
    summary:
      "Land, tethered water, and a ground-based orbit analog: simulated eclipse power cycles and radiation-only cooling.",
    gate: "Eclipse cycles logged; radiation-only cooling run completes with SoC below throttle.",
  },
];

export type BomRow = {
  phase: 1 | 2 | 3 | 4;
  item: string;
  qty: number;
  est: number;
  status: "checked" | "estimate";
  actual: number | null;
};

export const bom: BomRow[] = [
  { phase: 1, item: "Digital multimeter", qty: 1, est: 25, status: "estimate", actual: null },
  { phase: 1, item: "LiFePO₄ battery, 12 V 20 Ah, BMS", qty: 1, est: 80, status: "estimate", actual: null },
  { phase: 1, item: "Solar panel, 100 W 12 V mono", qty: 1, est: 80, status: "estimate", actual: null },
  { phase: 1, item: "MPPT charge controller, 10–20 A", qty: 1, est: 40, status: "estimate", actual: null },
  { phase: 1, item: "Buck converters, 12 V to 5.1 V 5 A", qty: 4, est: 25, status: "estimate", actual: null },
  { phase: 1, item: "Fuses, holders, Powerpole, wire", qty: 1, est: 35, status: "estimate", actual: null },
  { phase: 1, item: "Sensors: 2× INA226, 4× DS18B20, BME280", qty: 1, est: 30, status: "estimate", actual: null },
  { phase: 2, item: "Raspberry Pi 5, 1 GB", qty: 3, est: 135, status: "checked", actual: null },
  { phase: 2, item: "microSD, 32 GB high endurance", qty: 3, est: 30, status: "estimate", actual: null },
  { phase: 2, item: "5-port gigabit switch", qty: 1, est: 20, status: "estimate", actual: null },
  { phase: 3, item: "5-gallon ball-lock keg, 304 stainless, new", qty: 1, est: 130, status: "checked", actual: null },
  { phase: 3, item: "Self-etching primer, safety-orange enamel", qty: 1, est: 30, status: "estimate", actual: null },
  { phase: 3, item: "Heat path: heatsinks, 3 mm Al plate, pads", qty: 1, est: 35, status: "estimate", actual: null },
  { phase: 3, item: "IP68 gland, RJ45 bulkhead, sealant, step bit", qty: 1, est: 30, status: "estimate", actual: null },
  { phase: 3, item: "Outdoor Cat6 and patch cables", qty: 1, est: 30, status: "estimate", actual: null },
  { phase: 3, item: "Desiccant and humidity cards", qty: 1, est: 10, status: "estimate", actual: null },
  { phase: 4, item: "Water tether kit", qty: 1, est: 25, status: "estimate", actual: null },
  { phase: 4, item: "Panel stand / canopy", qty: 1, est: 40, status: "estimate", actual: null },
];

export const bomTotals = {
  parts: 830,
  contingency: 170,
  budget: 1000,
};

export type Claim = {
  claim: string;
  grade: Grade;
  instrument: string;
  test: string;
  expectation: string;
};

export const claims: Claim[] = [
  {
    claim: "Panel open-circuit voltage matches its label",
    grade: "plausible",
    instrument: "Multimeter, DC V",
    test: "Full sun, then half-shaded",
    expectation: "Near label Vₒₑ; shading moves voltage little, current a lot",
  },
  {
    claim: "Main fuse is sized to the wire",
    grade: "lesson",
    instrument: "Multimeter, continuity",
    test: "Continuity across installed fuse; fused-lead V equals battery V",
    expectation: "Rating per I_wire ≥ I_fuse ≥ 1.25 × I_cont,max; value recorded in log",
  },
  {
    claim: "Buck holds 5.1 V under load",
    grade: "plausible",
    instrument: "USB-C inline meter",
    test: "Output before any Pi, then under load",
    expectation: "≥ 5.0 V at 3 A; no Pi under-voltage flag",
  },
  {
    claim: "Per-node idle and full-load watts",
    grade: "plausible",
    instrument: "INA226 #2",
    test: "Idle, then 1–4 jobs on one node",
    expectation: "2.5–3.5 W idle; 6–8 W full; second job costs less than the first",
  },
  {
    claim: "Three-node full load at the bus",
    grade: "plausible",
    instrument: "INA226 #2",
    test: "Three-node stress under stop rule",
    expectation: "About 26 W, ±20%",
  },
  {
    claim: "Night idle fits usable battery energy",
    grade: "plausible",
    instrument: "INA226 #2, MPPT SoC",
    test: "One overnight log, sunset to sunrise",
    expectation: "≥ 26 Wh above the 51 Wh reserve at dawn in winter; more in summer",
  },
  {
    claim: "INA226 range covers bus current",
    grade: "lesson",
    instrument: "INA226 #2 vs multimeter",
    test: "Compare at 1–5 A",
    expectation: "Agreement within shunt tolerance; range per 81.92 mV / R_shunt",
  },
  {
    claim: "Shell rise is small; the SoC-to-plate interface dominates",
    grade: "speculative",
    instrument: "4× DS18B20",
    test: "Three-node load, 60 min, sealed",
    expectation: "Shell 5–10 K above ambient; SoC under 80 °C",
  },
  {
    claim: "Keg stays dry when sealed",
    grade: "plausible",
    instrument: "BME280",
    test: "Seven-day sealed soak, then tethered water",
    expectation: "Flat humidity trend; any rise is a leak",
  },
  {
    claim: "Daily harvest scales with peak sun hours",
    grade: "plausible",
    instrument: "INA226 #1",
    test: "Seven clear and seven cloudy days",
    expectation: "About 70 Wh per PSH; derate 0.6–0.8",
  },
];

export const energyModel = {
  nominalWh: 256,
  usableWh: 205,
  reserveWh: 51,
  idleW: 12.8,
  fullW: 26.1,
  nightHours: 14,
  nightIdleWh: 179,
  nightFullWh: 366,
  marginWh: 26,
  breakEvenPSH: 4.4,
};

export const researchQuestions = [
  {
    id: "RQ1",
    title: "Energy-aware scheduling as a mechanism",
    body: "What is the measured price of anarchy of selfish scheduling in a solar micro cluster, and which lightweight mechanism, a state-of-charge price, a quota, or proportional allocation, recovers most of the gap at the least compute overhead?",
  },
  {
    id: "RQ2",
    title: "Thermal behavior of a sealed passive enclosure",
    body: "How do watts per node and SoC temperature scale with ambient temperature in a fanless stainless enclosure, and where in the pad, plate, wall, and air chain does the dominant thermal resistance sit?",
  },
  {
    id: "RQ3",
    title: "The Landauer gap in the field",
    body: "How far above the Landauer limit does a small solar edge node operate, and how does the gap move with temperature, workload type, and clock speed?",
  },
];

export const volumes = [
  {
    series: "Poles, Chips, and Halls",
    items: [
      { n: "Vol. I", title: "Poles", sub: "Energy from first principles to the Keg-1 bus", phase: 1 },
      { n: "Vol. II", title: "Chips", sub: "Compute from first principles to the Keg-1 cluster", phase: 2 },
      { n: "Vol. III", title: "Halls", sub: "Data centers from first principles to the Keg-1 enclosure", phase: 3 },
      { n: "Vol. IV", title: "Deployed", sub: "Synthesis from first principles to Keg-1 in the field", phase: 4 },
    ],
  },
  {
    series: "Proofs, Games, and Minds",
    items: [
      { n: "Vol. I", title: "Proofs", sub: "Mathematics and computers", phase: null },
      { n: "Vol. II", title: "Games", sub: "Microeconomics and game theory", phase: null },
      { n: "Vol. III", title: "Minds", sub: "Psychology, persuasion, and ethics", phase: null },
    ],
  },
  {
    series: "Bets, Curves, and Flags",
    items: [
      { n: "v1.1", title: "Bets, Curves, and Flags", sub: "For investors, builders, and strategists of the intelligence age", phase: null },
    ],
  },
];

export const safetyRules = [
  { rule: "Fuse first.", detail: "The main fuse goes on the battery's positive terminal before anything else is connected." },
  { rule: "Never pressurize the keg with electronics inside.", detail: "The pressure-relief valve is never disabled or painted over. Leak tests use water on the empty keg, never gas." },
  { rule: "Water tests are tethered only.", detail: "A pool, a private pond, or a permitted dock. No open water in v1." },
  { rule: "Orbit is a ground analog.", detail: "Simulated eclipse power cycles and radiation-only cooling. Nothing launches." },
];
