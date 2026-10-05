import type { Metadata } from "next";
import Link from "next/link";
import Browser from "@/components/Browser";
import { FailureNotice } from "@/components/Notice";
import { FilterBar, PageHead, TabBar } from "@/components/ui";
import { first } from "@/lib/format";
import { contentColumns, contentRow } from "@/lib/rows";
import { contentKinds, contentSearch, contentSorts, type ContentKind, type ContentSort } from "@/lib/server";

export const metadata: Metadata = { title: "Library" };

const pageSize = 20;

const kindLabels: { [kind in ContentKind]: string } = {
  adventure: "Adventures",
  ruleset: "Rulesets",
  definitions: "Definitions",
};

type Query = { [key: string]: string | string[] | undefined };

// Levels are 0 to 100 on the server; anything else in the address is dropped.
function level(value: string): number | undefined {
  if (!/^\d{1,3}$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed >= 1 && parsed <= 100 ? parsed : undefined;
}

export default async function Library({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;

  const kindText = first(query.kind);
  const kind = contentKinds.includes(kindText as ContentKind) ? (kindText as ContentKind) : undefined;
  const sortText = first(query.sort);
  const sort: ContentSort = contentSorts.includes(sortText as ContentSort) ? (sortText as ContentSort) : "score";
  const tag = first(query.tag).trim().toLowerCase();
  const text = first(query.q).trim();
  const levelMin = level(first(query.min));
  const levelMax = level(first(query.max));
  const cursor = /^\d{1,9}$/.test(first(query.cursor)) ? first(query.cursor) : "";

  const result = await contentSearch({ kind, tag, text, levelMin, levelMax, sort, limit: pageSize, cursor });

  // The same search with a different page or kind.
  const href = (change: { cursor?: string; kind?: ContentKind | "" }) => {
    const params = new URLSearchParams();
    const shownKind = change.kind === undefined ? kind : change.kind;
    if (shownKind) params.set("kind", shownKind);
    if (tag) params.set("tag", tag);
    if (text) params.set("q", text);
    if (levelMin) params.set("min", String(levelMin));
    if (levelMax) params.set("max", String(levelMax));
    if (sort !== "score") params.set("sort", sort);
    if (change.cursor) params.set("cursor", change.cursor);
    const built = params.toString();
    return built ? "/library?" + built : "/library";
  };

  const tabs = [
    { href: href({ kind: "" }), label: "All", active: !kind },
    ...contentKinds.map((option) => ({ href: href({ kind: option }), label: kindLabels[option], active: kind === option })),
  ];

  return (
    <>
      <PageHead title="Library" kicker="Made by players">
        <p className="muted">
          Adventures, rulesets and definitions shared by players. The game&apos;s own content is in the{" "}
          <Link href="/compendium">compendium</Link>.
        </p>
      </PageHead>

      <TabBar tabs={tabs} label="Kinds of content" />

      <form method="get" action="/library" className="search-form">
        {kind ? <input type="hidden" name="kind" value={kind} /> : null}
        <FilterBar>
          <label className="filter-field grow">
            <span>Search</span>
            <input type="search" name="q" defaultValue={text} placeholder="Name or description" maxLength={100} />
          </label>
          <label className="filter-field">
            <span>Tag</span>
            <input type="text" name="tag" defaultValue={tag} placeholder="dungeon" maxLength={32} pattern="[a-z0-9\-]*" />
          </label>
          <label className="filter-field short">
            <span>Lvl from</span>
            <input type="number" name="min" defaultValue={levelMin ?? ""} min={1} max={100} />
          </label>
          <label className="filter-field short">
            <span>to</span>
            <input type="number" name="max" defaultValue={levelMax ?? ""} min={1} max={100} />
          </label>
          <label className="filter-field">
            <span>Order</span>
            <select name="sort" defaultValue={sort}>
              <option value="score">Score</option>
              <option value="new">Newest</option>
              <option value="name">Name</option>
            </select>
          </label>
          <button type="submit" className="button primary">
            Search
          </button>
        </FilterBar>
      </form>

      {result.ok ? (
        <>
          <Browser
            rows={result.data.content.map(contentRow)}
            columns={contentColumns}
            empty="Nothing matches that search."
            placeholder="Filter this page"
          />
          <nav className="pager" aria-label="Pages">
            {cursor ? <Link href={href({ cursor: "" })}>First page</Link> : <span />}
            {result.data.cursor ? <Link href={href({ cursor: result.data.cursor })}>Next page</Link> : <span />}
          </nav>
        </>
      ) : (
        <FailureNotice failure={result} what="the library" />
      )}
    </>
  );
}
