import type { Metadata } from "next";
import Link from "next/link";
import { FailureNotice } from "@/components/Notice";
import { PageHead } from "@/components/ui";
import { allContent } from "@/lib/catalog";
import type { ContentItem } from "@/lib/server";

export const metadata: Metadata = { title: "Index" };
export const dynamic = "force-dynamic";

// Bands by the lowest level an adventure is written for, the way a reference site splits a long
// list into numbered ranges.
const bands: { id: string; label: string; from: number; to: number }[] = [
  { id: "levels-1-4", label: "Levels 1 to 4", from: 1, to: 4 },
  { id: "levels-5-10", label: "Levels 5 to 10", from: 5, to: 10 },
  { id: "levels-11-16", label: "Levels 11 to 16", from: 11, to: 16 },
  { id: "levels-17-20", label: "Levels 17 to 20", from: 17, to: 100 },
  { id: "any-level", label: "Any level", from: 0, to: 0 },
];

function bandOf(item: ContentItem): string {
  const start = item.levelMin || 0;
  return (bands.find((band) => start >= band.from && start <= band.to) ?? bands[bands.length - 1]).id;
}

// The first sentence is enough for a line in an index.
function firstSentence(text: string): string {
  const match = /^.*?[.!?](\s|$)/.exec(text);
  return (match ? match[0] : text).trim();
}

function Lines({ items }: { items: ContentItem[] }) {
  return (
    <ul className="index-list">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={"/c/" + encodeURIComponent(item.id)}>{item.name}</Link>
          {item.description ? <span> - {firstSentence(item.description)}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export default async function Index() {
  const [adventures, packs] = await Promise.all([allContent("adventure"), allContent("definitions")]);

  return (
    <>
      <PageHead title="Index" kicker="Adventures">
        <p>Every published adventure by the level it starts at, then every pack. Names in order; each line is the first sentence of its description.</p>
      </PageHead>

      {!adventures.ok ? (
        <FailureNotice failure={adventures} what="the index" />
      ) : (
        <div className="index-page">
          <nav className="index-toc" aria-label="Contents">
            <p className="index-toc-head">Contents</p>
            <ol>
              {bands.map((band) => (
                <li key={band.id}>
                  <a href={"#" + band.id}>{band.label}</a>
                </li>
              ))}
              <li>
                <a href="#packs">Packs</a>
              </li>
            </ol>
          </nav>

          {bands.map((band) => {
            const inBand = adventures.items.filter((item) => bandOf(item) === band.id);
            return (
              <section key={band.id} id={band.id} className="index-band">
                <h2>
                  {band.label} <span className="num">{inBand.length}</span>
                </h2>
                {inBand.length > 0 ? <Lines items={inBand} /> : <p className="list-empty">None yet.</p>}
              </section>
            );
          })}

          <section id="packs" className="index-band">
            <h2>
              Packs <span className="num">{packs.ok ? packs.items.length : "-"}</span>
            </h2>
            {packs.ok ? packs.items.length > 0 ? <Lines items={packs.items} /> : <p className="list-empty">None yet.</p> : <FailureNotice failure={packs} what="packs" />}
          </section>

          {adventures.cut ? <p className="muted small">The library is larger than this page lists; search the rest from Adventures.</p> : null}
        </div>
      )}
    </>
  );
}
