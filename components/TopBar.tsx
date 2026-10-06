"use client";

// The bar at the top of every page. Each heading opens a list of everything under it when it is
// pointed at or reached by keyboard. Every heading stays in the bar down to a half-width window;
// only on a phone do the headings, search and account fold into one menu with every list laid
// open, and it closes again whenever the page changes.

import Link from "next/link";
import Form from "next/form";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavSession from "./NavSession";

interface Entry {
  href: string;
  label: string;
  // What the entry is, in a few words.
  note: string;
  // Only this address, not the pages under it, counts as this entry.
  exact?: boolean;
  // A shortcut to a page that belongs under another heading, so it never marks this one.
  shortcut?: boolean;
  // A small heading shown above this entry, starting a part of the list.
  heading?: string;
}

// Home and the adventures, then split by who is reading: the one set of rules everyone plays
// by, everything a player uses, and what someone writing content needs. Pressing a heading goes to
// its first entry.
const groups: { label: string; entries: Entry[] }[] = [
  {
    label: "Home",
    entries: [
      { href: "/", label: "Front page", note: "Popular, news and numbers", exact: true },
      { href: "/news", label: "News", note: "Every post, newest first" },
      { heading: "Getting started", href: "/guide", label: "Guide for newcomers", note: "From here to a first adventure" },
      { href: "/faq", label: "FAQ", note: "Short answers" },
      { href: "/play", label: "Download", note: "Get the game", shortcut: true },
      { heading: "Site", href: "/status", label: "Server status", note: "Is the game server up" },
      { href: "/library", label: "Search", note: "Everything published", shortcut: true },
    ],
  },
  {
    label: "Adventures",
    entries: [
      { heading: "Feed", href: "/adventures", label: "Newest", note: "Everything, newest first" },
      { href: "/adventures?sort=updated", label: "Recently updated", note: "New revisions" },
      { href: "/adventures?sort=score", label: "Top scored", note: "By votes" },
      { href: "/adventures?sort=favourites", label: "Most favourited", note: "What players keep" },
      { href: "/adventures?sort=lowest", label: "Lowest scored", note: "Worth a second look" },
      { heading: "Discovery", href: "/index", label: "Index", note: "Everything, by level" },
      { href: "/tags", label: "Tag search", note: "Every tag and what carries it" },
      { href: "/lists", label: "Curated lists", note: "Picked by hand, in order" },
      { href: "/random?kind=adventure", label: "Random adventure", note: "Take a chance" },
      { heading: "Also", href: "/adventures?show=definitions", label: "Packs", note: "Creatures, items and places to build on" },
      { href: "/adventures?show=fav", label: "Your favourites", note: "Kept in this browser" },
    ],
  },
  {
    label: "Rules",
    entries: [
      { href: "/compendium", label: "Compendium", note: "Every entry of the rules", exact: true },
      { href: "/canon", label: "Canon", note: "What is up for review" },
    ],
  },
  {
    label: "Players",
    entries: [
      { href: "/play", label: "Play", note: "In the browser, or download" },
      { href: "/characters", label: "Character creator", note: "Make one, take it into the game" },
      { href: "/compendium/classes", label: "Classes", note: "Features level by level" },
      { href: "/compendium/spells", label: "Spells", note: "Every spell list" },
      { href: "/compendium/items", label: "Items", note: "Weapons, armour and gear" },
      { href: "/account", label: "Your account", note: "Your work and completions" },
    ],
  },
  {
    label: "Designers",
    entries: [
      { href: "/docs", label: "Format docs", note: "How content files are written" },
      { href: "/compendium/creatures", label: "Creatures", note: "Stat blocks and behaviour" },
      { href: "/compendium/chapters", label: "Chapter examples", note: "Adventure parts for designers" },
      { href: "/library?kind=definitions", label: "Definitions", note: "Homebrew packs to build on" },
      { href: "/compendium/skins", label: "Skins", note: "Looks for the game" },
    ],
  },
  {
    label: "Community",
    entries: [
      { href: "/library", label: "Library", note: "Everything published" },
      { href: "/contribute", label: "Contribute", note: "Write and publish your own" },
      { href: "/login?mode=signup", label: "Join the site", note: "Make an account" },
      { href: "/site-rules", label: "Site rules", note: "What is and isn't allowed" },
      { href: "/forums", label: "Forums", note: "Not open yet" },
    ],
  },
];

// An entry with a query shares its page with others, so only a plain address can claim a page.
function claims(entry: Entry, pathname: string): boolean {
  if (entry.shortcut || entry.href.includes("?")) return false;
  return pathname === entry.href || (!entry.exact && pathname.startsWith(entry.href + "/"));
}

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // After an entry is pressed its list stays shut until the pointer leaves that heading, so it does
  // not hang over the new page. Every other heading still opens as soon as it is pointed at.
  const [shut, setShut] = useState("");
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

  function pressed(group: string) {
    setShut(group);
    setOpen(false);
    // Focus would hold the list open just as the pointer does.
    (document.activeElement as HTMLElement | null)?.blur();
  }

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <Link href="/" className="brand" aria-label="Yorehold">
          <span className="brand-mark" aria-hidden="true">
            Y
          </span>
          <span className="brand-name">Yorehold</span>
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
              {groups.map((group) => {
                const active = group.entries.some((entry) => claims(entry, pathname));
                return (
                  <li
                    key={group.label}
                    className={shut === group.label ? "top-group shut" : "top-group"}
                    onMouseLeave={() => setShut((value) => (value === group.label ? "" : value))}
                  >
                    <Link href={group.entries[0].href} className={active ? "top-head active" : "top-head"} onClick={() => pressed(group.label)}>
                      {group.label}
                    </Link>
                    <div className="top-drop">
                      <ul aria-label={group.label}>
                        {group.entries.map((entry) => {
                          const current = claims(entry, pathname);
                          return (
                            <li key={entry.href}>
                              {entry.heading ? <span className="top-drop-head">{entry.heading}</span> : null}
                              <Link href={entry.href} className={current ? "current" : undefined} aria-current={current ? "page" : undefined} onClick={() => pressed(group.label)}>
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
          <Form action="/library" className="top-search" role="search">
            <label className="sr-only" htmlFor="top-search">
              Search the library
            </label>
            <input id="top-search" type="search" name="q" placeholder="Search the library" maxLength={100} />
          </Form>
          <NavSession />
        </div>
      </div>
    </header>
  );
}
