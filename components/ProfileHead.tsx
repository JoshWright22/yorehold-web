import type { ReactNode } from "react";
import { artStyle, StatTile } from "./ui";

// The top of a profile: a cover picture, the avatar over its lower edge, the name and a row of
// numbers. Nobody can upload art yet, so every profile gets the same picture and a letter.
export default function ProfileHead({
  name,
  kicker,
  tiles,
  children,
}: {
  name: string;
  kicker?: string;
  tiles?: { label: string; value: ReactNode; tone?: string }[];
  children?: ReactNode;
}) {
  return (
    <header className="profile-head">
      <div className="banner profile-banner" style={artStyle("peaks")} aria-hidden="true" />
      <div className="profile-row">
        <span className="avatar large" aria-hidden="true">
          {(name.trim()[0] ?? "?").toUpperCase()}
        </span>
        <div className="profile-name">
          {kicker ? <p className="kicker">{kicker}</p> : null}
          <h1>{name}</h1>
        </div>
        {children ? <div className="profile-actions">{children}</div> : null}
      </div>
      {tiles && tiles.length > 0 ? (
        <div className="stat-tiles">
          {tiles.map((tile) => (
            <StatTile key={tile.label} label={tile.label} value={tile.value} tone={tile.tone} />
          ))}
        </div>
      ) : null}
    </header>
  );
}
