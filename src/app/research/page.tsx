import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/ui";
import { researchQuestions, site, volumes } from "@/content/site";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Thelvanor research: the Keg-1 pre-build preprint, three candidate research questions, and the learning-ladder series.",
};

export default function Research() {
  return (
    <>
      <section className="wrap border-b border-line py-16 md:py-24">
        <p className="t-meta mb-4">Research</p>
        <h1 className="t-h1 max-w-4xl">Falsifiable on purpose.</h1>
        <p className="t-lede mt-8">
          Every number in the pre-build paper is a prediction with a grade attached. The build log will show
          which survived. Papers are open access under CC BY 4.0.
        </p>
      </section>

      {/* Preprint */}
      <section className="wrap py-20">
        <SectionHead kicker="Preprint" title={site.preprint.title}>
          <p className="t-meta">
            {site.founder}. {site.preprint.venue}, {site.preprint.date}. {site.preprint.id}. {site.preprint.license}.
          </p>
          <p className="mt-4">
            Documents the design on the day before the first part is unboxed: the power path, a planning
            energy model for a 256 Wh battery feeding three nodes through independently fused branches, a
            phased bill of materials under a $1,000 ceiling, the sensor plan that converts every claim into a
            measurement, and a sixteen-week schedule mapped to a five-rung learning ladder. The model finds
            that night-time scheduling, not panel size, is the governing design problem.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={site.preprint.url} className="btn btn-keg">
              Read on SSRN
            </a>
            <Link href="/keg-1" className="btn">
              See the design
            </Link>
          </div>
        </SectionHead>
      </section>

      {/* RQs */}
      <section className="border-y border-line bg-surface">
        <div className="wrap py-20">
          <SectionHead title="Three candidate research questions.">
            <p>
              Stated now so the measurement phases are designed to answer them, not merely to finish the
              build. A fourth, methodological question sits above these: whether a provable admission
              invariant for the scheduler, stored energy never crosses the reserve, can be written,
              mechanically checked, and then falsified or confirmed against a week of logged data.
            </p>
          </SectionHead>
          <ol className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
            {researchQuestions.map((q) => (
              <li key={q.id} className="bg-surface p-6 md:p-8">
                <span className="t-num text-ink-faint">{q.id}</span>
                <h3 className="t-h3 mt-4">{q.title}</h3>
                <p className="mt-3 text-[15px] text-ink-muted">{q.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ladders */}
      <section className="wrap py-20">
        <SectionHead title="The learning ladders.">
          <p>
            Each volume climbs five rungs, sixth grade to doctoral, and each rung ends on the bench with a
            measurement. The first series is the build&rsquo;s curriculum. The second treats the shared battery as
            a game among three self-interested nodes. The third is written for the people who fund and
            direct such systems. Volumes are published as they finish; links appear here when they do.
          </p>
        </SectionHead>
        <div className="mt-12 space-y-12">
          {volumes.map((s) => (
            <div key={s.series}>
              <h3 className="t-h3 border-b border-line-strong pb-3">{s.series}</h3>
              <ul className="divide-y divide-line">
                {s.items.map((v) => (
                  <li key={v.n + v.title} className="grid gap-1 py-4 sm:grid-cols-12 sm:gap-6">
                    <span className="t-num t-meta sm:col-span-2">{v.n}</span>
                    <span className="font-semibold sm:col-span-3">{v.title}</span>
                    <span className="text-[15px] text-ink-muted sm:col-span-5">{v.sub}</span>
                    <span className="t-meta sm:col-span-2 sm:text-right">
                      {v.phase ? `Phase ${v.phase}` : "Companion"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
