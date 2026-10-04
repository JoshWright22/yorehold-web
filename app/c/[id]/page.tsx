import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FailureNotice } from "@/components/Notice";
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

  return (
    <article className="content-page">
      <header>
        <p className="meta">
          <span className="kind">{content.kind}</span>
          {content.hidden ? <span className="hidden-mark">hidden by a moderator</span> : null}
        </p>
        <h1>{content.name}</h1>
        <p className="meta">
          <span>
            by <Link href={profileHref(content.author)}>{content.author.name || "unknown"}</Link>
          </span>
          <span>{levelRange(content)}</span>
          <span>revision {content.revision}</span>
          {content.rulesetVersion ? <span>ruleset {content.rulesetVersion}</span> : null}
          <span>updated {date(content.updatedAt)}</span>
        </p>
      </header>

      <section className="vote" aria-label="Votes">
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
          <span className="vote-score" title={content.votesUp + " up, " + content.votesDown + " down"}>
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
        <p className="muted">
          {content.votesUp} up, {content.votesDown} down.{" "}
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

      <section className="open">
        <a href={"yorehold://content/" + encodeURIComponent(content.id)} className="button">
          Open in Yorehold
        </a>
        {fileLink ? (
          <a href={fileLink} className="button secondary" rel="noopener noreferrer">
            Download the file{content.fileSize ? " (" + fileSize(content.fileSize) + ")" : ""}
          </a>
        ) : null}
        <p className="muted">
          The button opens the game if it is installed. If nothing happens,{" "}
          {fileLink ? "download the file and open it from the game, or " : ""}
          <a href={downloadUrl()}>get the game</a>.
        </p>
      </section>

      <section>
        <h2>About</h2>
        {content.description ? (
          <p className="description">{content.description}</p>
        ) : (
          <p className="muted">No description.</p>
        )}
        {content.tags.length > 0 ? (
          <ul className="tags">
            {content.tags.map((tag) => (
              <li key={tag}>
                <Link href={"/library?tag=" + encodeURIComponent(tag)}>{tag}</Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section>
        <h2>File</h2>
        <dl className="facts">
          <dt>Id</dt>
          <dd>{content.id}</dd>
          <dt>Revision</dt>
          <dd>{content.revision}</dd>
          <dt>Published</dt>
          <dd>{date(content.createdAt)}</dd>
          {content.fileSize ? (
            <>
              <dt>Size</dt>
              <dd>{fileSize(content.fileSize)}</dd>
            </>
          ) : null}
          <dt>SHA-256</dt>
          <dd className="hash">{content.fileHash}</dd>
        </dl>
      </section>

      <p className="muted">
        Something wrong with this? <Link href={path + "/report"}>Report it</Link>.
      </p>
    </article>
  );
}
