import Link from "next/link";
import { Mark } from "./Mark";

const links = [
  { href: "/thesis", label: "Thesis" },
  { href: "/keg-1", label: "Keg-1" },
  { href: "/research", label: "Research" },
  { href: "/company", label: "Company" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur">
      <div className="wrap flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Thelvanor home">
          <Mark className="h-6 w-6" />
          <span className="hidden text-[15px] font-semibold tracking-tight sm:inline" style={{ fontStretch: "90%" }}>
            Thelvanor
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-4 text-[14px] sm:gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-ink-muted transition-colors duration-150 hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
