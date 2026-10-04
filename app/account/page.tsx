import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CompletionList from "@/components/CompletionList";
import ContentList from "@/components/ContentList";
import { FailureNotice } from "@/components/Notice";
import { profileHref } from "@/lib/format";
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

  return (
    <>
      <h1>{session.name || "Your account"}</h1>
      <p className="meta">
        <Link href={profileHref({ id: session.userId, name: session.name })}>Your public profile</Link>
      </p>
      <form action="/logout" method="post">
        <button type="submit" className="button secondary">
          Sign out
        </button>
      </form>

      <section>
        <h2>Your content</h2>
        <p className="muted">Publishing happens from Create in the game.</p>
        {published.ok ? (
          <ContentList items={published.data.content} empty="You haven't published anything yet." />
        ) : (
          <FailureNotice failure={published} what="your content" />
        )}
      </section>

      <section>
        <h2>Your completed adventures</h2>
        {completed.ok ? (
          <CompletionList completions={completed.data.completions} empty="You haven't finished an adventure yet." />
        ) : (
          <FailureNotice failure={completed} what="your completed adventures" />
        )}
      </section>
    </>
  );
}
