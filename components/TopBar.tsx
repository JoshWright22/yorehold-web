"use client";

// The bar at the top of every page. Each heading opens a list of everything under it when it is
// pointed at or reached by keyboard. On a phone the headings, search and account fold into one
// menu with every list laid open, and it closes again whenever the page changes.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavSession from "./NavSession";

interface Entry {
  href: string;
  label: string;
  // What the entry is, in a few words.
  note: string;
}

// Split by who is reading: the rules everyone plays by, what a player looks things up in, and
// what someone writing content needs. Pressing a heading goes to its first entry.
const groups: { label: string; entries: Entry[] }[] = [
  {
    label: "Rules",
    entries: [
      { href: "/library?kind=ruleset", label: "Rulesets", note: "Shared and house rules" },
      { href: "/canon", label: "Canon", note: "What is up for review" },
    ],
  },
  {
    label: "Players",
    entries: [
      { href: "/play", label: "Play", note: "In the browser, or download" },
      { href: "/library?kind=adventure", label: "Adventures", note: "Written by players" },
      { href: "/compendium/classes", label: "Classes", note: "Features level by level" },
      { href: "/compendium/spells", label: "Spells", note: "Every spell list" },
      { href: "/compendium/items", label: "Items", note: "Weapons, armour and gear" },
    ],
  },
  {
    label: "Designers",
    entries: [
      { href: "/docs", label: "Format docs", note: "How content files are written" },
      { href: "/compendium/creatures", label: "Creatures", note: "Stat blocks and behaviour" },
      { href: "/compendium/chapters", label: "Chapters", note: "The game's own, as examples" },
      { href: "/library?kind=definitions", label: "Definitions", note: "Homebrew packs to build on" },
      { href: "/compendium/skins", label: "Skins", note: "Looks for the game" },
    ],
  },
  {
    label: "Community",
    entries: [
      { href: "/library", label: "Library", note: "Everything published" },
      { href: "/forums", label: "Forums", note: "Not open yet" },
    ],
  },
];

// An entry with a query shares its page with others, so only a plain address can claim a page.
function claims(entry: Entry, pathname: string): boolean {
  if (entry.href.includes("?")) return false;
  return pathname === entry.href || pathname.startsWith(entry.href + "/");
}

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // After an entry is pressed the lists stay shut until the pointer leaves the bar, so the one
  // just used does not hang over the new page.
  const [shut, setShut] = useState(false);
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

  function pressed() {
    setShut(true);
    setOpen(false);
    // Focus would hold the list open just as the pointer does.
    (document.activeElement as HTMLElement | null)?.blur();
  }

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
          <nav aria-label="Main" onMouseLeave={() => setShut(false)}>
            <ul className={shut ? "top-links shut" : "top-links"}>
              {groups.map((group) => {
                const active = group.entries.some((entry) => claims(entry, pathname));
                return (
                  <li key={group.label} className="top-group">
                    <Link href={group.entries[0].href} className={active ? "top-head active" : "top-head"} onClick={pressed}>
                      {group.label}
                    </Link>
                    <div className="top-drop">
                      <ul aria-label={group.label}>
                        {group.entries.map((entry) => {
                          const current = claims(entry, pathname);
                          return (
                            <li key={entry.href}>
                              <Link href={entry.href} className={current ? "current" : undefined} aria-current={current ? "page" : undefined} onClick={pressed}>
                                {entry.label}
                                <span className="top-note">{entry.note}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
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
