import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { AdventureCard, FavouriteGrid, type CardItem } from "@/components/AdventureCard";
import { FailureNotice } from "@/components/Notice";
import { first } from "@/lib/format";
import { contentSearch, contentSorts, type ContentItem, type ContentKind, type ContentSort } from "@/lib/server";

export const metadata: Metadata = { title: "Adventures" };
export const dynamic = "force-dynamic";

const pageSize = 24;

type Query = { [key: string]: string | string[] | undefined };

// What the address can ask for. "fav" is the favourites kept in this browser.
type Show = "adventure" | "definitions" | "fav";

const shows: { id: Show; label: string }[] = [
  { id: "adventure", label: "Adventures" },
  { id: "definitions", label: "Packs" },
  { id: "fav", label: "Favourites" },
];

const levels: { id: string; label: string; min?: number; max?: number }[] = [
  { id: "", label: "Any" },
  { id: "1-4", label: "1 to 4", min: 1, max: 4 },
  { id: "5-10", label: "5 to 10", min: 5, max: 10 },
  { id: "11-16", label: "11 to 16", min: 11, max: 16 },
  { id: "17-20", label: "17 to 20", min: 17, max: 20 },
];

// A starting set until the server can say which tags are used most.
const tags = ["mystery", "horror", "dungeon", "city", "coast", "intrigue", "war", "travel", "dialogue", "short"];

const sorts: { id: ContentSort; label: string }[] = [
  { id: "score", label: "Score" },
  { id: "new", label: "Newest" },
  { id: "name", label: "Name" },
];

function card(item: ContentItem): CardItem {
  const { id, kind, name, description, tags, levelMin, levelMax, author, score, votesUp, votesDown } = item;
  return { id, kind, name, description, tags, levelMin, levelMax, author, score, votesUp, votesDown };
}

export default async function Adventures({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const showText = first(query.show);
  const show: Show = shows.some((option) => option.id === showText) ? (showText as Show) : "adventure";
  const text = first(query.q).trim().slice(0, 100);
  const tagText = first(query.tag).trim().toLowerCase();
  const tag = /^[a-z0-9 -]{1,32}$/.test(tagText) ? tagText : "";
  const level = levels.find((option) => option.id === first(query.level)) ?? levels[0];
  const sortText = first(query.sort);
  const sort: ContentSort = contentSorts.includes(sortText as ContentSort) ? (sortText as ContentSort) : "score";
  const cursor = /^\d{1,9}$/.test(first(query.cursor)) ? first(query.cursor) : "";

  // The same search with one thing changed; changing a filter goes back to the first page.
  const href = (change: { show?: Show; tag?: string; level?: string; sort?: ContentSort; cursor?: string }) => {
    const params = new URLSearchParams();
    const next = { show, tag, level: level.id, sort, ...change };
    if (text) params.set("q", text);
    if (next.show !== "adventure") params.set("show", next.show);
    if (next.tag) params.set("tag", next.tag);
    if (next.level) params.set("level", next.level);
    if (next.sort !== "score") params.set("sort", next.sort);
    if (change.cursor) params.set("cursor", change.cursor);
    const built = params.toString();
    return built ? "/adventures?" + built : "/adventures";
  };

  const result =
    show === "fav"
      ? null
      : await contentSearch({ kind: show as ContentKind, text, tag, levelMin: level.min, levelMax: level.max, sort, limit: pageSize, cursor });

  return (
    <>
      <section className="adv-search">
        <Form action="/adventures" className="adv-search-form" role="search">
          <label className="sr-only" htmlFor="adv-q">
            Search adventures
          </label>
          <input id="adv-q" type="search" name="q" defaultValue={text} placeholder="Search by name or description" maxLength={100} />
          {show !== "adventure" ? <input type="hidden" name="show" value={show} /> : null}
          {tag ? <input type="hidden" name="tag" value={tag} /> : null}
          {level.id ? <input type="hidden" name="level" value={level.id} /> : null}
          {sort !== "score" ? <input type="hidden" name="sort" value={sort} /> : null}
          <button type="submit" className="button primary">
            Search
          </button>
        </Form>

        <dl className="adv-filters">
          <div>
            <dt>Show</dt>
            <dd>
              {shows.map((option) => (
                <Link key={option.id} href={href({ show: option.id })} className={show === option.id ? "filter-chip active" : "filter-chip"}>
                  {option.label}
                </Link>
              ))}
            </dd>
          </div>
          {show !== "fav" ? (
            <>
              <div>
                <dt>Level</dt>
                <dd>
                  {levels.map((option) => (
                    <Link key={option.id} href={href({ level: option.id })} className={level.id === option.id ? "filter-chip active" : "filter-chip"}>
                      {option.label}
                    </Link>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Tag</dt>
                <dd>
                  <Link href={href({ tag: "" })} className={tag === "" ? "filter-chip active" : "filter-chip"}>
                    Any
                  </Link>
                  {(tag && !tags.includes(tag) ? [tag, ...tags] : tags).map((option) => (
                    <Link key={option} href={href({ tag: option })} className={tag === option ? "filter-chip active" : "filter-chip"}>
                      {option}
                    </Link>
                  ))}
                </dd>
              </div>
              <div>
                <dt>Sort</dt>
                <dd>
                  {sorts.map((option) => (
                    <Link key={option.id} href={href({ sort: option.id })} className={sort === option.id ? "filter-chip active" : "filter-chip"}>
                      {option.label}
                    </Link>
                  ))}
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      </section>

      {result === null ? (
        <FavouriteGrid text={text} />
      ) : !result.ok ? (
        <FailureNotice failure={result} what="the adventures" />
      ) : result.data.content.length === 0 ? (
        <p className="list-empty">Nothing matches. Try fewer filters.</p>
      ) : (
        <>
          <div className="adv-grid">
            {result.data.content.map((item) => (
              <AdventureCard key={item.id} item={card(item)} />
            ))}
          </div>
          <p className="adv-pages">
            {cursor ? <Link href={href({})}>First page</Link> : null}
            {result.data.cursor ? (
              <Link href={href({ cursor: result.data.cursor })} className="button secondary">
                More
              </Link>
            ) : null}
          </p>
        </>
      )}
    </>
  );
}
