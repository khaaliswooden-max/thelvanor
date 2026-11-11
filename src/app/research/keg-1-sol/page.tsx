import type { Metadata } from "next";
import Link from "next/link";
import { GradeTag, SectionHead } from "@/components/ui";
import { TwinFrame } from "@/components/TwinFrame";
import type { Grade } from "@/content/site";

export const metadata: Metadata = {
  title: "Keg-1 SOL digital twin",
  description:
    "An interactive, deterministic electrothermal and scheduler simulation of Keg-1. Pre-build: every number it plots is simulated, none is measured.",
  alternates: { canonical: "/research/keg-1-sol" },
};

const TWIN_SRC = "/sims/keg1-sol/index.html";

// What v0.2 changed from v0.1, after the CAD rev E review (2026-11-10).
const changes: { input: string; was: string; now: string; why: string; g: Grade }[] = [
  {
    input: "Strip heat capacity",
    was: "340 J/K",
    now: "220 J/K",
    why: "The wide plate became a narrow rolled strip: 0.200 kg, plus three solid spacers at 0.043 kg, times 900 J/kg·K.",
    g: "plausible",
  },
  {
    input: "Strip-to-wall resistance",
    was: "0.30 K/W",
    now: "0.56 K/W",
    why: "Wall contact area fell to 0.534 of the wide plate. Interface resistance scales inversely with area. The base value is still assumed.",
    g: "speculative",
  },
  {
    input: "Chip-to-strip resistance",
    was: "2.5 K/W",
    now: "2.6 K/W",
    why: "Three layers in series over a 20 × 20 mm footprint: 1.5 mm pad, 13.3 mm aluminium spacer, a second pad of 0.5 to 1.6 mm. Pad conductivity of 3 W/m·K is assumed.",
    g: "speculative",
  },
  {
    input: "Clear-sky peak on the panel",
    was: "620 W/m²",
    now: "830 W/m²",
    why: "The panel is now fixed at 30° facing south rather than lying flat. At 29.9° N on the winter solstice the noon sun stands 36.7° high, so a tilted panel faces it far more squarely.",
    g: "plausible",
  },
];

// Model output at v0.2 defaults. Simulated, not measured.
const readings = [
  {
    k: "Hottest chip, sustained full load, 25 °C air",
    v: "72.8 °C",
    note: "Scenario S2. The throttle limit is 80 °C. The margin was 14.8 K in v0.1 and is 7.2 K now.",
  },
  {
    k: "Hours browned out, winter week, static scheduler",
    v: "34.1 h",
    note: "Scenario S4. Down from 65.3 h in v0.1, because the tilted panel harvests more.",
  },
  {
    k: "Hours browned out, same week, SoC-aware scheduler",
    v: "28.9 h",
    note: "Scenario S4, identical weather and jobs. Both schedulers still cross the reserve six times.",
  },
];

const limits = [
  "The keg wall is one temperature. A narrow strip heats a patch, not the whole shell, so the model is optimistic about the wall by an amount only the build can measure.",
  "Direct sun on the keg is not modelled. With the panel tilted, low winter sun reaches the wall under the panel's lower edge.",
  "Contact and spreading resistance are left out of the chip-to-strip path. The real resistance is likely higher than 2.6 K/W.",
  "Weather and workload are synthetic and seeded. No site irradiance data and no measured job profile are in the model.",
  "Per-node power is a planning estimate split from the blueprint's 12.8 W idle and 26.1 W full figures.",
];

export default function Keg1SolTwin() {
  return (
    <>
      <section className="wrap border-b border-line py-16 md:py-24">
        <p className="t-kicker mb-6">
          <Link href="/research" className="hover:text-ink">
            Research
          </Link>{" "}
          · Simulation
        </p>
        <h1 className="t-h1 max-w-4xl">The keg, run forward before it is built.</h1>
        <p className="t-lede mt-8">
          Keg-1 SOL is a digital twin: a deterministic model of the panel, battery, three nodes, and the heat
          path to the keg wall, with two job schedulers competing for the same stored energy. It runs in
          your browser. Every number it plots is simulated. None is a measurement, because the build has not
          started.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#twin" className="btn btn-keg">
            Run it
          </a>
          <a href={TWIN_SRC} className="btn">
            Open full screen
          </a>
          <span className="t-kicker ml-1">Version 0.2 · parameters from CAD rev E</span>
        </div>
      </section>

      {/* The app itself: a full-bleed dark band, edge to edge */}
      <section id="twin" className="band-dark scroll-mt-16 border-b border-line" aria-label="Keg-1 SOL simulation">
        <TwinFrame src={TWIN_SRC} title="Keg-1 SOL digital twin, interactive simulation" />
      </section>

      <section className="wrap py-20">
        <SectionHead kicker="Reading it" title="Three numbers the model gives today.">
          <p>
            Pick a scenario on the left, press play, and watch the battery, the temperatures, and the work
            completed move together. These three results come from the default settings. They are
            predictions to be broken by the first week of logged data.
          </p>
        </SectionHead>
        <dl className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
          {readings.map((r) => (
            <div key={r.k} className="bg-ground p-6 md:p-8">
              <dd className="t-num text-4xl leading-none">{r.v}</dd>
              <dt className="t-kicker mt-4">{r.k}</dt>
              <dd className="mt-3 text-[15px] text-ink-muted">{r.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="band-grey border-y border-line">
        <div className="wrap py-20">
          <SectionHead kicker="Version 0.2" title="Four inputs changed after the CAD review.">
            <p>
              Drawing the keg in CAD forced two decisions the first model had not made: the heat path
              became a narrow strip that fits through the lid opening, and the panel was tilted to face the
              winter sun. Both move the result. The cooling path got worse and the harvest got better.
            </p>
          </SectionHead>
          <div className="mt-12 overflow-x-auto">
            <table className="data min-w-[720px]">
              <thead>
                <tr>
                  <th>Input</th>
                  <th className="num">v0.1</th>
                  <th className="num">v0.2</th>
                  <th>Reason</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c.input}>
                    <td className="font-medium">{c.input}</td>
                    <td className="num">{c.was}</td>
                    <td className="num">{c.now}</td>
                    <td className="sub max-w-[36em]">{c.why}</td>
                    <td>
                      <GradeTag g={c.g} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="t-small mt-6 max-w-[64ch] text-ink-muted">
            The simulation core is unchanged. Run with the v0.1 inputs, it reproduces the v0.1 results
            exactly. Every input, with its grade and the reasoning behind it, is in the{" "}
            <a className="link" href="/sims/keg1-sol/params/v0.2.json">
              parameter register
            </a>
            .
          </p>
        </div>
      </section>

      <section className="wrap py-20">
        <SectionHead kicker="Limits" title="What the model does not know.">
          <p>
            A simulation that succeeds is not evidence that the keg is safe. It becomes evidence once it is
            calibrated on one real dataset and then tested on a second it has never seen. Until then, these
            are the known gaps.
          </p>
        </SectionHead>
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {limits.map((l, i) => (
            <li key={l} className="grid gap-2 py-5 sm:grid-cols-12 sm:gap-6">
              <span className="t-kicker-gate sm:col-span-2">Gap {String(i + 1).padStart(2, "0")}</span>
              <span className="text-[15px] text-ink-muted sm:col-span-9">{l}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/keg-1/log" className="btn">
            Build log
          </Link>
          <Link href="/research" className="btn">
            All research
          </Link>
        </div>
      </section>
    </>
  );
}
