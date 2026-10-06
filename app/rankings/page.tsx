import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Appearance";
import { FailureNotice } from "@/components/Notice";
import { PageHead } from "@/components/ui";
import { allContent } from "@/lib/catalog";
import { first, profileHref, score } from "@/lib/format";
import type { ContentKind } from "@/lib/server";
import { rankWriters, tallyWriters, type WriterBy } from "@/lib/writers";

export const metadata: Metadata = { title: "Rankings" };
export const dynamic = "force-dynamic";

type Query = { [key: string]: string | string[] | undefined };

// What writers can be ranked by. Score is the default, like a performance ranking.
type By = WriterBy;

const bys: { id: By; label: string }[] = [
  { id: "score", label: "Score" },
  { id: "favourites", label: "Favourites" },
  { id: "works", label: "Works" },
  { id: "upvotes", label: "Up votes" },
];

const kinds: { id: "" | ContentKind; label: string }[] = [
  { id: "", label: "All" },
  { id: "adventure", label: "Adventures" },
  { id: "definitions", label: "Packs" },
];

const pageSize = 50;

export default async function Rankings({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const by: By = bys.some((option) => option.id === first(query.by)) ? (first(query.by) as By) : "score";
  const kind = kinds.find((option) => option.id === first(query.kind))?.id ?? "";
  const page = Math.max(1, Math.min(200, Number(first(query.page)) || 1));

  const href = (change: { by?: By; kind?: string; page?: number }) => {
    const params = new URLSearchParams();
    const next = { by, kind, page: 1, ...change };
    if (next.by !== "score") params.set("by", next.by);
    if (next.kind) params.set("kind", next.kind);
    if (next.page > 1) params.set("page", String(next.page));
    const built = params.toString();
    return built ? "/rankings?" + built : "/rankings";
  };

  const result = await allContent(kind || undefined);

  return (
    <>
      <PageHead title="Rankings" kicker="Writers">
        <p>Everyone who has published, ranked by what their work has earned.</p>
      </PageHead>

      <nav className="tab-bar rank-tabs" aria-label="Rank by">
        {bys.map((option) => (
          <Link key={option.id} href={href({ by: option.id })} className={by === option.id ? "tab active" : "tab"} aria-current={by === option.id ? "page" : undefined}>
            {option.label}
          </Link>
        ))}
      </nav>
      <p className="rank-kinds">
        {kinds.map((option) => (
          <Link key={option.id} href={href({ kind: option.id })} className={kind === option.id ? "filter-chip active" : "filter-chip"}>
            {option.label}
          </Link>
        ))}
      </p>

      {!result.ok ? (
        <FailureNotice failure={result} what="the rankings" />
      ) : (
        (() => {
          const ranked = rankWriters(tallyWriters(result.items), by);
          const pages = Math.max(1, Math.ceil(ranked.length / pageSize));
          const shown = ranked.slice((page - 1) * pageSize, page * pageSize);
          if (ranked.length === 0) return <p className="list-empty">Nobody has published yet.</p>;
          // The column the ranking is by is drawn bright; the others stay dim.
          const lit = (column: By) => (column === by ? "num lit" : "num");
          return (
            <>
              <div className="rank-wrap">
                <table className="rank-table">
                  <thead>
                    <tr>
                      <th className="num">#</th>
                      <th>Writer</th>
                      <th className="wide">Best work</th>
                      <th className={lit("works")}>Works</th>
                      <th className="num wide">Adventures</th>
                      <th className="num wide">Packs</th>
                      <th className={lit("upvotes")}>Up votes</th>
                      <th className={lit("favourites")}>Favourites</th>
                      <th className={lit("score")}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((writer, index) => (
                      <tr key={writer.id}>
                        <td className="num rank-place">#{(page - 1) * pageSize + index + 1}</td>
                        <td>
                          <Link href={profileHref(writer)} className="rank-writer">
                            <Avatar userId={writer.id} name={writer.name} size="small" />
                            {writer.name}
                          </Link>
                        </td>
                        <td className="wide rank-best">
                          <Link href={"/c/" + encodeURIComponent(writer.best.id)}>{writer.best.name}</Link>
                        </td>
                        <td className={lit("works")}>{writer.works}</td>
                        <td className="num wide">{writer.adventures}</td>
                        <td className="num wide">{writer.packs}</td>
                        <td className={lit("upvotes")}>{writer.upvotes.toLocaleString("en-GB")}</td>
                        <td className={lit("favourites")}>{writer.favourites.toLocaleString("en-GB")}</td>
                        <td className={lit("score")}>{score(writer.score)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pages > 1 ? (
                <nav className="rank-pages" aria-label="Pages">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((number) => (
                    <Link key={number} href={href({ page: number })} className={number === page ? "filter-chip active" : "filter-chip"}>
                      {number}
                    </Link>
                  ))}
                </nav>
              ) : null}
              {result.cut ? <p className="muted small">Counted from the first part of the library only; the server will rank the whole of it once it can.</p> : null}
            </>
          );
        })()
      )}
    </>
  );
}
