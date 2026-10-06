import Link from "next/link";
import { FailureNotice } from "@/components/Notice";
import RankedTable from "@/components/RankedTable";
import { artStyle, Button, Chip, NewsList, RankList, Section, type RankItem } from "@/components/ui";
import { compendiumKinds, loadKind } from "@/lib/compendium";
import { levelRange, profileHref, score } from "@/lib/format";
import { news } from "@/lib/news";
import { rankedRows } from "@/lib/rows";
import { contentSearch, downloadUrl, stats, type ContentItem } from "@/lib/server";
import Graph from "@/components/Graph";
import { artFor } from "@/lib/art";

// Asked of the server on every visit, never baked in at build time.
export const dynamic = "force-dynamic";

// The most the server gives in one answer.
const loaded = 50;

// The top adventure is the big picture; the next ones are the row under it.
const popularShown = 5;

const kindFilters = [
  { label: "All", kind: "" },
  { label: "Adventures", kind: "adventure" },
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

function Featured({ item }: { item: ContentItem }) {
  return (
    <section className="feature" style={artStyle(artFor(item.id))}>
      <p className="kicker">Top adventure</p>
      <h1>
        <Link href={"/c/" + encodeURIComponent(item.id)}>{item.name}</Link>
      </h1>
      <p className="feature-line">{item.description}</p>
      <p className="feature-meta">
        <span>
          by <Link href={profileHref(item.author)}>{item.author.name || "unknown"}</Link>
        </span>
        <span>{levelRange(item)}</span>
        <span className="num">{score(item.score)}</span>
      </p>
      <p className="feature-tags">
        {item.tags.map((tag) => (
          <Chip key={tag} href={"/adventures?tag=" + encodeURIComponent(tag)}>
            {tag}
          </Chip>
        ))}
      </p>
      <div className="feature-get">
        <Button href={"/c/" + encodeURIComponent(item.id)}>Open</Button>
        <Button href={downloadUrl()} tone="secondary" external>
          Download the game
        </Button>
      </div>
    </section>
  );
}

// What the page leads with when nothing is in the library yet, or the server is away.
function Intro() {
  return (
    <section className="feature" style={artStyle("dragon")}>
      <p className="kicker">Yorehold, a turn-based fantasy game</p>
      <h1>Players write the adventures.</h1>
      <p className="feature-line">Pick an adventure from the library, or write your own and publish it.</p>
      <div className="feature-get">
        <Button href={downloadUrl()} external>
          Download
        </Button>
        <Button href="/play" tone="secondary">
          Play
        </Button>
      </div>
    </section>
  );
}

function PopularRow({ items }: { items: ContentItem[] }) {
  return (
    <ol className="popular-row">
      {items.map((item, index) => (
        <li key={item.id} style={artStyle(artFor(item.id))}>
          <Link href={"/c/" + encodeURIComponent(item.id)}>
            <span className="popular-rank num">{index + 2}</span>
            <span className="popular-name">{item.name}</span>
            <span className="popular-by">
              {item.author.name || "unknown"} · {levelRange(item)}
            </span>
            <span className="popular-score num">{score(item.score)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default async function Home() {
  const [popular, latest, counted, counts] = await Promise.all([
    contentSearch({ kind: "adventure", sort: "score", limit: popularShown }),
    contentSearch({ sort: "new", limit: loaded }),
    stats(),
    Promise.all(compendiumKinds.map(async (kind) => ({ kind, count: (await loadKind(kind.id)).length }))),
  ]);

  const top = popular.ok ? popular.data.content : [];
  const items = latest.ok ? latest.data.content : [];

  return (
    <>
      <div className="home-top">
        {top.length > 0 ? <Featured item={top[0]} /> : <Intro />}

        <aside className="home-news">
          <Section title="News" more={{ href: "/news", label: "All news" }}>
            <NewsList items={news.slice(0, 4)} empty="No news yet." />
          </Section>
          <p className="home-get">
            <Button href={downloadUrl()} external>
              Download
            </Button>
            <Button href="/play" tone="secondary">
              Play
            </Button>
            <span className="hero-platform">Free. Windows for now.</span>
          </p>
        </aside>
      </div>

      {top.length > 1 ? (
        <Section title="Popular adventures" note="ranked by score" more={{ href: "/adventures", label: "All adventures" }}>
          <PopularRow items={top.slice(1)} />
        </Section>
      ) : null}

      {/* Left out entirely until the server counts these; an empty frame would have no job. */}
      {counted.ok ? (
        <div className="home-graphs">
          <Section title="Writing" note="adventures and packs published each week">
            <Graph points={counted.data.publishedWeekly} shape="bars" unit="published" pointLabel="week of" />
          </Section>
          <Section title="Players" note="different players each day">
            <Graph points={counted.data.playersDaily} shape="line" unit="players" pointLabel="on" />
          </Section>
        </div>
      ) : null}

      <nav className="figures" aria-label="In the compendium">
        {counts.map(({ kind, count }) => (
          <Link key={kind.id} href={"/compendium/" + kind.id}>
            <span className="figure-label">{kind.label}</span>
            <span className="figure-value">{count}</span>
          </Link>
        ))}
      </nav>

      <div className="home-columns">
        <Section title="Latest chapters" note={"the newest " + loaded}>
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
          <Section title="Top writers" more={{ href: "/rankings", label: "Rankings" }}>
            <RankList items={topWriters(items)} ranked empty="Writers show up here once their work is in the library." />
          </Section>
        </aside>
      </div>
    </>
  );
}
