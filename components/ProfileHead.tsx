import type { ReactNode } from "react";
import { Avatar, ProfileCover } from "./Appearance";
import { StatTile } from "./ui";

// The top of a profile: the player's background across the top, their picture over its lower
// edge, the name and a row of numbers. Without a picture or background of their own a profile gets
// a stock picture and a letter.
export default function ProfileHead({
  userId = "",
  name,
  kicker,
  tiles,
  children,
}: {
  userId?: string;
  name: string;
  kicker?: string;
  tiles?: { label: string; value: ReactNode; tone?: string }[];
  children?: ReactNode;
}) {
  return (
    <header className="profile-head">
      <ProfileCover userId={userId} />
      <div className="profile-row">
        <Avatar userId={userId} name={name} size="large" />
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
