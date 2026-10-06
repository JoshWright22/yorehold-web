import type { Metadata } from "next";
import Link from "next/link";
import HelpPage from "@/components/HelpPage";

export const metadata: Metadata = { title: "Contribute" };

export default function Contribute() {
  return (
    <HelpPage
      title="Contribute"
      kicker="Getting started"
      lead="Everything in the library is written by players. This is how to add to it."
      sections={[
        {
          id: "what",
          title: "What you can make",
          body: (
            <ul>
              <li>
                <strong>Adventures:</strong> maps, encounters, characters to meet and the story that ties them together, for a level range you choose.
              </li>
              <li>
                <strong>Packs:</strong> creatures, items and places for other writers to build with.
              </li>
              <li>
                <strong>Rules:</strong> classes, spells and races are proposed to the shared rules and voted on, rather than added by one adventure.
              </li>
            </ul>
          ),
        },
        {
          id: "start",
          title: "Getting started",
          body: (
            <>
              <p>
                Read a few adventures first; the <Link href="/lists">curated lists</Link> are a good start. Then open Create in the game, which has editors for maps,
                dialogue and quests.
              </p>
              <p>
                The <Link href="/docs">format docs</Link> describe every file if you would rather write them by hand, and the{" "}
                <Link href="/compendium/chapters">chapter examples</Link> show the game&apos;s own content as a reference.
              </p>
            </>
          ),
        },
        {
          id: "publish",
          title: "Publishing",
          body: (
            <p>
              Publish from Create in the game while signed in. A published entry shows in <Link href="/adventures">Adventures</Link> straight away. Publishing again
              makes a new revision; players see the latest one.
            </p>
          ),
        },
        {
          id: "canon",
          title: "The canon",
          body: (
            <p>
              Well-liked work can be nominated for the canon. It goes through review, then is either signed off as part of the shared rules or featured in the
              library. <Link href="/canon">Canon</Link> shows what is under review.
            </p>
          ),
        },
        {
          id: "good-practice",
          title: "Good practice",
          body: (
            <ul>
              <li>Give the level range honestly, so parties arrive ready.</li>
              <li>Tag what the adventure is (horror, city, short) so players can find it.</li>
              <li>Describe it in a line or two: what the party is asked to do and where.</li>
              <li>Credit what you build on.</li>
            </ul>
          ),
        },
        {
          id: "rules",
          title: "Rules for content",
          body: (
            <p>
              Everything published follows the <Link href="/site-rules">site rules</Link>. Players can report entries that break them, and moderators can hide them.
            </p>
          ),
        },
      ]}
    />
  );
}
