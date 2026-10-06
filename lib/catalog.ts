// The whole published catalogue in one list, for pages that index or count all of it (the index,
// tag search, random picks). The server answers 50 at a time, so this walks the pages, up to a cap
// that keeps one visit quick; past it the server will need its own index call.

import { contentSearch, type ContentItem, type ContentKind, type Failure } from "./server";

const pageSize = 50;
const mostPages = 20;

export async function allContent(kind?: ContentKind): Promise<{ ok: true; items: ContentItem[]; cut: boolean } | Failure> {
  const items: ContentItem[] = [];
  let cursor = "";
  for (let page = 0; page < mostPages; page++) {
    const result = await contentSearch({ kind, sort: "name", limit: pageSize, cursor });
    if (!result.ok) {
      if (page === 0) return result;
      break;
    }
    items.push(...result.data.content);
    cursor = result.data.cursor;
    if (!cursor) return { ok: true, items, cut: false };
  }
  return { ok: true, items, cut: cursor !== "" };
}
