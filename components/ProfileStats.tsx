import type { ReactNode } from "react";
import Link from "next/link";
import Graph from "./Graph";
import { date } from "@/lib/format";
import type { ContentItem, ProfileStatsResponse, Result } from "@/lib/server";
import { rankWriters, tallyWriters } from "@/lib/writers";

// "41d 12h 22m", the way a play-time counter reads; days are left out until there are some.
export function duration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  return (days > 0 ? days + "d " : "") + hours + "h " + rest + "m";
}

function count(value: number): string {
  return value.toLocaleString("en-GB");
}

function Big({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="pstats-big">
      <span className="pstats-big-label">{label}</span>
      <span className="pstats-big-value num">{value}</span>
      {note ? <span className="pstats-big-note">{note}</span> : null}
    </div>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="pstats-rows">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className="num">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// The stats under a profile's header, in two halves like a score site: what this account has
// done as a player, and what its writing has earned. Play numbers come from the server; the
// writing numbers are counted from the library, so they show even before the server counts plays.
export default function ProfileStats({
  userId,
  stats,
  library,
}: {
  userId: string;
  stats: Result<ProfileStatsResponse>;
  library: ContentItem[];
}) {
  const ranked = rankWriters(tallyWriters(library), "score");
  const place = ranked.findIndex((writer) => writer.id === userId);
  const writer = place >= 0 ? ranked[place] : null;
  const favouriteRank = writer ? rankWriters(ranked, "favourites").findIndex((entry) => entry.id === userId) + 1 : 0;
  const player = stats.ok ? stats.data.player : null;
  const plays = stats.ok ? stats.data.writer : null;

  return (
    <section className="pstats" aria-label="Stats">
      <div className="pstats-half">
        <h2>As a player</h2>
        {player ? (
          <>
            <div className="pstats-bigs">
              <Big label="Player rank" value={player.rank ? "#" + count(player.rank) : "-"} note="by play time" />
              <Big label="Play time" value={duration(player.playTime)} />
            </div>
            <Rows
              rows={[
                ["Adventures finished", count(player.adventuresFinished)],
                ["Adventures started", count(player.adventuresStarted)],
                ["Sessions", count(player.sessions)],
                ["Longest session", duration(player.longestSession)],
                ["Characters made", count(player.charactersMade)],
                ["Characters fallen", count(player.charactersFallen)],
                ["Joined", date(player.joinedAt)],
                ["Last played", date(player.lastPlayedAt)],
              ]}
            />
            <h3>Hours played each month</h3>
            <Graph points={player.hoursMonthly} shape="bars" unit="hours" pointLabel="month of" />
          </>
        ) : (
          <p className="list-empty">Play time and adventures played show here once the game server counts them.</p>
        )}
      </div>

      <div className="pstats-half">
        <h2>As a writer</h2>
        {writer ? (
          <>
            <div className="pstats-bigs">
              <Big label="Writer rank" value={"#" + count(place + 1)} note={"of " + count(ranked.length) + " by score"} />
              <Big label="Score" value={(writer.score > 0 ? "+" : "") + count(writer.score)} />
            </div>
            <Rows
              rows={[
                ["Works", count(writer.works)],
                ["Adventures", count(writer.adventures)],
                ["Packs", count(writer.packs)],
                ["Up votes", count(writer.upvotes)],
                ["Down votes", count(writer.downvotes)],
                ["Favourited", count(writer.favourites) + (favouriteRank ? " (#" + favouriteRank + ")" : "")],
                ["Played by others", plays ? count(plays.plays) + " times" : "-"],
                ["Finished by others", plays ? count(plays.finishes) + " times" : "-"],
                ["Time others spent in it", plays ? duration(plays.timePlayed) : "-"],
                [
                  "Best work",
                  <Link key="best" href={"/c/" + encodeURIComponent(writer.best.id)}>
                    {writer.best.name}
                  </Link>,
                ],
              ]}
            />
            {plays ? (
              <>
                <h3>Plays of their work each month</h3>
                <Graph points={plays.playsMonthly} shape="line" unit="plays" pointLabel="month of" />
              </>
            ) : null}
          </>
        ) : (
          <p className="list-empty">Nothing published yet. Writing stats start with the first published adventure or pack.</p>
        )}
      </div>
    </section>
  );
}
