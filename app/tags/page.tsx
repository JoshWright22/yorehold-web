import type { Metadata } from "next";
import Link from "next/link";
import { FailureNotice } from "@/components/Notice";
import { PageHead } from "@/components/ui";
import { allContent } from "@/lib/catalog";

export const metadata: Metadata = { title: "Tags" };
export const dynamic = "force-dynamic";

// Every tag in the library with how often it is used: the most used as a cloud on top, then all
// of them A to Z with the adventures under each.
export default async function Tags() {
  const result = await allContent();

  return (
    <>
      <PageHead title="Tags" kicker="Adventures">
        <p>Every tag writers have used. Pick one to see what carries it.</p>
      </PageHead>
      {!result.ok ? (
        <FailureNotice failure={result} what="the tags" />
      ) : (
        (() => {
          const byTag = new Map<string, { id: string; name: string }[]>();
          for (const item of result.items) {
            for (const tag of item.tags) {
              const list = byTag.get(tag) ?? [];
              list.push({ id: item.id, name: item.name });
              byTag.set(tag, list);
            }
          }
          const tags = [...byTag.entries()].sort((a, b) => a[0].localeCompare(b[0]));
          const most = Math.max(1, ...tags.map(([, list]) => list.length));
          if (tags.length === 0) return <p className="list-empty">No tags yet.</p>;
          return (
            <>
              <p className="tag-cloud">
                {[...tags]
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([tag, list]) => (
                    // Three sizes are enough to read which tags matter without a font ramp.
                    <Link key={tag} href={"/adventures?tag=" + encodeURIComponent(tag)} className={"tag-cloud-" + Math.ceil((list.length / most) * 3)}>
                      {tag}
                      <span className="num">{list.length}</span>
                    </Link>
                  ))}
              </p>
              <dl className="tag-table">
                {tags.map(([tag, list]) => (
                  <div key={tag}>
                    <dt>
                      <Link href={"/adventures?tag=" + encodeURIComponent(tag)}>{tag}</Link>
                    </dt>
                    <dd>
                      {list.map((entry, index) => (
                        <span key={entry.id}>
                          {index > 0 ? ", " : ""}
                          <Link href={"/c/" + encodeURIComponent(entry.id)}>{entry.name}</Link>
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          );
        })()
      )}
    </>
  );
}
