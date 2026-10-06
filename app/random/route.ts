// Random page: sends the visitor to one published entry picked at random, or with ?kind=adventure
// or ?kind=definitions, one of that kind. With nothing published it goes to the adventures page.

import { NextResponse } from "next/server";
import { allContent } from "@/lib/catalog";
import { shownKinds, type ContentKind } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const asked = new URL(request.url).searchParams.get("kind") ?? "";
  const kind = shownKinds.includes(asked as ContentKind) ? (asked as ContentKind) : undefined;
  const result = await allContent(kind);
  const items = result.ok ? result.items : [];
  const target = items.length > 0 ? "/c/" + encodeURIComponent(items[Math.floor(Math.random() * items.length)].id) : "/adventures";
  return NextResponse.redirect(new URL(target, request.url), 307);
}
