// The Download button on a card. It sends the browser to the file the publisher gave, or with
// nothing to download, to the game's own link so an installed game fetches it itself. In sample
// mode it hands over a small stand-in file so the button can be tried without a server.

import { NextResponse } from "next/server";
import { webUrl } from "@/lib/format";
import { sampleOn } from "@/lib/sample";
import { contentGet, isId } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isId(id)) return new NextResponse("Not found", { status: 404 });

  const result = await contentGet(id);
  if (!result.ok) {
    return new NextResponse(result.offline ? "The game server could not be reached." : result.message, { status: result.offline ? 503 : 404 });
  }

  const content = result.data.content;
  const file = webUrl(content.fileUrl);
  if (file) return NextResponse.redirect(file);

  if (sampleOn() && id.startsWith("sample-")) {
    const body = JSON.stringify({ id: content.id, kind: content.kind, name: content.name, revision: content.revision, sample: true }, null, 2);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${content.id}.json"`,
      },
    });
  }

  return NextResponse.redirect("yorehold://content/" + encodeURIComponent(content.id));
}
