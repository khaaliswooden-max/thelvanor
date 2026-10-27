import Link from "next/link";
import { site, status } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="wrap grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="t-h3">{site.legal}</p>
          <p className="t-meta mt-2 max-w-sm">
            A public benefit corporation forming in Texas. A sub-$1,000 solar data center in a
            stainless keg, built as an instrument and published as it is measured.
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="t-meta mb-3">Site</p>
          <ul className="space-y-2 text-[15px]">
            <li><Link className="link" href="/thesis">Thesis</Link></li>
            <li><Link className="link" href="/keg-1">Keg-1</Link></li>
            <li><Link className="link" href="/keg-1/log">Build log</Link></li>
            <li><Link className="link" href="/research">Research</Link></li>
            <li><Link className="link" href="/company">Company</Link></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="t-meta mb-3">Elsewhere</p>
          <ul className="space-y-2 text-[15px]">
            <li><a className="link" href={site.preprint.url}>Preprint on SSRN</a></li>
            <li><a className="link" href={site.github}>Source on GitHub</a></li>
            <li><a className="link" href={`https://orcid.org/${site.orcid}`}>ORCID {site.orcid}</a></li>
            <li><a className="link" href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-line py-5 text-[13px] text-ink-faint sm:flex-row sm:justify-between">
        <span>© 2026 {site.legal}. Papers CC BY 4.0. Code MIT.</span>
        <span className="t-num">
          Phase {status.phase} as of {status.asOf}
        </span>
      </div>
    </footer>
  );
}
