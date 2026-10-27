import type { Metadata } from "next";
import { SectionHead } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Company",
  description: "Thelvanor, PBC: a public benefit corporation forming in Texas. Founder, structure, and how to reach us.",
};

export default function Company() {
  return (
    <>
      <section className="wrap border-b border-line py-16 md:py-24">
        <p className="t-meta mb-4">Company</p>
        <h1 className="t-h1 max-w-4xl">{site.legal}</h1>
        <p className="t-lede mt-8">
          A public benefit corporation forming in Texas. One founder, no employees, no revenue, and a
          $1,000 build budget. The scale is the point.
        </p>
      </section>

      <section className="wrap py-20">
        <SectionHead title="Structure.">
          <p>
            A public benefit corporation is a for-profit company whose charter names a public benefit and
            obliges the board to weigh it alongside shareholder return. Thelvanor is choosing the form
            before it has anything to sell so that the measure-before-claiming rule is written into the
            charter rather than into a marketing page. Formation budget: $500. Status: forming.
          </p>
        </SectionHead>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="wrap py-20">
          <SectionHead title="Founder.">
            <p className="font-semibold">{site.founder}</p>
            <p className="mt-2">
              Learning professional with a background in federal acquisition, compliance, and IT
              infrastructure. U.S. Army veteran. MBA; completing an M.S. in Information Technology ahead of
              doctoral study in engineering management. About two years into the technical domain, and
              building Keg-1 to learn energy, compute, and data centers from first principles, in public.
            </p>
            <ul className="mt-6 space-y-2 text-[15px]">
              <li>
                <a className="link" href={`https://orcid.org/${site.orcid}`}>ORCID {site.orcid}</a>
              </li>
              <li>
                <a className="link" href={site.preprint.url}>Preprint on SSRN</a>
              </li>
              <li>
                <a className="link" href="https://github.com/khaaliswooden-max">GitHub</a>
              </li>
            </ul>
          </SectionHead>
        </div>
      </section>

      <section className="wrap py-20">
        <SectionHead title="Contact.">
          <p>
            For research correspondence, replication, or partnership on the measurement phases:{" "}
            <a className="link" href={`mailto:${site.email}`}>{site.email}</a>. For code, issues, and the
            site itself: <a className="link" href={site.github}>the repository</a>.
          </p>
        </SectionHead>
      </section>
    </>
  );
}
