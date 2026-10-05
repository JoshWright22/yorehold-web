import Link from "next/link";
import type { ContentItem } from "@/lib/server";
import { levelRange, profileHref, score } from "@/lib/format";
import { Card, Chip } from "./ui";

export default function ContentList({ items, empty }: { items: ContentItem[]; empty: string }) {
  if (items.length === 0) return <p className="empty">{empty}</p>;
  return (
    <div className="card-grid">
      {items.map((item) => (
        <Card
          key={item.id}
          href={"/c/" + encodeURIComponent(item.id)}
          kind={item.kind}
          title={item.name}
          byline={
            <>
              by <Link href={profileHref(item.author)}>{item.author.name || "unknown"}</Link>
            </>
          }
          stats={[
            { label: "Score", value: score(item.score) },
            { label: "Lvl", value: item.levelMin || item.levelMax ? levelRange(item).replace(/^Levels? /, "") : "any" },
            { label: "Rev", value: String(item.revision) },
          ]}
        >
          {item.description ? <p className="summary">{item.description}</p> : null}
          {item.tags.length > 0 ? (
            <p className="chips">
              {item.tags.slice(0, 4).map((tag) => (
                <Chip key={tag} href={"/library?tag=" + encodeURIComponent(tag)}>
                  {tag}
                </Chip>
              ))}
            </p>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
