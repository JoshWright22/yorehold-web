import Link from "next/link";
import ContentList from "@/components/ContentList";
import { FailureNotice } from "@/components/Notice";
import { contentSearch } from "@/lib/server";

// Asked of the server on every visit, never baked in at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  // "Featured" is the best-scored content until the canon process picks it.
  const [featured, newest] = await Promise.all([
    contentSearch({ sort: "score", limit: 6 }),
    contentSearch({ sort: "new", limit: 6 }),
  ]);

  return (
    <>
      <section className="hero">
        <h1>Yorehold</h1>
        <p>
          A library of adventures played with one set of rules, written and shared by players. Browse what others have
          made, vote on it, and open it in the game.
        </p>
        <p className="actions">
          <Link href="/library" className="button">
            Browse the library
          </Link>
          <Link href="/play" className="button secondary">
            Play
          </Link>
        </p>
      </section>

      <section>
        <h2>Featured</h2>
        {featured.ok ? (
          <ContentList items={featured.data.content} empty="Nothing has been published yet." />
        ) : (
          <FailureNotice failure={featured} what="featured content" />
        )}
      </section>

      <section>
        <h2>Newest</h2>
        {newest.ok ? (
          <ContentList items={newest.data.content} empty="Nothing has been published yet." />
        ) : (
          <FailureNotice failure={newest} what="the newest content" />
        )}
      </section>
    </>
  );
}
