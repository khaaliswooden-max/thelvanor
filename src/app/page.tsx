import Link from "next/link";
import { KegDrawing } from "@/components/KegDrawing";
import { NightChart } from "@/components/NightChart";
import { GradeTag, SectionHead, StatusStrip } from "@/components/ui";
import { energyModel as m, phases, safetyRules, site, status } from "@/content/site";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-line">
        <div className="wrap relative grid items-end gap-10 py-16 md:min-h-[82vh] md:grid-cols-12 md:py-20">
          {/* column rules, hero only */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-line md:block" />
          <div className="md:col-span-6">
            <h1 className="t-display">
              A data center
              <br />
              the size of a keg.
            </h1>
            <p className="t-lede mt-8">
              Three Raspberry Pi 5 nodes, one 100 W solar panel, one 256 Wh battery, sealed in a stainless
              keg painted safety orange. Built for under $1,000. Instrumented so every design claim becomes a
              measurement, then published.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/keg-1" className="btn btn-keg">
                See Keg-1
              </Link>
              <a href={site.preprint.url} className="btn">
                Read the preprint
              </a>
            </div>
          </div>
          <div className="md:col-span-6 md:pl-10">
            <KegDrawing className="mx-auto w-full max-w-[560px]" />
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="wrap py-10">
        <StatusStrip />
        <p className="t-meta mt-4 max-w-2xl">
          {status.nextStep} Next gate: {status.nextGate}
        </p>
      </section>

      {/* What it is */}
      <section className="wrap py-20">
        <SectionHead title="Small on purpose. Cheap on purpose. Instrumented on purpose.">
          <p>
            The questions that matter about data centers, how energy becomes computation, how heat leaves a
            sealed box, how a shared power budget is split among competing loads, are usually studied at the
            scale of a warehouse. They can be studied at the scale of a keg. Keg-1 is not built for
            throughput. It is built so that every abstraction in a data-center curriculum ends in a number
            read on a $25 multimeter.
          </p>
        </SectionHead>

        <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
          {[
            {
              k: "Energy",
              big: "256 Wh",
              sub: "12.8 V × 20 Ah LiFePO₄, 80% usable",
              body: "A 100 W panel that is also the sunshade feeds an MPPT controller, then a fused 12 V bus with five branches, one per node, one for the switch, one spare.",
              grade: "plausible" as const,
            },
            {
              k: "Compute",
              big: "3 × Pi 5",
              sub: "1 GB each, wired gigabit, no Wi-Fi",
              body: "A steel keg is a Faraday cage. Nodes talk over a five-port switch; one outdoor Cat6 leaves through an IP68 bulkhead. Node 1 hosts the sensors and the log.",
              grade: "verified" as const,
            },
            {
              k: "Hall",
              big: "0.50 m²",
              sub: "stainless shell, fanless",
              body: "Each SoC conducts into a 3 mm aluminum plate bolted to the keg wall. The shell is the radiator. The bet is that passive conduction is enough for three nodes.",
              grade: "speculative" as const,
            },
          ].map((c) => (
            <div key={c.k} className="bg-ground p-6 md:p-8">
              <div className="flex items-center justify-between">
                <p className="t-meta">{c.k}</p>
                <GradeTag g={c.grade} />
              </div>
              <p className="t-num mt-6 text-4xl leading-none">{c.big}</p>
              <p className="t-meta mt-2">{c.sub}</p>
              <p className="mt-6 text-[15px] text-ink-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Governing problem */}
      <section className="border-y border-line bg-surface">
        <div className="wrap py-20">
          <SectionHead kicker="The governing problem" title="The scheduler, not the panel, is the design.">
            <p>
              Over a 14-hour winter night three idle nodes draw about {m.nightIdleWh} Wh and finish the night
              with roughly {m.marginWh} Wh above the reserve. Three nodes at full load would need {m.nightFullWh}{" "}
              Wh, which the battery does not hold. Night compute must be scheduled against a {m.marginWh} Wh
              margin, about six node-hours of full load. Every input here is a pre-build estimate. The first
              overnight log redraws the lines.
            </p>
          </SectionHead>
          <NightChart className="mt-12 max-w-3xl" />
        </div>
      </section>

      {/* Phases */}
      <section className="wrap py-20">
        <SectionHead title="Four phases. Four volumes. One gate each.">
          <p>
            Parts are bought when their chapter is being studied. A phase ends only when its bench test
            passes. The curriculum, <em>Poles, Chips, and Halls</em>, climbs five rungs in each domain, from
            sixth grade to doctoral research questions, and each rung ends on the bench.
          </p>
        </SectionHead>
        <ol className="mt-12 border-t border-line">
          {phases.map((p) => (
            <li key={p.n} className="grid gap-3 border-b border-line py-6 md:grid-cols-12 md:gap-8">
              <div className="flex items-baseline gap-4 md:col-span-4">
                <span className="t-num text-ink-faint">0{p.n}</span>
                <div>
                  <h3 className="t-h3">{p.name}</h3>
                  <p className="t-meta mt-1">
                    {p.weeks}. {p.volumeN}, <em>{p.volume}</em>. ${p.budget}
                  </p>
                </div>
              </div>
              <p className="text-[15px] text-ink-muted md:col-span-4">{p.summary}</p>
              <p className="text-[15px] md:col-span-4">
                <span className="t-meta">Gate. </span>
                {p.gate}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Safety */}
      <section className="wrap pb-20">
        <div className="border border-keg-dim p-6 md:p-8">
          <p className="t-meta mb-4" style={{ color: "var(--keg)" }}>
            Four rules on every week
          </p>
          <ul className="grid gap-4 md:grid-cols-4">
            {safetyRules.map((r) => (
              <li key={r.rule}>
                <p className="font-semibold">{r.rule}</p>
                <p className="t-small mt-1 text-ink-muted">{r.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
