import type { Metadata } from "next";
import Link from "next/link";
import ContentList from "@/components/ContentList";
import { FailureNotice } from "@/components/Notice";
import { first } from "@/lib/format";
import { contentKinds, contentSearch, contentSorts, type ContentKind, type ContentSort } from "@/lib/server";

export const metadata: Metadata = { title: "Library" };

const pageSize = 20;

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

  // The same search with a different page.
  const pageHref = (pageCursor: string) => {
    const params = new URLSearchParams();
    if (kind) params.set("kind", kind);
    if (tag) params.set("tag", tag);
    if (text) params.set("q", text);
    if (levelMin) params.set("min", String(levelMin));
    if (levelMax) params.set("max", String(levelMax));
    if (sort !== "score") params.set("sort", sort);
    if (pageCursor) params.set("cursor", pageCursor);
    const built = params.toString();
    return built ? "/library?" + built : "/library";
  };

  return (
    <>
      <h1>Library</h1>

      <form method="get" action="/library" className="filters">
        <label>
          Search
          <input type="search" name="q" defaultValue={text} placeholder="Name or description" maxLength={100} />
        </label>
        <label>
          Kind
          <select name="kind" defaultValue={kind ?? ""}>
            <option value="">Any</option>
            {contentKinds.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tag
          <input type="text" name="tag" defaultValue={tag} placeholder="dungeon" maxLength={32} pattern="[a-z0-9\-]*" />
        </label>
        <label>
          Level from
          <input type="number" name="min" defaultValue={levelMin ?? ""} min={1} max={100} />
        </label>
        <label>
          to
          <input type="number" name="max" defaultValue={levelMax ?? ""} min={1} max={100} />
        </label>
        <label>
          Sort by
          <select name="sort" defaultValue={sort}>
            <option value="score">Score</option>
            <option value="new">Newest</option>
            <option value="name">Name</option>
          </select>
        </label>
        <button type="submit" className="button">
          Search
        </button>
      </form>

      {result.ok ? (
        <>
          <ContentList items={result.data.content} empty="Nothing matches that search." />
          <nav className="pager" aria-label="Pages">
            {cursor ? <Link href={pageHref("")}>First page</Link> : <span />}
            {result.data.cursor ? <Link href={pageHref(result.data.cursor)}>Next page</Link> : <span />}
          </nav>
        </>
      ) : (
        <FailureNotice failure={result} what="the library" />
      )}
    </>
  );
}
