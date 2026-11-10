import Link from "next/link";
import { site, status } from "@/content/site";

// Four columns on the hairline grid: company, site, elsewhere, status.
// Status reads the build phase and as-of date from site.ts.
export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="wrap grid grid-cols-2 gap-y-10 py-12 md:grid-cols-12 md:gap-y-0">
        <div className="col-span-2 md:col-span-3 md:pr-8">
          <p className="t-meta mb-3">Company</p>
          <p className="font-semibold">{site.legal}</p>
          <p className="t-meta mt-2 max-w-xs">
            A public benefit corporation forming in Texas. A sub-$1,000 solar data center in a stainless keg,
            built as an instrument and published as it is measured.
          </p>
        </div>
        <div className="md:col-span-3 md:border-l md:border-line md:pl-8">
          <p className="t-meta mb-3">Site</p>
          <ul className="space-y-2 text-[15px]">
            <li><Link className="link" href="/thesis">Thesis</Link></li>
            <li><Link className="link" href="/keg-1">Keg-1</Link></li>
            <li><Link className="link" href="/keg-1/log">Build log</Link></li>
            <li><Link className="link" href="/research">Research</Link></li>
            <li><Link className="link" href="/company">Company</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3 md:border-l md:border-line md:pl-8">
          <p className="t-meta mb-3">Elsewhere</p>
          <ul className="space-y-2 text-[15px]">
            <li><a className="link" href={site.preprint.url}>Preprint on SSRN</a></li>
            <li><a className="link" href={site.github}>Source on GitHub</a></li>
            <li><a className="link" href={`https://orcid.org/${site.orcid}`}>ORCID {site.orcid}</a></li>
            <li><a className="link" href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>
        <div className="md:col-span-3 md:border-l md:border-line md:pl-8">
          <p className="t-meta mb-3">Status</p>
          <dl className="space-y-2 text-[15px]">
            <div>
              <dt className="t-meta">Build phase</dt>
              <dd className="t-num">
                Phase {status.phase}. {status.phaseName}
              </dd>
            </div>
            <div>
              <dt className="t-meta">As of</dt>
              <dd className="t-num">{status.asOf}</dd>
            </div>
            <div>
              <dt className="t-meta">Measurements logged</dt>
              <dd className="t-num">{status.measurements}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-5 text-[13px] text-ink-faint sm:flex-row sm:justify-between">
          <span>© 2026 {site.legal}. Papers CC BY 4.0. Code MIT.</span>
          <span className="t-num">
            Phase {status.phase} as of {status.asOf}
          </span>
        </div>
      </div>
    </footer>
  );
}
