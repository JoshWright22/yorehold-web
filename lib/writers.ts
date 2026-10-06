// Writers tallied from the catalogue: what each has published and earned. The rankings page and
// profiles both read it, so a writer's rank is the same number in both places.

import type { ContentItem } from "./server";

export type WriterBy = "score" | "favourites" | "works" | "upvotes";

export interface Writer {
  id: string;
  name: string;
  works: number;
  adventures: number;
  packs: number;
  score: number;
  upvotes: number;
  downvotes: number;
  favourites: number;
  best: ContentItem;
}

export function tallyWriters(items: ContentItem[]): Writer[] {
  const byId = new Map<string, Writer>();
  for (const item of items) {
    const writer = byId.get(item.author.id) ?? {
      id: item.author.id,
      name: item.author.name || "unknown",
      works: 0,
      adventures: 0,
      packs: 0,
      score: 0,
      upvotes: 0,
      downvotes: 0,
      favourites: 0,
      best: item,
    };
    writer.works += 1;
    if (item.kind === "adventure") writer.adventures += 1;
    if (item.kind === "definitions") writer.packs += 1;
    writer.score += item.score;
    writer.upvotes += item.votesUp;
    writer.downvotes += item.votesDown;
    writer.favourites += item.favourites ?? 0;
    if (item.score > writer.best.score) writer.best = item;
    byId.set(item.author.id, writer);
  }
  return [...byId.values()];
}

export function writerValue(writer: Writer, by: WriterBy): number {
  return by === "favourites" ? writer.favourites : by === "works" ? writer.works : by === "upvotes" ? writer.upvotes : writer.score;
}

export function rankWriters(writers: Writer[], by: WriterBy): Writer[] {
  return [...writers].sort((a, b) => writerValue(b, by) - writerValue(a, by) || b.score - a.score || a.name.localeCompare(b.name));
}
