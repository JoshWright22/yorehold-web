import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import CompletionList from "@/components/CompletionList";
import ContentList from "@/components/ContentList";
import { FailureNotice } from "@/components/Notice";
import ProfileHead from "@/components/ProfileHead";
import Tabs from "@/components/Tabs";
import { first, score } from "@/lib/format";
import { completionsList, contentSearch, isUserId, userByName } from "@/lib/server";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type Query = { [key: string]: string | string[] | undefined };
type Props = { params: Promise<{ name: string }>; searchParams: Promise<Query> };

// The name arrives as it was in the address, percent signs and all.
function decoded(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: decoded((await params).name) };
}

export default async function Profile({ params, searchParams }: Props) {
  const name = decoded((await params).name);
  const idParam = first((await searchParams).id);

  // Links from content pages carry the user id. Without one the name has to be looked up, which
  // the server only does for a signed-in visitor.
  let userId = isUserId(idParam) ? idParam : isUserId(name) ? name : "";
  let shownName = name;
  let lookupNote: ReactNode = null;

  if (userId === "") {
    const session = await getSession();
    if (session && session.name === name) {
      userId = session.userId;
    } else if (session) {
      const found = await userByName(name, session.token);
      if (!found.ok) {
        lookupNote = <FailureNotice failure={found} what="this profile" />;
      } else if (found.data) {
        userId = found.data.id;
        shownName = found.data.username || name;
      } else {
        lookupNote = <p className="muted">Nobody here goes by that name.</p>;
      }
    } else {
      lookupNote = (
        <p className="notice">
          <Link href={"/login?next=" + encodeURIComponent("/u/" + encodeURIComponent(name))}>Sign in</Link> to look a
          player up by name. Links from content pages work without signing in.
        </p>
      );
    }
  }

  if (userId === "") {
    return (
      <>
        <ProfileHead name={shownName} kicker="Player" />
        {lookupNote}
      </>
    );
  }

  const [published, completed] = await Promise.all([
    contentSearch({ author: userId, sort: "new", limit: 50 }),
    completionsList(userId, 50),
  ]);

  // The name a profile is known by is the one on its published work.
  if (published.ok && published.data.content[0]?.author.name && isUserId(shownName)) {
    shownName = published.data.content[0].author.name;
  }

  const works = published.ok ? published.data.content : [];
  const finished = completed.ok ? completed.data.completions : [];

  return (
    <>
      <ProfileHead
        name={shownName}
        kicker="Writer"
        tiles={[
          { label: "Published", value: published.ok ? works.length : "-" },
          { label: "Total score", value: published.ok ? score(works.reduce((total, item) => total + item.score, 0)) : "-", tone: "gold" },
          { label: "Adventures finished", value: completed.ok ? finished.length : "-" },
        ]}
      />

      <Tabs
        label="Profile"
        tabs={[
          {
            id: "published",
            label: "Published",
            count: published.ok ? works.length : undefined,
            panel: published.ok ? (
              <ContentList items={works} empty="Nothing published yet." />
            ) : (
              <FailureNotice failure={published} what="published work" />
            ),
          },
          {
            id: "completed",
            label: "Completed",
            count: completed.ok ? finished.length : undefined,
            panel: completed.ok ? (
              <CompletionList completions={finished} empty="No adventures finished yet." />
            ) : (
              <FailureNotice failure={completed} what="completed adventures" />
            ),
          },
        ]}
      />
    </>
  );
}
