// Single source of truth for structured site content.
// Numbers here are pre-build estimates from the preprint and BOM (Sep–Oct 2026)
// unless a row says otherwise. Measured values replace estimates line by line.

export type Grade = "verified" | "plausible" | "speculative" | "lesson";

export const site = {
  name: "Thelvanor",
  legal: "Thelvanor, PBC",
  tagline: "A data center the size of a beer keg",
  email: "thelcobot@gmail.com",
  github: "https://github.com/khaaliswooden-max/thelvanor",
  preprint: {
    title: "The Keg-1 Approach to Ultra-Micro Edge AI Inference",
    doi: "10.5281/zenodo.17945615",
    url: "https://doi.org/10.5281/zenodo.17945615",
  },
  formspree: "https://formspree.io/f/xjglkkkl",
};

export const status = {
  asOf: "2026-11-08",
  phase: 1,
  phaseName: "Ready to build",
  measurements: 0,
};

export type Stat = { value: string; label: string; grade: Grade; note?: string };

export const heroStats: Stat[] = [
  {
    value: "$165",
    label: "Total parts cost",
    grade: "verified",
    note: "BOM with links",
  },
  {
    value: "8.5 in",
    label: "Interior diameter",
    grade: "verified",
    note: "Five-gallon keg",
  },
  {
    value: "3",
    label: "Raspberry Pi 5 nodes",
    grade: "verified",
  },
  {
    value: "~17 W",
    label: "Estimated running draw",
    grade: "plausible",
    note: "Sum of node and network estimates",
  },
  {
    value: "100 W",
    label: "Solar panel, tilted",
    grade: "verified",
    note: "Doubles as a sunshade",
  },
];

export type Claim = {
  claim: string;
  estimate: string;
  measured: string;
  basis: string;
  grade: Grade;
};

export const claims: Claim[] = [
  {
    claim: "A three-node AI inference cluster fits in a five-gallon cornelius keg.",
    estimate: "Layout drawing",
    measured: "\u2014",
    basis: "Keg interior dimensions; board and cable-bend clearances.",
    grade: "plausible",
  },
  {
    claim: "It runs entirely off-grid through a Texas summer.",
    estimate: "1.19\u00d7 autonomy",
    measured: "\u2014",
    basis:
      "Energy balance: 406 Wh/day load against 430 Wh/day worst-month harvest at Dallas\u2019s 4.3 peak sun hours.",
    grade: "speculative",
  },
  {
    claim: "It serves useful AI inference.",
    estimate: "3\u20135 tok/s per node",
    measured: "\u2014",
    basis:
      "Published benchmarks for quantized 3B-class models on Pi 5 at this power budget.",
    grade: "plausible",
  },
  {
    claim: "The enclosure survives weather without active cooling.",
    estimate: "\u2264 71 \u00b0C board",
    measured: "\u2014",
    basis:
      "Keg as heatsink and sunshade; soak tests at summer ambient, May\u2013June 2026.",
    grade: "speculative",
  },
  {
    claim: "The whole thing costs less than one month of a mid-size cloud GPU.",
    estimate: "$165 vs ~$700/mo",
    measured: "$165 (parts in hand)",
    basis: "BOM receipts versus published cloud instance pricing.",
    grade: "verified",
  },
];

export type Phase = {
  id: number;
  name: string;
  window: string;
  exit: string;
  state: "done" | "active" | "next";
};

export const phases: Phase[] = [
  {
    id: 1,
    name: "Build and bench",
    window: "Sep 2026",
    exit: "Cluster posts; power and thermal baselines logged.",
    state: "active",
  },
  {
    id: 2,
    name: "Outdoor deployment",
    window: "Oct 2026",
    exit: "30 consecutive days of uptime, solar-only.",
    state: "next",
  },
  {
    id: 3,
    name: "Heat soak",
    window: "May\u2013Jun 2026",
    exit: "No thermal throttle events across ten hottest days.",
    state: "next",
  },
  {
    id: 4,
    name: "Replication",
    window: "2027",
    exit: "A second builder reproduces from the public BOM.",
    state: "next",
  },
];

export type BomRow = {
  part: string;
  spec: string;
  qty: number;
  unit: number;
  note?: string;
};

