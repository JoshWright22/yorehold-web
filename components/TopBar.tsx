"use client";

// The fixed bar at the top of every page. On a phone the links, search and account fold into a
// menu that closes again whenever the page changes.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavSession from "./NavSession";

const links = [
  { href: "/library", label: "Library" },
  { href: "/compendium", label: "Compendium" },
  { href: "/play", label: "Play" },
  { href: "/forums", label: "Forums" },
  { href: "/canon", label: "Canon" },
  { href: "/docs", label: "Docs" },
];

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu after moving to another page.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            Y
          </span>
          Yorehold
        </Link>
        <button
          type="button"
          className="menu-button"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <span className="burger" aria-hidden="true" />
        </button>
        <div id="site-menu" className={open ? "top-menu open" : "top-menu"}>
          <nav aria-label="Main">
            <ul className="top-links">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <li key={link.href}>
                    <Link href={link.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <form method="get" action="/library" className="top-search" role="search">
            <label className="sr-only" htmlFor="top-search">
              Search the library
            </label>
            <input id="top-search" type="search" name="q" placeholder="Search the library" maxLength={100} />
          </form>
          <NavSession />
        </div>
      </div>
    </header>
  );
}
