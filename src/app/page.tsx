import Image from "next/image";
import Link from "next/link";
import { HeroExhibit } from "@/components/HeroExhibit";
import { NightChart } from "@/components/NightChart";
import { GradeTag, SectionHead, StatusStrip } from "@/components/ui";
import { energyModel as m, phases, safetyRules, site, status } from "@/content/site";

// The Keg-1 exhibit is a static app under /public/sims. It draws its day from the same
// planning numbers this page prints, passed in here, so the two cannot drift apart.
const EXHIBIT = "/sims/keg1-exhibit/index.html";
const exhibitModel = new URLSearchParams({
  wh: String(m.nominalWh),
  reserve: String(m.reserveWh),
  idle: String(m.idleW),
  full: String(m.fullW),
}).toString();

const domains = [
  {
    k: "Energy",
    sub: "256 Wh · 12.8 V × 20 Ah LiFePO₄, 80% usable",
    body: "A 100 W panel that is also the sunshade feeds an MPPT controller, then a fused 12 V bus with five branches, one per node, one for the switch, one spare.",
    grade: "plausible" as const,
  },
  {
    k: "Compute",
    sub: "3 × Pi 5 · 1 GB each, wired gigabit, no Wi-Fi",
    body: "A steel keg is a Faraday cage. Nodes talk over a five-port switch; one outdoor Cat6 leaves through an IP68 bulkhead. Node 1 hosts the sensors and the log.",
    grade: "verified" as const,
  },
  {
    k: "Hall",
    sub: "0.50 m² · stainless shell, fanless",
    body: "Each SoC conducts into a 3 mm aluminum plate bolted to the keg wall. The shell is the radiator. The bet is that passive conduction is enough for three nodes.",
    grade: "speculative" as const,
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="wrap pt-20 pb-14 md:pt-28">
        <p className="t-kicker mb-6">Thelvanor, PBC · forming in Texas</p>
        <h1 className="t-display max-w-4xl">A data center the size of a keg.</h1>
        <p className="t-lede mt-8">
          Three Raspberry Pi 5 nodes, one 100 W solar panel, one 256 Wh battery, sealed in a stainless keg
          painted safety orange. Built for under $1,000. Instrumented so every design claim becomes a
          measurement, then published.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/keg-1" className="btn btn-solid">
            See Keg-1
          </Link>
          <a href={site.preprint.url} className="btn">
            Read the preprint
          </a>
        </div>
      </section>

      {/* Hero exhibit: a still frame first, then the interactive model once the page is idle */}
      <figure>
        <HeroExhibit
          src={`${EXHIBIT}?mode=hero&${exhibitModel}`}
          poster="/images/keg1-exhibit-poster.jpg"
          title="Interactive 3D model of Keg-1. Drag to orbit, select a part to inspect it."
          alt="Illustrative 3D model of Keg-1: three Raspberry Pi 5 boards stacked inside a translucent orange keg under a 100 W solar panel on four legs, with the MPPT controller, main fuse, and battery beside it."
        />
        <figcaption className="wrap flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="t-kicker text-ink-muted">
            Illustrative model · drawing rev C geometry · not yet built · nothing shown is measured
          </span>
          <a href={`${EXHIBIT}?${exhibitModel}`} className="btn shrink-0 self-start sm:self-auto">
            Open the full exhibit
          </a>
        </figcaption>
      </figure>

      {/* Status */}
      <section className="wrap">
        <StatusStrip />
        <div className="flex flex-col gap-2 py-4 sm:flex-row sm:justify-between">
          <span className="t-kicker">As of {status.asOf}</span>
          <span className="t-kicker">Next gate · node 1 runs from the fused bus</span>
        </div>
      </section>

      {/* Thesis */}
      <section className="wrap py-24">
        <SectionHead kicker="The thesis" title="Small on purpose. Cheap on purpose. Instrumented on purpose.">
          <p>
            The questions that matter about data centers, how energy becomes computation, how heat leaves a
            sealed box, how a shared power budget is split among competing loads, are usually studied at the
            scale of a warehouse. They can be studied at the scale of a keg. Keg-1 is not built for
            throughput. It is built so that every abstraction in a data-center curriculum ends in a number
            read on a $25 multimeter.
          </p>
        </SectionHead>
      </section>

      {/* Three domains */}
      <section className="border-t border-line">
        <div className="wrap py-24">
          <SectionHead kicker="Vol. I–III · the system" title="Three domains, each one measured." />
          <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
            {domains.map((c, i) => (
              <li key={c.k} className={i === 0 ? "" : "md:pl-10"}>
                <GradeTag g={c.grade} />
                <h3 className="t-h3 mt-4">{c.k}</h3>
                <p className="t-kicker mt-2">{c.sub}</p>
                <p className="t-small mt-5 text-ink-muted">{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Governing problem, dark band */}
      <section className="band-dark">
        <div className="wrap py-28">
          <p className="t-kicker mb-6">The governing problem</p>
          <h2 className="t-h1 max-w-3xl">The scheduler, not the panel, is the design.</h2>
          <p className="t-body mt-8">
            Over a 14-hour winter night three idle nodes draw about {m.nightIdleWh} Wh and finish the night
            with roughly {m.marginWh} Wh above the reserve. Three nodes at full load would need {m.nightFullWh}{" "}
            Wh, which the battery does not hold. Night compute must be scheduled against a {m.marginWh} Wh
            margin, about six node-hours of full load. Every input here is a pre-build estimate. The first
            overnight log redraws the lines.
          </p>
          <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-10">
            <NightChart />
            <figure>
              <div className="relative aspect-square w-full overflow-hidden bg-surface">
                <Image
                  src="/images/keg1-cad-cutaway.jpg"
                  alt="CAD cutaway of Keg-1 showing three Raspberry Pi 5 boards on the internal plate, the switch, wiring to the lid, and the power plant outside the keg."
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="t-kicker mt-4">
                CAD cutaway, rev C. Interactive model and exploded drawing on{" "}
                <Link href="/keg-1#model" className="link normal-case tracking-normal">
                  Keg-1
                </Link>
                .
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="wrap py-24">
        <SectionHead kicker="The build" title="Four phases. Four volumes. One gate each.">
          <p>
            Parts are bought when their chapter is being studied. A phase ends only when its bench test
            passes. The curriculum, <em>Poles, Chips, and Halls</em>, climbs five rungs in each domain, from
            sixth grade to doctoral research questions, and each rung ends on the bench.
          </p>
        </SectionHead>
        <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-0 md:divide-x md:divide-line">
          {phases.map((p, i) => (
            <li key={p.n} className={i === 0 ? "" : "md:pl-8"}>
              <p className="t-kicker">
                0{p.n} · {p.name}
              </p>
              <p className="t-kicker mt-2 text-ink-faint">
                {p.weeks} · {p.volumeN}, {p.volume}
              </p>
              <p className="t-num mt-5 text-3xl">${p.budget}</p>
              <p className="t-small mt-3 text-ink-muted">{p.summary}</p>
              <div className="mt-6 border-t border-line pt-5">
                <p className="t-kicker-gate">Gate</p>
                <p className="t-small mt-3">{p.gate}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Rules, grey band */}
      <section className="band-grey">
        <div className="wrap py-24">
          <SectionHead kicker="Field rules" title="Four rules on every week." />
          <ul className="mt-12 grid border border-line bg-ground sm:grid-cols-2">
            {safetyRules.map((r, i) => (
              <li
                key={r.rule}
                className={`p-8 ${i % 2 === 1 ? "sm:border-l sm:border-line" : ""} ${i >= 2 ? "border-t border-line" : i === 1 ? "border-t border-line sm:border-t-0" : ""}`}
              >
                <p className="t-kicker-gate">R.{i + 1}</p>
                <p className="t-h3 mt-4">{r.rule}</p>
                <p className="t-small mt-3 text-ink-muted">{r.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing band */}
      <section className="band-dark">
        <div className="wrap py-32 text-center">
          <p className="t-kicker mb-8">Thelvanor, PBC</p>
          <h2 className="t-h1 mx-auto max-w-3xl">Built as an instrument. Published as it is measured.</h2>
          <p className="t-lede mx-auto mt-8 text-center">
            A public benefit corporation forming in Texas. A sub-$1,000 solar data center in a stainless keg.
          </p>
          <div className="mt-12">
            <a href={site.preprint.url} className="btn" style={{ background: "var(--dark-ink)", color: "var(--dark)", borderColor: "var(--dark-ink)" }}>
              Read the preprint
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
