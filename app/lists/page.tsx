import type { Metadata } from "next";
import Link from "next/link";
import { FailureNotice } from "@/components/Notice";
import { PageHead } from "@/components/ui";
import { allContent } from "@/lib/catalog";
import { levelRange } from "@/lib/format";
import { lists } from "@/lib/lists";

export const metadata: Metadata = { title: "Curated lists" };
export const dynamic = "force-dynamic";

export default async function Lists() {
  const result = await allContent();

  return (
    <>
      <PageHead title="Curated lists" kicker="Adventures">
        <p>Adventures picked by hand and put in order, with a line on why.</p>
      </PageHead>
      {!result.ok ? (
        <FailureNotice failure={result} what="the lists" />
      ) : (
        <div className="curated">
          {lists.map((list) => {
            const byId = new Map(result.items.map((item) => [item.id, item]));
            const found = list.entries.map((id) => byId.get(id)).filter((item) => item !== undefined);
            if (found.length === 0) return null;
            return (
              <section key={list.id} id={list.id} className="curated-list">
                <h2>{list.title}</h2>
                <p className="curated-line">{list.line}</p>
                <ol>
                  {found.map((item) => (
                    <li key={item.id}>
                      <Link href={"/c/" + encodeURIComponent(item.id)}>{item.name}</Link>
                      <span className="curated-meta">
                        {item.author.name || "unknown"} · {levelRange(item)}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
