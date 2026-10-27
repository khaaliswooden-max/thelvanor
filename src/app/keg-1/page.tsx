import type { Metadata } from "next";
import Link from "next/link";
import { KegDrawing } from "@/components/KegDrawing";
import { GradeTag, SectionHead, StatusStrip } from "@/components/ui";
import { bom, bomTotals, claims, energyModel as m, phases, safetyRules, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Keg-1",
  description:
    "Keg-1: architecture, power path, bill of materials with estimate versus actual, and the ten pre-build claims under test.",
};

const money = (n: number) => `$${n.toLocaleString()}`;

export default function Keg1() {
  const byPhase = (p: number) => bom.filter((r) => r.phase === p);
  const sum = (rows: typeof bom) => rows.reduce((a, r) => a + r.est, 0);
  const actualSum = bom.reduce((a, r) => a + (r.actual ?? 0), 0);

  return (
    <>
      <section className="wrap border-b border-line py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="t-meta mb-4">Keg-1. Version 1</p>
            <h1 className="t-h1">
              Three nodes, one panel, one keg.
            </h1>
            <p className="t-lede mt-8">
              The power plant sits outside: panel, MPPT controller, battery, main fuse. One fused 12 V feed
              enters through a cable gland to a five-slot fuse block. A fault on one node opens one fuse and
              leaves the other two running. That is the keg-scale version of redundant power distribution in
              a data hall.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/keg-1/log" className="btn btn-keg">
                Build log
              </Link>
              <a href={site.preprint.url} className="btn">
                Pre-build preprint
              </a>
            </div>
          </div>
          <div className="md:col-span-5">
            <KegDrawing animate={false} className="w-full" />
          </div>
        </div>
      </section>

      <section className="wrap py-10">
        <StatusStrip />
      </section>

      {/* Power path */}
      <section className="wrap py-16">
        <SectionHead title="Power path.">
          <p>
            100 W monocrystalline panel, doubling as the sunshade, into an MPPT controller with a LiFePO₄
            profile, into a 12.8 V nominal, 20 Ah battery with integrated BMS. The main fuse sits within 7
            inches of the positive post, per marine wiring convention. Inside the keg, slots B1 to B3 feed
            three 12 V to 5.1 V buck converters, one per node; B4 feeds the switch; B5 feeds the 3.3 V sensor
            rail and is the spare.
          </p>
        </SectionHead>
        <div className="mt-10 overflow-x-auto">
          <table className="data min-w-[640px]">
            <thead>
              <tr>
                <th>Load at the 12 V bus</th>
                <th className="num">Idle W</th>
                <th className="num">Full W</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Raspberry Pi 5, per node, ×3</td>
                <td className="num">3.0</td>
                <td className="num">7.0</td>
                <td><GradeTag g="plausible" /></td>
              </tr>
              <tr>
                <td>5-port gigabit switch</td>
                <td className="num">2.0</td>
                <td className="num">2.0</td>
                <td><GradeTag g="plausible" /></td>
              </tr>
              <tr>
                <td>Sensor rail and MPPT self-use</td>
                <td className="num">0.5</td>
                <td className="num">0.5</td>
                <td><GradeTag g="plausible" /></td>
              </tr>
              <tr>
                <td>Buck conversion efficiency</td>
                <td className="num" colSpan={2}>0.90</td>
                <td><GradeTag g="plausible" /></td>
              </tr>
              <tr>
                <td className="font-semibold">Cluster total at bus</td>
                <td className="num font-semibold">{m.idleW}</td>
                <td className="num font-semibold">{m.fullW}</td>
                <td className="sub">derived</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="t-meta mt-3">
          Pi figures are typical values reported for the platform, not measurements. INA226 #2 replaces them
          at idle and under one through four jobs.
        </p>
      </section>

      {/* Phases */}
      <section className="border-y border-line bg-surface">
        <div className="wrap py-16">
          <SectionHead title="Sixteen weeks, four gates." />
          <ol className="mt-10 grid gap-px border border-line bg-line md:grid-cols-4">
            {phases.map((p) => (
              <li key={p.n} className="bg-surface p-6">
                <div className="flex items-baseline justify-between">
                  <span className="t-num text-ink-faint">0{p.n}</span>
                  <span className="t-meta">{p.weeks}</span>
                </div>
                <h3 className="t-h3 mt-4">{p.name}</h3>
                <p className="t-meta mt-1">
                  {p.volumeN}, <em>{p.volume}</em>. {money(p.budget)}
                </p>
                <p className="mt-4 text-[15px] text-ink-muted">{p.summary}</p>
                <p className="mt-4 text-[15px]">
                  <span className="t-meta">Gate. </span>
                  {p.gate}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BOM */}
      <section className="wrap py-16">
        <SectionHead title="Bill of materials, estimate against actual.">
          <p>
            Prepared September 30, 2026. Only two lines were checked against live listings: the Pi 5 boards
            and the keg. The rest are estimates. Actual prices are written beside each estimate at purchase,
            and the gap is the project&rsquo;s first cost-variance dataset. Assumed on hand: a laptop, a drill,
            hand tools.
          </p>
        </SectionHead>
        <div className="mt-10 overflow-x-auto">
          <table className="data min-w-[720px]">
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Qty</th>
                <th className="num">Estimate</th>
                <th>Price status</th>
                <th className="num">Actual</th>
                <th className="num">Variance</th>
              </tr>
            </thead>
            <tbody>
              {phases.map((p) => (
                <PhaseRows key={p.n} n={p.n} name={p.name} rows={byPhase(p.n)} subtotal={sum(byPhase(p.n))} />
              ))}
              <tr>
                <td className="font-semibold">Parts subtotal</td>
                <td className="num" />
                <td className="num font-semibold">{money(bomTotals.parts)}</td>
                <td />
                <td className="num">{actualSum ? money(actualSum) : "—"}</td>
                <td className="num">—</td>
              </tr>
              <tr>
                <td className="sub">Contingency, 20.5%: price swings, shipping, tax, mistakes</td>
                <td className="num" />
                <td className="num">{money(bomTotals.contingency)}</td>
                <td />
                <td className="num">—</td>
                <td className="num">—</td>
              </tr>
              <tr>
                <td className="font-semibold">Project budget</td>
                <td className="num" />
                <td className="num font-semibold">{money(bomTotals.budget)}</td>
                <td />
                <td className="num">—</td>
                <td className="num">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="t-meta mt-3">
          Energy and the enclosure are 70% of parts cost. Compute is under a fifth. That is the keg-scale
          version of the warehouse observation that power and cooling, not servers, set the capital shape.
        </p>
      </section>

      {/* Claims */}
      <section className="border-y border-line bg-surface">
        <div className="wrap py-16">
          <SectionHead title="Ten claims under test.">
            <p>
              Each design claim is paired with the instrument that will test it and the expectation it must
              beat or replace. Where a value is withheld as a lesson, the builder produces the number before
              buying the part. Results land in the build log and replace these rows one at a time.
            </p>
          </SectionHead>
          <div className="mt-10 overflow-x-auto">
            <table className="data min-w-[880px]">
              <thead>
                <tr>
                  <th>Claim</th>
                  <th>Grade</th>
                  <th>Instrument</th>
                  <th>Test</th>
                  <th>Pre-build expectation</th>
                  <th>Measured</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.claim}>
                    <td>{c.claim}</td>
                    <td><GradeTag g={c.grade} /></td>
                    <td className="sub">{c.instrument}</td>
                    <td className="sub">{c.test}</td>
                    <td>{c.expectation}</td>
                    <td className="sub">not yet</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="wrap py-16">
        <SectionHead title="Rules that gate every step.">
          <p>
            Two further constraints follow from the hardware. Pi GPIO pins operate at 3.3 V and are not 5 V
            tolerant, so the sensor rail is 3.3 V only. Every load test stays above the BMS low-voltage
            cutoff; a node that browns out has already reset, and there is no recovery step to prove.
          </p>
        </SectionHead>
        <ul className="mt-10 grid gap-px border border-keg-dim bg-keg-dim md:grid-cols-4">
          {safetyRules.map((r) => (
            <li key={r.rule} className="bg-ground p-6">
              <p className="font-semibold">{r.rule}</p>
              <p className="t-small mt-1 text-ink-muted">{r.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function PhaseRows({
  n,
  name,
  rows,
  subtotal,
}: {
  n: number;
  name: string;
  rows: typeof bom;
  subtotal: number;
}) {
  return (
    <>
      <tr>
        <td colSpan={6} className="pt-6">
          <span className="t-num text-ink-faint">0{n}</span>
          <span className="ml-3 font-semibold">{name}</span>
          <span className="t-meta ml-3">{money(subtotal)}</span>
        </td>
      </tr>
      {rows.map((r) => {
        const v = r.actual == null ? null : r.actual - r.est;
        return (
          <tr key={r.item}>
            <td>{r.item}</td>
            <td className="num">{r.qty}</td>
            <td className="num">{money(r.est)}</td>
            <td className="sub">{r.status === "checked" ? "Checked 9/2026" : "Estimate"}</td>
            <td className="num">{r.actual == null ? "—" : money(r.actual)}</td>
            <td className="num" style={v != null && v > 0 ? { color: "var(--keg)" } : undefined}>
              {v == null ? "—" : `${v >= 0 ? "+" : "−"}${money(Math.abs(v))}`}
            </td>
          </tr>
        );
      })}
    </>
  );
}
