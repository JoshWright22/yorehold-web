import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FailureNotice } from "@/components/Notice";
import { artStyle, Button, Chip, StatBlock, StatTile } from "@/components/ui";
import { date, fileSize, first, levelRange, profileHref, score, webUrl } from "@/lib/format";
import { Codes, contentGet, downloadUrl, isId } from "@/lib/server";
import { getSession } from "@/lib/session";
import { voteAction } from "./actions";

export const dynamic = "force-dynamic";

type Query = { [key: string]: string | string[] | undefined };
type Props = { params: Promise<{ id: string }>; searchParams: Promise<Query> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: id };
}

export default async function ContentPage({ params, searchParams }: Props) {
  const { id } = await params;
  if (!isId(id)) notFound();

  const session = await getSession();
  const result = await contentGet(id, session?.token);
  if (!result.ok) {
    if (result.code === Codes.notFound) notFound();
    return (
      <>
        <h1>{id}</h1>
        <FailureNotice failure={result} what="this content" />
      </>
    );
  }

  const { content, myVote } = result.data;
  const voteProblem = first((await searchParams).vote);
  const fileLink = webUrl(content.fileUrl);
  const path = "/c/" + encodeURIComponent(content.id);

  const file = {
    kind: content.kind,
    title: "File",
    subtitle: "What the game downloads",
    stats: [
      { label: "Id", value: content.id },
      { label: "Revision", value: String(content.revision) },
      { label: "Published", value: date(content.createdAt) },
      { label: "Updated", value: date(content.updatedAt) },
      ...(content.fileSize ? [{ label: "Size", value: fileSize(content.fileSize) }] : []),
      ...(content.rulesetVersion ? [{ label: "Ruleset", value: content.rulesetVersion }] : []),
    ],
  };

  return (
    <article className="content-page">
      {/* No uploaded art yet, so every content page gets the same picture. */}
      <header className="page-head banner" style={artStyle("ruins")}>
        <p className="chips">
          <Chip kind={content.kind}>{content.kind}</Chip>
          {content.hidden ? <Chip kind="hidden">hidden by a moderator</Chip> : null}
        </p>
        <h1>{content.name}</h1>
        <p className="byline">
          by <Link href={profileHref(content.author)}>{content.author.name || "unknown"}</Link>
        </p>
      </header>

      <div className="content-layout">
        <div className="content-main">
          <div className="stat-tiles">
            <StatTile label="Score" value={score(content.score)} tone="gold" />
            <StatTile label="Levels" value={levelRange(content).replace(/^Levels? /, "")} />
            <StatTile label="Revision" value={content.revision} />
            <StatTile label="Votes" value={content.votesUp + content.votesDown} />
          </div>

          <section className="open">
            <p className="actions">
              <Button href={"yorehold://content/" + encodeURIComponent(content.id)} big>
                Open in Yorehold
              </Button>
              {fileLink ? (
                <Button href={fileLink} tone="secondary" big external>
                  Download the file{content.fileSize ? " (" + fileSize(content.fileSize) + ")" : ""}
                </Button>
              ) : null}
            </p>
            <p className="muted small">
              The button opens the game if it is installed. If nothing happens,{" "}
              {fileLink ? "download the file and open it from the game, or " : ""}
              <a href={downloadUrl()}>get the game</a>.
            </p>
          </section>

          <section className="panel">
            <h2>About</h2>
            {content.description ? (
              <p className="description">{content.description}</p>
            ) : (
              <p className="muted">No description.</p>
            )}
            {content.tags.length > 0 ? (
              <p className="chips">
                {content.tags.map((tag) => (
                  <Chip key={tag} href={"/library?tag=" + encodeURIComponent(tag)}>
                    {tag}
                  </Chip>
                ))}
              </p>
            ) : null}
          </section>
        </div>

        <aside className="content-side">
          <section className="panel vote" aria-label="Votes">
            <h2>Vote</h2>
            <form action={voteAction}>
              <input type="hidden" name="id" value={content.id} />
              <button
                type="submit"
                name="vote"
                value={myVote === "up" ? "clear" : "up"}
                className={myVote === "up" ? "vote-button chosen" : "vote-button"}
                aria-pressed={myVote === "up"}
              >
                Up
              </button>
              <span className="vote-score num" title={content.votesUp + " up, " + content.votesDown + " down"}>
                {score(content.score)}
              </span>
              <button
                type="submit"
                name="vote"
                value={myVote === "down" ? "clear" : "down"}
                className={myVote === "down" ? "vote-button chosen" : "vote-button"}
                aria-pressed={myVote === "down"}
              >
                Down
              </button>
            </form>
            <p className="muted small">
              <span className="num">{content.votesUp}</span> up, <span className="num">{content.votesDown}</span> down.{" "}
              {session ? null : (
                <>
                  <Link href={"/login?next=" + encodeURIComponent(path)}>Sign in</Link> to vote.
                </>
              )}
            </p>
            {voteProblem === "offline" ? (
              <p className="notice offline" role="status">
                <strong>Offline.</strong> The game server can&apos;t be reached, so the vote wasn&apos;t counted.
              </p>
            ) : null}
            {voteProblem === "failed" ? (
              <p className="notice error" role="status">
                The vote wasn&apos;t counted. Try again.
              </p>
            ) : null}
          </section>

          <StatBlock sheet={file}>
            <p className="sb-hash">
              <strong>SHA-256. </strong>
              <span className="hash">{content.fileHash}</span>
            </p>
          </StatBlock>

          <p className="muted small">
            Something wrong with this? <Link href={path + "/report"}>Report it</Link>.
          </p>
        </aside>
      </div>
    </article>
  );
}
