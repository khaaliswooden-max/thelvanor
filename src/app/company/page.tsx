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
        <p className="t-kicker mb-6">Company</p>
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

      <section className="band-grey border-y border-line">
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

          <figure className="mt-14 grid gap-4 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-3">
              <p className="t-kicker md:pt-1">Film · 3:00</p>
            </div>
            <div className="md:col-span-9">
              <video
                className="block aspect-video w-full border border-line bg-[#121316]"
                controls
                playsInline
                preload="metadata"
                poster="/media/thelvanor-about-the-founder-poster.jpg"
                aria-describedby="founder-film-caption"
              >
                <source src="/media/thelvanor-about-the-founder.mp4" type="video/mp4" />
                <a className="link" href="/media/thelvanor-about-the-founder.mp4">Download the film (MP4)</a>
              </video>
              <figcaption id="founder-film-caption" className="mt-3 text-[15px] text-ink-muted">
                About the founder. Thirty years inside complex systems, from Army medical supply to federal
                capture, and why that leads to a data center in a keg. All narration is on screen.
              </figcaption>
            </div>
          </figure>
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
