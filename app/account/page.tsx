import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CompletionList from "@/components/CompletionList";
import ContentList from "@/components/ContentList";
import { FailureNotice } from "@/components/Notice";
import ProfileHead from "@/components/ProfileHead";
import Tabs from "@/components/Tabs";
import { Button } from "@/components/ui";
import { profileHref, score } from "@/lib/format";
import { completionsList, contentSearch } from "@/lib/server";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function Account() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const [published, completed] = await Promise.all([
    contentSearch({ author: session.userId, sort: "new", limit: 50 }),
    completionsList(session.userId, 50),
  ]);

  const works = published.ok ? published.data.content : [];
  const finished = completed.ok ? completed.data.completions : [];

  return (
    <>
      <ProfileHead
        name={session.name || "Your account"}
        kicker="Your account"
        tiles={[
          { label: "Published", value: published.ok ? works.length : "-" },
          { label: "Total score", value: published.ok ? score(works.reduce((total, item) => total + item.score, 0)) : "-", tone: "gold" },
          { label: "Adventures finished", value: completed.ok ? finished.length : "-" },
        ]}
      >
        <Button href={profileHref({ id: session.userId, name: session.name })} tone="secondary">
          Public profile
        </Button>
        <form action="/logout" method="post">
          <button type="submit" className="button danger">
            Sign out
          </button>
        </form>
      </ProfileHead>

      <Tabs
        label="Your account"
        tabs={[
          {
            id: "content",
            label: "Your content",
            count: published.ok ? works.length : undefined,
            panel: (
              <>
                <p className="muted">Publishing happens from Create in the game.</p>
                {published.ok ? (
                  <ContentList items={works} empty="You haven't published anything yet." />
                ) : (
                  <FailureNotice failure={published} what="your content" />
                )}
              </>
            ),
          },
          {
            id: "completed",
            label: "Completed",
            count: completed.ok ? finished.length : undefined,
            panel: completed.ok ? (
              <CompletionList completions={finished} empty="You haven't finished an adventure yet." />
            ) : (
              <FailureNotice failure={completed} what="your completed adventures" />
            ),
          },
        ]}
      />
    </>
  );
}
