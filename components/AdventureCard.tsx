"use client";

// One adventure in the browser: its picture with the name on it, then who wrote it, the levels,
// tags, score, and the favourite and download buttons.

import Link from "next/link";
import { artStyle } from "./ui";
import { artFor } from "@/lib/art";
import { toggleFavourite, useFavourites, type Favourite } from "@/lib/favourites";
import { levelRange, profileHref, score } from "@/lib/format";

export type CardItem = Omit<Favourite, "savedAt">;

export function AdventureCard({ item }: { item: CardItem }) {
  const favourites = useFavourites();
  const favourite = favourites.some((entry) => entry.id === item.id);
  const href = "/c/" + encodeURIComponent(item.id);

  return (
    <article className={"adv-card kind-" + item.kind}>
      <Link href={href} className="adv-cover" style={artStyle(artFor(item.id))}>
        <span className="adv-name">{item.name}</span>
      </Link>
      <p className="adv-by">
        by <Link href={profileHref(item.author)}>{item.author.name || "unknown"}</Link>
      </p>
      <div className="adv-body">
        <p className="adv-meta">
          <span className="kind-mark" aria-hidden="true" />
          {item.kind === "definitions" ? "pack" : item.kind}
          <span>{levelRange(item)}</span>
        </p>
        {item.description ? <p className="adv-text">{item.description}</p> : null}
        <p className="adv-foot">
          <span className="adv-tags">
            {item.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={"/adventures?tag=" + encodeURIComponent(tag)} className="chip">
                {tag}
              </Link>
            ))}
          </span>
          <span className="adv-score num" title={item.votesUp + " up, " + item.votesDown + " down"}>
            {score(item.score)}
          </span>
          <button
            type="button"
            className={favourite ? "adv-button on" : "adv-button"}
            aria-pressed={favourite}
            onClick={() => toggleFavourite(item)}
          >
            {favourite ? "Favourited" : "Favourite"}
          </button>
          <a href={href + "/download"} className="adv-button" download>
            Download
          </a>
        </p>
      </div>
    </article>
  );
}

// The favourites tab: drawn from this browser alone, newest favourite first.
export function FavouriteGrid({ text }: { text: string }) {
  const favourites = useFavourites();
  const needle = text.toLowerCase();
  const shown = favourites.filter((item) => !needle || item.name.toLowerCase().includes(needle) || item.description.toLowerCase().includes(needle));
  if (favourites.length === 0) {
    return <p className="list-empty">No favourites yet. Press Favourite on any adventure and it shows up here.</p>;
  }
  if (shown.length === 0) return <p className="list-empty">None of your favourites match.</p>;
  return (
    <div className="adv-grid">
      {shown.map((item) => (
        <AdventureCard key={item.id} item={item} />
      ))}
    </div>
  );
}