export const bom: BomRow[] = [
  { part: "Cornelius keg, 5 gal", spec: "Reconditioned, ball-lock", qty: 1, unit: 38 },
  { part: "Raspberry Pi 5, 8 GB", spec: "BCM2712, 2.4 GHz", qty: 3, unit: 27 },
  { part: "MicroSD, 64 GB A2", spec: "Boot volume per node", qty: 3, unit: 4 },
  { part: "Gigabit switch, 5-port", spec: "Unmanaged, 5 V", qty: 1, unit: 10 },
  { part: "Buck converter, 5.1 V 5 A", spec: "Per-node regulator", qty: 3, unit: 3 },
  { part: "Solar panel, 100 W", spec: "Monocrystalline, 18 V", qty: 1, unit: 22, note: "Salvage" },
  { part: "MPPT controller, 20 A", spec: "LiFePO\u2084 profile", qty: 1, unit: 9, note: "Salvage" },
  { part: "LiFePO\u2084 battery, 12.8 V 30 Ah", spec: "384 Wh reserve", qty: 1, unit: 21, note: "Salvage" },
  { part: "Cable glands, M12/M16", spec: "IP68, RJ45 pass-through", qty: 4, unit: 1.5 },
  { part: "Fuse block + wire + fasteners", spec: "Assorted", qty: 1, unit: 6 },
  { part: "Silica gel, indicating", spec: "500 g, rechargeable", qty: 1, unit: 2 },
];

export const bomTotal = bom.reduce((s, r) => s + r.qty * r.unit, 0); // 165

export type PowerRow = {
  stage: string;
  watts: number;
  grade: Grade;
  basis: string;
};

export const powerPath: PowerRow[] = [
  { stage: "Solar harvest, worst month", watts: 17.9, grade: "plausible", basis: "100 W \u00d7 4.3 PSH \u00d7 0.72 derate \u00f7 24 h" },
  { stage: "MPPT + wiring losses", watts: -1.8, grade: "plausible", basis: "\u2248 90% end-to-end" },
  { stage: "Three Pi 5 nodes, inference", watts: -12.6, grade: "plausible", basis: "4.2 W each at 3B Q4 load" },
  { stage: "Switch + converters", watts: -4.4, grade: "plausible", basis: "Switch 2 W; bucks at 90%" },
  { stage: "Margin to battery", watts: 0.9, grade: "speculative", basis: "What the autonomy ratio rests on" },
];

export const links = {
  email: site.email,
  github: site.github,
  preprint: site.preprint.url,
};

export const elsewhere = [
  { label: "GitHub", href: site.github },
  { label: "Preprint (Zenodo)", href: site.preprint.url },
  { label: "Email", href: `mailto:${site.email}` },
];

export const footerStatus = {
  phase: status.phase,
  phaseName: status.phaseName,
  asOf: status.asOf,
  measurements: status.measurements,
};

// ---------------------------------------------------------------------------
// Navigation model for the header mega-panels. Rendered, never hardcoded.

export type NavLink = { href: string; label: string; note: string };
export type NavItem = {
  href: string;
  label: string;
  blurb: string;
  links: NavLink[];
};

export const nav: NavItem[] = [
  {
    href: "/thesis",
    label: "Thesis",
    blurb:
      "Compute is shrinking faster than infrastructure is. The thesis page makes the case, with the arithmetic attached.",
    links: [
      { href: "/thesis", label: "The argument", note: "Why a keg, why now" },
      { href: "/thesis#claims", label: "Claims table", note: "Every claim, graded" },
      { href: "/research", label: "Research", note: "The preprint behind it" },
    ],
  },
  {
    href: "/keg-1",
    label: "Keg-1",
    blurb:
      "The first unit: three Pi 5 nodes, solar-only, sealed in a five-gallon cornelius keg. Built to be measured.",
    links: [
      { href: "/keg-1", label: "The instrument", note: "Power path, BOM, phases" },
      { href: "/keg-1#bom", label: "Bill of materials", note: "$165, parts in hand" },
      { href: "/keg-1/log", label: "Build log", note: "Measurements as they land" },
    ],
  },
  {
    href: "/research",
    label: "Research",
    blurb:
      "A public preprint, an open repo, and a measurement log. Everything cited; nothing taken on faith.",
    links: [
      { href: "/research", label: "Preprint", note: "Zenodo, DOI 10.5281/zenodo.17945615" },
      { href: site.preprint.url, label: "Read on Zenodo", note: "doi.org redirect" },
      { href: "/keg-1/log", label: "Field data", note: "The log, updated" },
    ],
  },
  {
    href: "/company",
    label: "Company",
    blurb:
      "Thelvanor, PBC \u2014 a public benefit corporation for ultra-micro infrastructure. Small on purpose.",
    links: [
      { href: "/company", label: "About", note: "What the company is for" },
      { href: `mailto:${site.email}`, label: "Contact", note: site.email },
      { href: site.github, label: "GitHub", note: "khaaliswooden-max/thelvanor" },
    ],
  },
];
