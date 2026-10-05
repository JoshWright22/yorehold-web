import type { ReactNode } from "react";
import { StatTile } from "./ui";

// The top of a profile: a cover banner, the avatar over its edge, the name and a row of numbers.
// There is no uploaded art yet, so both are flat placeholders.
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
      <div className="profile-banner" aria-hidden="true" />
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
