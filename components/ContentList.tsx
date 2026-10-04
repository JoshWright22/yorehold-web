import Link from "next/link";
import type { ContentItem } from "@/lib/server";
import { levelRange, profileHref, score } from "@/lib/format";

export default function ContentList({ items, empty }: { items: ContentItem[]; empty: string }) {
  if (items.length === 0) return <p className="muted">{empty}</p>;
  return (
    <ul className="content-list">
      {items.map((item) => (
        <li key={item.id} className="card">
          <div className="card-score" title={item.votesUp + " up, " + item.votesDown + " down"}>
            {score(item.score)}
          </div>
          <div className="card-body">
            <h3>
              <Link href={"/c/" + encodeURIComponent(item.id)}>{item.name}</Link>
            </h3>
            <p className="meta">
              <span className="kind">{item.kind}</span>
              <span>{levelRange(item)}</span>
              <span>
                by <Link href={profileHref(item.author)}>{item.author.name || "unknown"}</Link>
              </span>
              <span>revision {item.revision}</span>
            </p>
            {item.description ? <p className="summary">{item.description}</p> : null}
            {item.tags.length > 0 ? (
              <ul className="tags">
                {item.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={"/library?tag=" + encodeURIComponent(tag)}>{tag}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
