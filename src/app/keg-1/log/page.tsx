import type { Metadata } from "next";
import Link from "next/link";
import { getLogEntries } from "@/lib/log";
import { StatusStrip } from "@/components/ui";

export const metadata: Metadata={
  title: "Build log",
  description: "Keg-1 build log. Measurements by phase and step, claims under test, and the gap between estimate and actual.",
};

export default function LogPage() {
  const entries=getLogEntries();
  return (
    <>
      <section className="section page-intro">
        <div className="wrap">
          <p className="t-meta mb-4">
            <Link className="link" href="/keg-1">Keg-1</Link>. Build log
          </p>
          <h1 className="t-h1">What the sensors said.</h1>
          <p className="t-lede mt-8">
            Entries are written when something is measured, bought, or decided. A datasheet is a claim; a
            multimeter reading is evidence. The two never share a column.
          </p>
        </div>
      </section>

      <section className="section status-section">
        <div className="wrap">
          <StatusStrip />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {entries.length===0? (
            <p className="t-meta">No entries yet.</p>
          ):(
            <ol className="border-t border-line">
              {entries.map((e) => (
                <li key={e.slug} id={e.slug} className="spec-row">
                  <div className="section-heading">
                    <p className="t-num t-meta">{e.date}</p>
                    <h2 className="t-h2 mt-2">{e.title}</h2>
                    <p className="t-meta mt-3">
                      Phase {e.phase}
                      {e.step? `, step ${e.step}`:""}
                    </p>
                    <p className="mt-4 text-[17px] text-ink-muted">{e.summary}</p>
                  </div>
                  <div className="prose section-copy" dangerouslySetInnerHTML={{ __html: e.html }} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
