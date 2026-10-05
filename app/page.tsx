import Link from "next/link";
import ContentList from "@/components/ContentList";
import { FailureNotice } from "@/components/Notice";
import { Button, CardRow, Cover } from "@/components/ui";
import { compendiumKinds, loadKind } from "@/lib/compendium";
import { profileHref, score } from "@/lib/format";
import { contentSearch, downloadUrl, type ContentItem } from "@/lib/server";

// Asked of the server on every visit, never baked in at build time.
export const dynamic = "force-dynamic";

interface Writer {
  id: string;
  name: string;
  works: number;
  score: number;
}

// Top writers come from what the page already loaded, until the server ranks writers itself.
function topWriters(items: ContentItem[]): Writer[] {
  const byId = new Map<string, Writer>();
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const writer = byId.get(item.author.id) ?? { id: item.author.id, name: item.author.name || "unknown", works: 0, score: 0 };
    writer.works += 1;
    writer.score += item.score;
    byId.set(item.author.id, writer);
  }
  return [...byId.values()].sort((a, b) => b.score - a.score || b.works - a.works).slice(0, 6);
}

export default async function Home() {
  // "Top rated" is the best-scored content until the canon process picks it.
  const [featured, newest, counts] = await Promise.all([
    contentSearch({ sort: "score", limit: 6 }),
    contentSearch({ sort: "new", limit: 6 }),
    Promise.all(compendiumKinds.map(async (kind) => ({ kind, count: (await loadKind(kind.id)).length }))),
  ]);

  const writers = topWriters([...(featured.ok ? featured.data.content : []), ...(newest.ok ? newest.data.content : [])]);

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="kicker">Made by players, played with one set of rules</p>
          <h1>Yorehold</h1>
          <p className="hero-pitch">
            Tactical fantasy adventures written and shared by players. Browse what others have made, vote on it, and
            open it in the game.
          </p>
          <p className="hero-actions">
            <Button href={downloadUrl()} big external>
              Download
            </Button>
            <Button href="/play" tone="secondary" big>
              Play in the browser
            </Button>
          </p>
          <p className="hero-note">Free. Windows for now.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-tile t1" />
          <div className="hero-tile t2" />
          <div className="hero-tile t3" />
        </div>
      </section>

      <CardRow title="New chapters" more={{ href: "/library?sort=new", label: "See all" }}>
        {newest.ok ? (
          <ContentList items={newest.data.content} empty="Nothing has been published yet." />
        ) : (
          <FailureNotice failure={newest} what="the newest content" />
        )}
      </CardRow>

      <CardRow title="Top rated" more={{ href: "/library", label: "See all" }}>
        {featured.ok ? (
          <ContentList items={featured.data.content} empty="Nothing has been published yet." />
        ) : (
          <FailureNotice failure={featured} what="top rated content" />
        )}
      </CardRow>

      <CardRow title="Top writers">
        {writers.length > 0 ? (
          <div className="writer-grid">
            {writers.map((writer) => (
              <Link key={writer.id} href={profileHref(writer)} className="writer-card">
                <span className="avatar" aria-hidden="true">
                  {writer.name[0]?.toUpperCase()}
                </span>
                <span className="writer-name">{writer.name}</span>
                <span className="writer-stats num">
                  {writer.works} {writer.works === 1 ? "work" : "works"}, {score(writer.score)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="empty">Writers show up here once their work is in the library.</p>
        )}
      </CardRow>

      <CardRow title="In the compendium" more={{ href: "/compendium", label: "Open" }}>
        <div className="kind-grid">
          {counts.map(({ kind, count }) => (
            <Link key={kind.id} href={"/compendium/" + kind.id} className={"kind-tile kind-" + kind.id}>
              <span className="kind-count num">{count}</span>
              <span className="kind-name">{kind.label}</span>
            </Link>
          ))}
        </div>
      </CardRow>

      <CardRow title="News">
        <div className="card-grid">
          <article className="card placeholder-card">
            <div className="card-cover">
              <Cover kind="news" name="News" />
            </div>
            <div className="card-body">
              <h3>No news yet</h3>
              <p className="summary">Updates to the game and the site will be posted here.</p>
            </div>
          </article>
        </div>
      </CardRow>
    </>
  );
}
