import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FavouriteGrid } from "@/components/AdventureCard";
import { AppearanceForm } from "@/components/Appearance";
import CharacterCreator from "@/components/CharacterCreator";
import CompletionList from "@/components/CompletionList";
import ContentList from "@/components/ContentList";
import { FailureNotice } from "@/components/Notice";
import ProfileHead from "@/components/ProfileHead";
import ProfileStats from "@/components/ProfileStats";
import Tabs from "@/components/Tabs";
import { Button } from "@/components/ui";
import { loadCreator } from "@/lib/creator";
import { first, profileHref } from "@/lib/format";
import { completionsList, contentSearch, profileStats } from "@/lib/server";
import { allContent } from "@/lib/catalog";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

type Query = { [key: string]: string | string[] | undefined };

// The player's own page: their characters first, since that is what a player comes back for, then
// favourites, their published work, finished adventures and the settings for how they look.
export default async function Account({ searchParams }: { searchParams: Promise<Query> }) {
  const session = await getSession();
  const tab = first((await searchParams).tab);
  if (!session) redirect("/login?next=" + encodeURIComponent("/account" + (tab ? "?tab=" + tab : "")));

  const [published, completed, creator, counted, library] = await Promise.all([
    contentSearch({ author: session.userId, sort: "new", limit: 50 }),
    completionsList(session.userId, 50),
    loadCreator(),
    profileStats(session.userId),
    allContent(),
  ]);

  const works = published.ok ? published.data.content : [];
  const finished = completed.ok ? completed.data.completions : [];

  return (
    <>
      <ProfileHead
        userId={session.userId}
        name={session.name || "Your account"}
        kicker="Your account"
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

      <ProfileStats userId={session.userId} stats={counted} library={library.ok ? library.items : works} />

      <Tabs
        // A new tab in the address (from the picture menu) opens that tab even on this same page.
        key={tab}
        label="Your account"
        initial={tab}
        tabs={[
          {
            id: "characters",
            label: "Characters",
            panel:
              creator && creator.classes.length > 0 ? (
                <CharacterCreator data={creator} />
              ) : (
                <p className="list-empty">The game&apos;s rules files are not next to the site, so there is nothing to build characters from.</p>
              ),
          },
          {
            id: "favourites",
            label: "Favourites",
            panel: <FavouriteGrid text="" />,
          },
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
          {
            id: "settings",
            label: "Settings",
            panel: <AppearanceForm userId={session.userId} />,
          },
        ]}
      />
    </>
  );
}
