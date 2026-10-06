// The site's building blocks. None of them hold state, so pages on the server and the client
// browser can both use them.

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import type { NewsItem } from "@/lib/news";
import type { Pair, Sheet } from "@/lib/sheet";

type Tone = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  href,
  tone = "primary",
  big,
  external,
  children,
}: {
  href: string;
  tone?: Tone;
  big?: boolean;
  external?: boolean;
  children: ReactNode;
}) {
  const className = "button " + tone + (big ? " big" : "");
  // Links out of the site (downloads, the game's own scheme) skip the router.
  if (external || !href.startsWith("/")) {
    return (
      <a href={href} className={className} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function Chip({ kind, href, children }: { kind?: string; href?: string; children: ReactNode }) {
  const className = "chip" + (kind ? " kind-" + kind : "");
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return <span className={className}>{children}</span>;
}

// Stand-in art: a flat block with the entry's first letter and a dot in the kind's colour.
export function Cover({ kind, name, tall }: { kind: string; name: string; tall?: boolean }) {
  return (
    <div className={"cover kind-" + kind + (tall ? " tall" : "")} aria-hidden="true">
      <span>{(name.trim()[0] ?? "?").toUpperCase()}</span>
    </div>
  );
}

export function Card({
  href,
  kind,
  title,
  byline,
  stats,
  children,
}: {
  href: string;
  kind: string;
  title: string;
  byline?: ReactNode;
  stats?: Pair[];
  children?: ReactNode;
}) {
  return (
    <article className="card">
      <Link href={href} className="card-cover" tabIndex={-1} aria-hidden="true">
        <Cover kind={kind} name={title} />
      </Link>
      <div className="card-body">
        <p className="card-kind">
          <Chip kind={kind}>{kind}</Chip>
        </p>
        <h3>
          <Link href={href} className="card-link">
            {title}
          </Link>
        </h3>
        {byline ? <p className="card-by">{byline}</p> : null}
        {children}
      </div>
      {stats && stats.length > 0 ? (
        <dl className="card-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd className="num">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}

// A titled part of a page: a small heading on a rule, with a link to the rest at its right end.
export function Section({
  title,
  note,
  more,
  children,
}: {
  title: string;
  note?: string;
  more?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="section">
      <header className="section-head">
        <h2>{title}</h2>
        {note ? <span className="section-note">{note}</span> : null}
        {more ? <Link href={more.href}>{more.label}</Link> : null}
      </header>
      {children}
    </section>
  );
}

// News as a plain list: title, the day it was posted, one line.
export function NewsList({ items, empty }: { items: NewsItem[]; empty: string }) {
  if (items.length === 0) return <p className="list-empty">{empty}</p>;
  return (
    <ul className="news-list">
      {items.map((item) => (
        <li key={item.day + item.title}>
          <p className="news-title">
            {item.href ? <Link href={item.href}>{item.title}</Link> : item.title}
            <time className="num" dateTime={item.day}>
              {item.day}
            </time>
          </p>
          <p className="news-line">{item.line}</p>
        </li>
      ))}
    </ul>
  );
}

export interface RankItem {
  href: string;
  label: string;
  // The number at the right end of the line.
  value: string;
  // Small print between the name and the number.
  note?: string;
}

// A list of links with a number each. Ranked lists count their lines.
export function RankList({ items, ranked, empty }: { items: RankItem[]; ranked?: boolean; empty: string }) {
  if (items.length === 0) return <p className="list-empty">{empty}</p>;
  const lines = items.map((item, index) => (
    <li key={item.href}>
      {ranked ? <span className="rank num">{index + 1}</span> : null}
      <Link href={item.href}>{item.label}</Link>
      {item.note ? <span className="rank-note">{item.note}</span> : null}
      <span className="rank-value num">{item.value}</span>
    </li>
  ));
  return ranked ? <ol className="rank-list">{lines}</ol> : <ul className="rank-list">{lines}</ul>;
}

export function TabBar({ tabs, label }: { tabs: { href: string; label: string; active: boolean; count?: number }[]; label: string }) {
  return (
    <nav className="tab-bar" aria-label={label}>
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className={tab.active ? "tab active" : "tab"} aria-current={tab.active ? "page" : undefined}>
          {tab.label}
          {tab.count !== undefined ? <span className="tab-count num">{tab.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="filter-bar">{children}</div>;
}

export function StatTile({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className={"stat-tile" + (tone ? " " + tone : "")}>
      <span className="stat-value num">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export function StatTiles({ tiles }: { tiles: Pair[] }) {
  if (tiles.length === 0) return null;
  return (
    <div className="stat-tiles">
      {tiles.map((tile) => (
        <StatTile key={tile.label} label={tile.label} value={tile.value} />
      ))}
    </div>
  );
}

export function SplitView({ list, detail }: { list: ReactNode; detail: ReactNode }) {
  return (
    <div className="split">
      <div className="split-list">{list}</div>
      <div className="split-detail">{detail}</div>
    </div>
  );
}

// An entry laid out like a page of a rule book: name, a rule, the numbers, then the text.
export function StatBlock({ sheet, children }: { sheet: Sheet; children?: ReactNode }) {
  return (
    <article className={"stat-block kind-" + sheet.kind}>
      <header>
        <h2 className="sb-title">{sheet.title}</h2>
        {sheet.subtitle ? <p className="sb-subtitle">{sheet.subtitle}</p> : null}
      </header>
      <hr className="sb-rule" />
      {sheet.tiles && sheet.tiles.length > 0 ? (
        <>
          <dl className="sb-tiles">
            {sheet.tiles.map((tile) => (
              <div key={tile.label}>
                <dt>{tile.label}</dt>
                <dd className="num">{tile.value}</dd>
              </div>
            ))}
          </dl>
          <hr className="sb-rule" />
        </>
      ) : null}
      {sheet.stats && sheet.stats.length > 0 ? (
        <>
          <dl className="sb-stats">
            {sheet.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
          <hr className="sb-rule" />
        </>
      ) : null}
      {sheet.description?.map((line, index) => (
        <p key={index} className="sb-text">
          {line}
        </p>
      ))}
      {sheet.sections?.map((section) => (
        <section key={section.title} className="sb-section">
          <h3>{section.title}</h3>
          {section.lines.map((line, index) => (
            <p key={index}>
              {line.label ? <strong>{line.label}. </strong> : null}
              {line.text}
            </p>
          ))}
        </section>
      ))}
      {sheet.chips && sheet.chips.length > 0 ? (
        <p className="chips">
          {sheet.chips.map((chip) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </p>
      ) : null}
      {children}
      {sheet.links && sheet.links.length > 0 ? (
        <p className="sb-links">
          {sheet.links.map((link) => (
            <Button key={link.href} href={link.href} tone={link.primary ? "primary" : "secondary"}>
              {link.label}
            </Button>
          ))}
        </p>
      ) : null}
    </article>
  );
}

// The picture behind a banner. `art` is a file name in public/art; the stylesheet draws it.
export function artStyle(art: string): CSSProperties {
  return { "--art": `url(/art/${art}.jpg)` } as CSSProperties;
}

// With `art` the heading sits on a picture; without, it is plain type on the page.
export function PageHead({ title, kicker, art, children }: { title: string; kicker?: string; art?: string; children?: ReactNode }) {
  return (
    <header className={art ? "page-head banner" : "page-head"} style={art ? artStyle(art) : undefined}>
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h1>{title}</h1>
      {children}
    </header>
  );
}
