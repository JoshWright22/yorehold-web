// Library content as rows for the list and detail browser.

import type { ContentItem } from "./server";
import type { Column, Row } from "./sheet";
import { date, levelRange, score } from "./format";

export const contentColumns: Column[] = [
  { key: "score", label: "Score", numeric: true },
  { key: "kind", label: "Kind", wide: true },
  { key: "level", label: "Lvl", numeric: true },
  { key: "author", label: "By", wide: true },
  { key: "updated", label: "Updated", wide: true },
];

export function contentRow(item: ContentItem): Row {
  const href = "/c/" + encodeURIComponent(item.id);
  const author = item.author.name || "unknown";
  return {
    id: item.id,
    name: item.name,
    href,
    kind: item.kind,
    // The lowest level it is for sorts best; 0 means any level.
    cells: { score: item.score, kind: item.kind, level: item.levelMin || "", author, updated: date(item.updatedAt) },
    chips: item.tags,
    sheet: {
      kind: item.kind,
      title: item.name,
      subtitle: item.kind.charAt(0).toUpperCase() + item.kind.slice(1) + " by " + author,
      description: item.description ? [item.description] : undefined,
      tiles: [
        { label: "Score", value: score(item.score) },
        { label: "Up", value: String(item.votesUp) },
        { label: "Down", value: String(item.votesDown) },
        { label: "Rev", value: String(item.revision) },
      ],
      stats: [
        { label: "Levels", value: levelRange(item) },
        { label: "Ruleset", value: item.rulesetVersion || "any" },
        { label: "Published", value: date(item.createdAt) },
        { label: "Updated", value: date(item.updatedAt) },
      ],
      chips: item.tags,
      links: [
        { label: "Open page", href, primary: true },
        { label: "Open in Yorehold", href: "yorehold://content/" + encodeURIComponent(item.id) },
      ],
    },
  };
}
