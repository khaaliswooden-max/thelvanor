import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/ui";

export const metadata: Metadata = {
  title: "Thesis",
  description:
    "Why Thelvanor, PBC exists: infrastructure that can be understood, measured, and owned by the people it serves.",
};

export default function Thesis() {
  return (
    <>
      <section className="wrap border-b border-line py-16 md:py-24">
        <p className="t-meta mb-4">Thesis. Draft public benefit statement, v0.1</p>
        <h1 className="t-h1 max-w-4xl">
          Infrastructure should be understandable by the people who depend on it.
        </h1>
        <p className="t-lede mt-8">
          Thelvanor, PBC is being formed to build a long-term stack of software, hardware, and services
          around one test: can an ordinary person, a school, or a town council read what the thing does, how
          much energy it uses, and what it costs, and check the numbers themselves?
        </p>
      </section>

      <section className="wrap py-20">
        <SectionHead title="The problem, in one paragraph.">
          <p>
            Data centers have become the industrial plants of the intelligence age, and their electricity
            demand is now a public question. U.S. data centers used about 4.4% of national electricity in
            2023, with projections of 6.7% to 12% by 2028. The decisions about where that power goes, what
            it buys, and who bears the cost are made at a scale and in a vocabulary most of the public cannot
            audit. That gap is a governance problem before it is an engineering one.
          </p>
        </SectionHead>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="wrap py-20">
          <SectionHead title="Three commitments.">
            <p>
              These are the public benefits the corporation will be chartered to pursue. They are written to
              be checked, not admired.
            </p>
          </SectionHead>
          <ol className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
            {[
              {
                t: "Measure before claiming.",
                b: "Every quantitative statement Thelvanor publishes carries an evidence grade: verified, plausible, or speculative. A datasheet is a claim. A measurement is evidence. The build log keeps them in separate columns.",
              },
              {
                t: "Publish in plain language.",
                b: "Designs, costs, and results are written so that a sixth grader can follow the first rung and a doctoral committee can argue with the last. Papers are open access. Code is open source.",
              },
              {
                t: "Build at a scale people can own.",
                b: "The first product is a data center that costs less than a used laptop, runs on one solar panel, and can be opened with a wrench. What a community can afford, it can also inspect.",
              },
            ].map((c, i) => (
              <li key={c.t} className="bg-surface p-6 md:p-8">
                <span className="t-num text-ink-faint">0{i + 1}</span>
                <h3 className="t-h3 mt-4">{c.t}</h3>
                <p className="mt-3 text-[15px] text-ink-muted">{c.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap py-20">
        <SectionHead title="Why a keg.">
          <p>
            Because it is the smallest sealed, weather-tight, thermally conductive enclosure that costs about
            $130 new, and because a bright orange keg on a stand in a field makes the question concrete.
            People ask what it is. The answer, a data center, and the follow-up, how much power does it use,
            is the conversation the company exists to have. The keg is a classroom first and a product second.
          </p>
          <p className="mt-4">
            What comes after Keg-1 is not decided and will not be announced before Keg-1 has data. The
            candidate research questions are on the <Link className="link" href="/research">research page</Link>.
          </p>
        </SectionHead>
      </section>

      <section className="wrap pb-20">
        <SectionHead title="What this page is not.">
          <p>
            It is not a product roadmap, a fundraising deck, or a forecast. Thelvanor has no revenue, no
            employees, and no measurements yet. The corporation is forming in Texas with a $500 formation
            budget. This statement will be revised when the charter is filed and again when the first phase
            closes. Version history lives in the{" "}
            <a className="link" href="https://github.com/khaaliswooden-max/thelvanor">
              repository
            </a>
            .
          </p>
        </SectionHead>
      </section>
    </>
  );
}
