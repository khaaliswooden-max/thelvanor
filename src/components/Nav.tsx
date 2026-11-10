"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/content/site";
import { Mark } from "./Mark";

// Slim sticky header, 56px, logo left, four links right, hairline bottom
// border, black with backdrop blur. On desktop, hovering or focusing a link
// opens a full-width mega-panel below the bar: a two-column description of
// that section, rendered from the nav structure in site.ts.
export function Nav() {
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // Close the panel on navigation (render-phase derived state, no effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const show = (href: string) => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(href);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(null), 120);
  };
  const active = nav.find((n) => n.href === open) ?? null;

  return (
    <header
      className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur"
      onMouseLeave={hide}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(null);
      }}
    >
      <div className="wrap flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3" aria-label="Thelvanor home" onFocus={hide}>
          <Mark className="h-5 w-5" />
          <span
            className="hidden text-[15px] font-semibold tracking-tight sm:inline"
            style={{ fontStretch: "92%" }}
          >
            Thelvanor
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-3 text-[12px] sm:gap-8 sm:text-[14px]">
            {nav.map((item) => {
              const current =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href} onMouseEnter={() => show(item.href)}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    aria-expanded={open === item.href}
                    onFocus={() => show(item.href)}
                    className={`transition-colors duration-[120ms] ${
                      current ? "text-ink" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      {/* Mega-panel, desktop only. Mobile keeps the bare links, no hamburger. */}
      <div
        className={`absolute inset-x-0 top-full hidden border-b border-line bg-ground/90 backdrop-blur transition-opacity duration-[120ms] md:block ${
          active ? "opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
        onMouseEnter={() => active && show(active.href)}
      >
        {active && (
          <div className="wrap grid gap-8 py-10 md:grid-cols-12">
            <p className="max-w-md text-[15px] leading-relaxed text-ink-muted md:col-span-5">
              {active.blurb}
            </p>
            <ul className="space-y-3 md:col-span-7">
              {active.links.map((l) => (
                <li key={l.href + l.label} className="flex flex-wrap items-baseline gap-x-4">
                  {l.href.startsWith("http") || l.href.startsWith("mailto:") ? (
                    <a className="link text-[15px]" href={l.href}>
                      {l.label}
                    </a>
                  ) : (
                    <Link className="link text-[15px]" href={l.href}>
                      {l.label}
                    </Link>
                  )}
                  <span className="t-meta">{l.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
