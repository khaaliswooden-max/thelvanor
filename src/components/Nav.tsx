import Link from "next/link";
import { site } from "@/content/site";

const links = [
  { href: "/thesis", label: "Thesis" },
  { href: "/keg-1", label: "Keg-1" },
  { href: "/research", label: "Research" },
  { href: "/company", label: "Company" },
];

export function Nav() {
  return (
    <header
      className="sticky top-0 z-40 bg-ground/92 backdrop-blur"
      style={{ borderBottom: "2px solid var(--rule)" }}
    >
      <div className="wrap flex h-16 items-center justify-between">
        <div className="flex items-center gap-8 sm:gap-10">
          <Link href="/" className="text-[15px] font-medium tracking-tight" aria-label="Thelvanor home">
            Thelvanor
          </Link>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-4 sm:gap-6">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="t-kicker transition-colors duration-150 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="hidden sm:block">
          <a href={site.preprint.url} className="btn btn-solid">
            Read the preprint
          </a>
        </div>
      </div>
    </header>
  );
}
