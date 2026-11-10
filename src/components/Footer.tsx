import Link from "next/link";
import { navigation,site,status } from "@/content/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <h2 className="t-meta mb-6">Company</h2>
          <p className="t-h3">{site.legal}</p>
          <p className="mt-4">{site.tagline}</p>
          <Link className="link mt-6 inline-block" href="/company">About the company</Link>
        </div>
        <nav aria-label="Footer">
          <h2 className="t-meta mb-6">Site</h2>
          <ul className="space-y-3">
            {navigation.map((item) => (
              <li key={item.href}><Link className="link" href={item.href}>{item.label}</Link></li>
            ))}
            <li><Link className="link" href="/keg-1/log">Build log</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="t-meta mb-6">Elsewhere</h2>
          <ul className="space-y-3">
            <li><a className="link" href={site.preprint.url}>Preprint on SSRN</a></li>
            <li><a className="link" href={site.github}>Source on GitHub</a></li>
            <li><a className="link" href={`https://orcid.org/${site.orcid}`}>ORCID {site.orcid}</a></li>
            <li><a className="link" href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="t-meta mb-6">Status</h2>
          <p className="t-h3">Phase {status.phase}</p>
          <p className="mt-3">{status.phaseName}</p>
          <p className="t-meta mt-6">As of <time dateTime={status.asOf}>{status.asOf}</time></p>
          <p className="t-meta mt-3">{status.measurements} measurements logged</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="wrap t-meta">© 2026 {site.legal}. Papers {site.preprint.license}. Code MIT.</p>
      </div>
    </footer>
  );
}
