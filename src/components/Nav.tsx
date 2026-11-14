import Link from "next/link";
import { site } from "@/content/site";
import { Wordmark } from "@/components/Wordmark";

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
        <div className="flex items-center gap-5 sm:gap-10">
          <Link href="/" className="block py-2" aria-label="Thelvanor home">
            <Wordmark className="block h-[10px] w-auto sm:h-[13px]" title="Thelvanor" />
          </Link>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-2 min-[380px]:gap-3 sm:gap-6">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="t-kicker whitespace-nowrap transition-colors duration-150 hover:text-ink">
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
