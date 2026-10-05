"use client";

// A searchable, sortable table on the left and the chosen entry's full text on the right. It
// filters and sorts the rows it was given; it never asks the server for more.

import { useMemo, useRef, useState } from "react";
import type { Column, Row } from "@/lib/sheet";
import { Chip, FilterBar, SplitView, StatBlock } from "./ui";

type SortState = { key: string; up: boolean };

function compare(a: Row, b: Row, sort: SortState, numeric: boolean): number {
  let result: number;
  if (sort.key === "name") {
    result = a.name.localeCompare(b.name);
  } else {
    const left = a.cells[sort.key];
    const right = b.cells[sort.key];
    // Blank cells go last whichever way the column is sorted.
    if (left === "" || left === undefined) return right === "" || right === undefined ? 0 : 1;
    if (right === "" || right === undefined) return -1;
    result = numeric ? Number(left) - Number(right) : String(left).localeCompare(String(right));
  }
  return sort.up ? result : -result;
}

export default function Browser({
  rows,
  columns,
  selectedId,
  syncUrl,
  empty,
  chipLabel = "Tag",
  placeholder = "Filter by name",
}: {
  rows: Row[];
  columns: Column[];
  selectedId?: string;
  // Point the address bar at the chosen entry's own page.
  syncUrl?: boolean;
  empty: string;
  chipLabel?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "", up: true });
  const [selected, setSelected] = useState(selectedId ?? rows[0]?.id ?? "");
  const detailRef = useRef<HTMLDivElement>(null);

  const chipOptions = useMemo(() => [...new Set(rows.flatMap((row) => row.chips))].sort(), [rows]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const kept = rows.filter((row) => {
      if (chip && !row.chips.includes(chip)) return false;
      if (!needle) return true;
      if (row.name.toLowerCase().includes(needle)) return true;
      return row.chips.some((value) => value.toLowerCase().includes(needle));
    });
    if (!sort.key) return kept;
    const numeric = columns.find((column) => column.key === sort.key)?.numeric ?? false;
    return [...kept].sort((a, b) => compare(a, b, sort, numeric));
  }, [rows, columns, query, chip, sort]);

  const current = rows.find((row) => row.id === selected) ?? shown[0];

  function choose(row: Row) {
    setSelected(row.id);
    if (syncUrl) window.history.replaceState(null, "", row.href);
    // On a phone the detail sits under the list, so bring it into view.
    if (window.matchMedia("(max-width: 860px)").matches) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function sortBy(key: string) {
    setSort((old) => (old.key === key ? { key, up: !old.up } : { key, up: key === "name" }));
  }

  function header(key: string, label: string, column?: Column) {
    const active = sort.key === key;
    const className = [column?.numeric ? "numeric" : "", column?.wide ? "wide" : ""].filter(Boolean).join(" ");
    return (
      <th key={key} className={className || undefined} aria-sort={active ? (sort.up ? "ascending" : "descending") : "none"}>
        <button type="button" onClick={() => sortBy(key)} className={active ? "sort active" : "sort"}>
          {label}
          <span className="sort-mark" aria-hidden="true">
            {active ? (sort.up ? "▲" : "▼") : "↕"}
          </span>
        </button>
      </th>
    );
  }

  const list = (
    <>
      <FilterBar>
        <label className="filter-field grow">
          <span>Filter</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} />
        </label>
        {chipOptions.length > 0 ? (
          <label className="filter-field">
            <span>{chipLabel}</span>
            <select value={chip} onChange={(event) => setChip(event.target.value)}>
              <option value="">Any</option>
              {chipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="filter-field">
          <span>Sort</span>
          <select
            value={sort.key ? sort.key + (sort.up ? ":up" : ":down") : ""}
            onChange={(event) => {
              const [key, way] = event.target.value.split(":");
              setSort({ key: key ?? "", up: way !== "down" });
            }}
          >
            <option value="">As loaded</option>
            <option value="name:up">Name A to Z</option>
            {columns.map((column) => (
              <option key={column.key} value={column.key + (column.numeric ? ":down" : ":up")}>
                {column.label}
                {column.numeric ? ", high first" : ""}
              </option>
            ))}
          </select>
        </label>
        <span className="filter-count num" aria-live="polite">
          {shown.length}/{rows.length}
        </span>
      </FilterBar>
      {chip ? (
        <p className="active-chips">
          <button type="button" className="chip removable" onClick={() => setChip("")}>
            {chip} <span aria-hidden="true">{"×"}</span>
            <span className="sr-only">remove filter</span>
          </button>
        </p>
      ) : null}
      {shown.length === 0 ? (
        <p className="empty">{rows.length === 0 ? empty : "Nothing matches that filter."}</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {header("name", "Name")}
                {columns.map((column) => header(column.key, column.label, column))}
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr
                  key={row.id}
                  className={row.id === current?.id ? "selected" : undefined}
                  onClick={() => choose(row)}
                  aria-selected={row.id === current?.id}
                >
                  <td className="name-cell">
                    <a
                      href={row.href}
                      onClick={(event) => {
                        // A plain click picks the row; a modified click still opens the page.
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                        event.preventDefault();
                        choose(row);
                      }}
                    >
                      {row.name}
                    </a>
                    {row.chips.length > 0 ? (
                      <span className="row-chips">
                        {row.chips.slice(0, 2).map((value) => (
                          <Chip key={value}>{value}</Chip>
                        ))}
                      </span>
                    ) : null}
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className={[column.numeric ? "numeric num" : "", column.wide ? "wide" : ""].filter(Boolean).join(" ") || undefined}>
                      {row.cells[column.key] === "" || row.cells[column.key] === undefined ? (
                        <span className="dash">-</span>
                      ) : (
                        row.cells[column.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const detail = (
    <div ref={detailRef} className="detail-pane">
      {current ? <StatBlock sheet={current.sheet} /> : <p className="empty">Pick an entry to read it here.</p>}
    </div>
  );

  return <SplitView list={list} detail={detail} />;
}
