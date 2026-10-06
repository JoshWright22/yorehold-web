import Link from "next/link";
import { FailureNotice } from "@/components/Notice";
import RankedTable from "@/components/RankedTable";
import { artStyle, Button, NewsList, RankList, Section, type RankItem } from "@/components/ui";
import { compendiumKinds, loadKind } from "@/lib/compendium";
import { profileHref, score } from "@/lib/format";
import { news } from "@/lib/news";
import { rankedRows } from "@/lib/rows";
import { contentSearch, downloadUrl, type ContentItem } from "@/lib/server";

// Asked of the server on every visit, never baked in at build time.
export const dynamic = "force-dynamic";

// The most the server gives in one answer.
const loaded = 50;

const kindFilters = [
  { label: "All", kind: "" },
  { label: "Adventures", kind: "adventure" },
  { label: "Rulesets", kind: "ruleset" },
  { label: "Definitions", kind: "definitions" },
];

// Top writers come from what the page already loaded, until the server ranks writers itself.
function topWriters(items: ContentItem[]): RankItem[] {
  const byId = new Map<string, { id: string; name: string; works: number; score: number }>();
  for (const item of items) {
    const writer = byId.get(item.author.id) ?? { id: item.author.id, name: item.author.name || "unknown", works: 0, score: 0 };
    writer.works += 1;
    writer.score += item.score;
    byId.set(item.author.id, writer);
  }
  return [...byId.values()]
    .sort((a, b) => b.score - a.score || b.works - a.works)
    .slice(0, 10)
    .map((writer) => ({
      href: profileHref(writer),
      label: writer.name,
      note: writer.works + (writer.works === 1 ? " work" : " works"),
      value: score(writer.score),
    }));
}

export default async function Home() {
  const [latest, counts] = await Promise.all([
    contentSearch({ sort: "new", limit: loaded }),
    Promise.all(compendiumKinds.map(async (kind) => ({ kind, count: (await loadKind(kind.id)).length }))),
  ]);

  const items = latest.ok ? latest.data.content : [];

  return (
    <>
      <header className="hero" style={artStyle("dragon")}>
        <p className="kicker">Yorehold, a turn-based fantasy game</p>
        <h1>Players write the adventures.</h1>
        <div className="hero-foot">
          <p className="hero-line">Everyone plays by one set of rules. Pick an adventure from the library, or write your own and publish it.</p>
          <div className="hero-get">
            <Button href={downloadUrl()} big external>
              Download
            </Button>
            <Button href="/play" tone="secondary" big>
              Play
            </Button>
            <p className="hero-platform">Free. Windows for now.</p>
          </div>
        </div>
      </header>

      <nav className="figures" aria-label="In the compendium">
        {counts.map(({ kind, count }) => (
          <Link key={kind.id} href={"/compendium/" + kind.id}>
            <span className="figure-label">{kind.label}</span>
            <span className="figure-value">{count}</span>
          </Link>
        ))}
      </nav>

      <div className="home-columns">
        <Section title="Latest chapters" note={"the newest " + loaded + ", ranked by score"}>
          {latest.ok ? (
            <RankedTable
              rows={rankedRows(items)}
              filters={kindFilters}
              more={{ href: "/library?sort=new", label: "More in the library" }}
              empty="Nothing has been published yet."
            />
          ) : (
            <FailureNotice failure={latest} what="the latest chapters" />
          )}
        </Section>

        <aside className="home-side">
          <Section title="News">
            <NewsList items={news.slice(0, 5)} empty="No news yet." />
          </Section>

          <Section title="Top writers">
            <RankList items={topWriters(items)} ranked empty="Writers show up here once their work is in the library." />
          </Section>
        </aside>
      </div>
    </>
  );
}
