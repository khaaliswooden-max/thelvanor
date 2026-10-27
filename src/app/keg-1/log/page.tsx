import type { Metadata } from "next";
import Link from "next/link";
import { getLogEntries } from "@/lib/log";
import { StatusStrip } from "@/components/ui";

export const metadata: Metadata = {
  title: "Build log",
  description: "Keg-1 build log. Measurements by phase and step, claims under test, and the gap between estimate and actual.",
};

export default function LogPage() {
  const entries = getLogEntries();
  return (
    <>
      <section className="wrap border-b border-line py-16 md:py-24">
        <p className="t-meta mb-4">
          <Link className="link" href="/keg-1">Keg-1</Link>. Build log
        </p>
        <h1 className="t-h1">What the sensors said.</h1>
        <p className="t-lede mt-8">
          Entries are written when something is measured, bought, or decided. A datasheet is a claim; a
          multimeter reading is evidence. The two never share a column.
        </p>
      </section>

      <section className="wrap py-10">
        <StatusStrip />
      </section>

      <section className="wrap pb-20">
        {entries.length === 0 ? (
          <p className="t-meta">No entries yet.</p>
        ) : (
          <ol className="border-t border-line">
            {entries.map((e) => (
              <li key={e.slug} id={e.slug} className="grid gap-6 border-b border-line py-12 md:grid-cols-12 md:gap-10">
                <div className="md:col-span-4">
                  <p className="t-num t-meta">{e.date}</p>
                  <h2 className="t-h2 mt-2">{e.title}</h2>
                  <p className="t-meta mt-3">
                    Phase {e.phase}
                    {e.step ? `, step ${e.step}` : ""}
                  </p>
                  <p className="mt-4 text-[15px] text-ink-muted">{e.summary}</p>
                </div>
                <div className="prose md:col-span-8" dangerouslySetInnerHTML={{ __html: e.html }} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
