import Link from "next/link";
import { KegDrawing } from "@/components/KegDrawing";
import { GradeTag, SectionHead, StatusStrip } from "@/components/ui";
import { claims, heroStats, site, status } from "@/content/site";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="wrap grid gap-10 py-16 md:min-h-[84vh] md:grid-cols-12 md:items-center md:py-24">
          <div className="md:col-span-7">
            <p className="t-meta mb-6 flex items-center gap-3 text-ink-muted">
              <span className="inline-block h-px w-8 bg-line" aria-hidden="true" />
              {site.legal} · Phase {status.phase}, {status.phaseName.toLowerCase()}
            </p>
            <h1 className="t-display">
              A data center
              <br />
              the size of
              <br />a beer keg.
            </h1>
            <p className="t-lede mt-8 max-w-xl">
              Three Raspberry Pi 5 nodes, a gigabit switch, and a solar charge
              loop, sealed in a five-gallon cornelius keg and deployed off-grid
              in Texas. Built to be measured, not marketed.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/keg-1" className="btn-keg">
                See Keg-1
              </Link>
              <Link href="/thesis" className="btn-ghost">
                Read the thesis
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <KegDrawing className="mx-auto w-full max-w-sm" animate />
            <p className="t-meta mt-4 text-center text-ink-muted">
              Keg-1 cross-section · drawn to scale
            </p>
          </div>
        </div>
      </section>

      {/* Status strip */}
      <section className="border-b border-line">
        <div className="wrap">
          <StatusStrip stats={heroStats} />
        </div>
      </section>

      {/* What it is */}
      <section className="border-b border-line">
        <div className="wrap py-24">
          <SectionHead
            kicker="What it is"
            title="An instrument before it is a product."
            lede="Keg-1 exists to answer one question honestly: how much useful computation can run on how little power, sealed against weather, at a price a hobbyist can verify? Every number on this site is either measured, estimated with its basis shown, or labeled speculation. The moment a measurement exists, it replaces the estimate."
          />
          <div className="mt-16 grid gap-px border border-line bg-line md:grid-cols-3">
            {[
              {
                h: "Sealed",
                p: "IP68 glands, indicating silica gel, and a pressure-relief valve. The keg is the enclosure and the heatsink; nothing inside moves air.",
              },
              {
                h: "Solar-only",
                p: "A 100 W panel on a tilt doubles as a sunshade. A 384 Wh LiFePO₄ buffer carries the cluster through the night and the worst month of the year.",
              },
              {
                h: "Public",
                p: "The BOM has links and receipts. The preprint has the arithmetic. The log gets every measurement as it lands, including the embarrassing ones.",
              },
            ].map((c) => (
              <div key={c.h} className="bg-ground p-8">
                <h3 className="t-h3">{c.h}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                  {c.p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claims preview */}
      <section className="border-b border-line">
        <div className="wrap py-24">
          <SectionHead
            kicker="Claims"
            title="Five claims, each with a grade."
            lede="Verified means measured or receipted. Plausible means arithmetic from cited inputs. Speculative means we believe it and cannot yet show it. The measured column is empty on purpose."
          />
          <div className="mt-16 overflow-x-auto">
            <table className="data">
              <thead>
                <tr>
                  <th>Claim</th>
                  <th>Estimate</th>
                  <th>Measured</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.claim}>
                    <td className="max-w-md">{c.claim}</td>
                    <td className="whitespace-nowrap">{c.estimate}</td>
                    <td className="whitespace-nowrap text-ink-muted">
                      {c.measured}
                    </td>
                    <td>
                      <GradeTag grade={c.grade} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="t-meta mt-6 text-ink-muted">
            Full basis for each row lives on the{" "}
            <Link href="/thesis" className="link">
              thesis page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Safety note */}
      <section className="border-b border-line">
        <div className="wrap py-24">
          <div className="grid gap-8 border border-line p-8 md:grid-cols-12 md:p-12">
            <div className="md:col-span-4">
              <p className="t-meta text-ink-muted">A note on pressure</p>
              <h2 className="t-h2 mt-4">The keg is a pressure vessel. We treat it like one.</h2>
            </div>
            <div className="md:col-span-8">
              <p className="t-body text-ink-muted">
                Cornelius kegs are rated for carbonated-beverage service well
                above anything Keg-1 will see, but heat plus a sealed vessel
                deserves respect. Keg-1 runs a pressure-relief valve, vents
                through its glands before it ever approaches rating, and is
                never modified by welding or drilling into the pressure wall.
                The build log records internal pressure alongside temperature.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
