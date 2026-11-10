"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { navigation } from "@/content/site";
import { Mark } from "./Mark";

export function Nav({ items, name }: { items: typeof navigation; name: string }) {
  const pathname = usePathname();
  const [active, setActive] = useState<{ href: string; pathname: string } | null>(null);
  const header = useRef<HTMLElement>(null);
  const open = active?.pathname === pathname ? active.href : null;
  const canExpand = () => window.matchMedia("(min-width: 768px) and (hover: hover)").matches;

  function closePanel(restoreFocus = false) {
    if (restoreFocus && open) {
      header.current?.querySelector<HTMLAnchorElement>(`a[data-trigger="${open}"]`)?.focus();
    }
    setActive(null);
  }

  return (
    <header
      ref={header}
      className="site-header"
      onMouseLeave={() => {
        if (!header.current?.contains(document.activeElement)) closePanel();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closePanel();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          closePanel(true);
        }
      }}
    >
      <div className="wrap nav-bar">
        <Link href="/" className="brand" aria-label={`${name} home`} onClick={() => closePanel()}>
          <Mark className="h-6 w-6" />
          <span>{name}</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="nav-links">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-trigger={item.href}
                  className="nav-link"
                  aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
                  aria-expanded={open === item.href}
                  aria-controls={`nav-${item.label.toLowerCase()}`}
                  onMouseEnter={() => {
                    if (canExpand()) setActive({ href: item.href, pathname });
                  }}
                  onFocus={() => {
                    if (canExpand()) setActive({ href: item.href, pathname });
                  }}
                  onClick={() => closePanel()}
                >
                  {item.label}
                </Link>
                <div
                  id={`nav-${item.label.toLowerCase()}`}
                  className="nav-panel"
                  hidden={open !== item.href}
                >
                  <div className="wrap section-head">
                    <div className="section-heading">
                      <p className="t-meta mb-4">{item.label}</p>
                      <p className="t-h2">{item.title}</p>
                    </div>
                    <div className="section-copy">
                      <p>{item.description}</p>
                      <p className="t-meta mt-6">{item.detail}</p>
                      <div className="mt-6 flex flex-wrap gap-6">
                        <Link className="link" href={item.href} onClick={() => closePanel()}>
                          Explore {item.label} <span aria-hidden="true">↗</span>
                        </Link>
                        <Link className="link" href={item.related.href} onClick={() => closePanel()}>
                          {item.related.label} <span aria-hidden="true">↗</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
