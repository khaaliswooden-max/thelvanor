import Link from "next/link";
import { site, status } from "@/content/site";
import { Wordmark } from "@/components/Wordmark";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="wrap grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Wordmark className="block h-[15px] w-auto" />
          <p className="t-small mt-3 max-w-xs text-ink-muted">
            A sub-$1,000 solar data center in a stainless keg, built as an instrument and published as it
            is measured.
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="t-kicker mb-4">Site</p>
          <ul className="space-y-2 text-[14px]">
            <li><Link className="link" href="/thesis">Thesis</Link></li>
            <li><Link className="link" href="/keg-1">Keg-1</Link></li>
            <li><Link className="link" href="/keg-1/log">Build log</Link></li>
            <li><Link className="link" href="/research">Research</Link></li>
            <li><Link className="link" href="/company">Company</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="t-kicker mb-4">Elsewhere</p>
          <ul className="space-y-2 text-[14px]">
            <li><a className="link" href={site.preprint.url}>Preprint on SSRN</a></li>
            <li><a className="link" href={site.github}>Source on GitHub</a></li>
            <li><a className="link" href={`https://orcid.org/${site.orcid}`}>ORCID {site.orcid}</a></li>
            <li><a className="link" href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="t-kicker mb-4">Status</p>
          <p className="text-[14px] font-medium">
            Phase {status.phase}, {status.phaseName.toLowerCase()}
          </p>
          <p className="t-small mt-2 text-ink-muted">{status.nextStep}</p>
        </div>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-line py-5 sm:flex-row sm:justify-between">
        <span className="t-kicker">© 2026 {site.legal}. Papers CC BY 4.0. Code MIT.</span>
        <span className="t-kicker">Phase {status.phase}, as of {status.asOf}</span>
      </div>
    </footer>
  );
}
