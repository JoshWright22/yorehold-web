"use client";

// A dense ranked table of library content: filter chips over it, columns that sort, and a row
// that opens its page when clicked. It works on the rows it was given and never asks for more.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type MouseEvent } from "react";
import type { RankedRow } from "@/lib/sheet";

type SortKey = "rank" | "name" | "author" | "kind" | "level" | "score" | "revision";
type SortState = { key: SortKey; up: boolean };

const columns: { key: SortKey; label: string; numeric?: boolean; title?: string }[] = [
  { key: "rank", label: "#", numeric: true, title: "Rank by score" },
  { key: "name", label: "Title" },
  { key: "author", label: "Author" },
  { key: "kind", label: "Kind" },
  { key: "level", label: "Lvl", numeric: true, title: "Level range" },
  { key: "score", label: "Score", numeric: true },
  { key: "revision", label: "Rev", numeric: true, title: "Revisions" },
];

function levels(row: RankedRow): string {
  if (!row.levelMin && !row.levelMax) return "any";
  if (!row.levelMax) return row.levelMin + "+";
  if (!row.levelMin) return "1-" + row.levelMax;
  if (row.levelMin === row.levelMax) return String(row.levelMin);
  return row.levelMin + "-" + row.levelMax;
}

function compare(a: RankedRow, b: RankedRow, sort: SortState): number {
  let result: number;
  switch (sort.key) {
    case "name":
      result = a.name.localeCompare(b.name);
      break;
    case "author":
      result = a.author.localeCompare(b.author);
      break;
    case "kind":
      result = a.kind.localeCompare(b.kind);
      break;
    case "level":
      // "Any level" goes last whichever way the column is sorted.
      if (!a.levelMin || !b.levelMin) return !a.levelMin && !b.levelMin ? 0 : !a.levelMin ? 1 : -1;
      result = a.levelMin - b.levelMin || a.levelMax - b.levelMax;
      break;
    default:
      result = a[sort.key] - b[sort.key];
  }
  // Rank settles ties so the order never jumps around.
  return (sort.up ? result : -result) || a.rank - b.rank;
}

export default function RankedTable({
  rows,
  filters,
  limit = 25,
  more,
  empty,
}: {
  rows: RankedRow[];
  // Chips over the table. A kind of "" keeps every row.
  filters?: { label: string; kind: string }[];
  limit?: number;
  more?: { href: string; label: string };
  empty: string;
}) {
  const router = useRouter();
  const [kind, setKind] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "rank", up: true });

  const kept = useMemo(() => {
    const matching = kind ? rows.filter((row) => row.kind === kind) : rows;
    return [...matching].sort((a, b) => compare(a, b, sort));
  }, [rows, kind, sort]);
  const shown = kept.slice(0, limit);

  function sortBy(key: SortKey) {
    // Score and revisions are most useful high first; the rest start low or A to Z.
    setSort((old) => (old.key === key ? { key, up: !old.up } : { key, up: key !== "score" && key !== "revision" }));
  }

  function open(event: MouseEvent, row: RankedRow) {
    // Links inside the row go where they say.
    if ((event.target as HTMLElement).closest("a")) return;
    router.push(row.href);
  }

  const moreHref = more ? more.href + (kind ? (more.href.includes("?") ? "&" : "?") + "kind=" + encodeURIComponent(kind) : "") : "";

  return (
    <div className="ranked">
      {filters && filters.length > 0 ? (
        <div className="ranked-filters" role="group" aria-label="Kind">
          {filters.map((filter) => (
            <button
              key={filter.kind}
              type="button"
              className={filter.kind === kind ? "filter-chip active" : "filter-chip"}
              aria-pressed={filter.kind === kind}
              onClick={() => setKind(filter.kind)}
            >
              {filter.label}
              <span className="num">{filter.kind ? rows.filter((row) => row.kind === filter.kind).length : rows.length}</span>
            </button>
          ))}
        </div>
      ) : null}
      {shown.length === 0 ? (
        <p className="empty">{rows.length === 0 ? empty : "Nothing of that kind here yet."}</p>
      ) : (
        <div className="ranked-wrap">
          <table className="ranked-table">
            <thead>
              <tr>
                {columns.map((column) => {
                  const active = sort.key === column.key;
                  return (
                    <th
                      key={column.key}
                      className={"col-" + column.key + (column.numeric ? " numeric" : "")}
                      aria-sort={active ? (sort.up ? "ascending" : "descending") : "none"}
                    >
                      <button type="button" className={active ? "sort active" : "sort"} title={column.title} onClick={() => sortBy(column.key)}>
                        {column.label}
                        <span className="sort-mark" aria-hidden="true">
                          {active ? (sort.up ? "▲" : "▼") : ""}
                        </span>
                      </button>
                    </th>
                  );
                })}
                <th className="col-tags">Tags</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.id} onClick={(event) => open(event, row)}>
                  <td className="col-rank numeric num">{row.rank}</td>
                  <td className="col-name">
                    <Link href={row.href}>{row.name}</Link>
                  </td>
                  <td className="col-author">
                    <Link href={row.authorHref}>{row.author}</Link>
                  </td>
                  <td className="col-kind">
                    <span className={"kind-mark kind-" + row.kind} aria-hidden="true" />
                    {row.kind}
                  </td>
                  <td className="col-level numeric num">{levels(row)}</td>
                  <td className="col-score numeric num">{row.score > 0 ? "+" + row.score : row.score}</td>
                  <td className="col-revision numeric num">{row.revision}</td>
                  <td className="col-tags">
                    {row.tags.slice(0, 3).map((tag) => (
                      <Link key={tag} href={"/library?tag=" + encodeURIComponent(tag)} className="tag">
                        {tag}
                      </Link>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="ranked-foot">
        <span className="num">
          {shown.length} of {kept.length}
        </span>
        {more ? <Link href={moreHref}>{more.label}</Link> : null}
      </p>
    </div>
  );
}
