import type { Metadata } from "next";
import Link from "next/link";
import HelpPage from "@/components/HelpPage";

export const metadata: Metadata = { title: "Guide for newcomers" };

export default function Guide() {
  return (
    <HelpPage
      title="Guide for newcomers"
      kicker="Getting started"
      lead="What Yorehold is, and the shortest way from here to your first adventure."
      sections={[
        {
          id: "what",
          title: "What Yorehold is",
          body: (
            <>
              <p>
                A turn-based fantasy game played on a grid, like a tabletop game on a screen. There is no single story: the game is a library of adventures written by
                players. You pick one, bring a party, and play it alone or with friends.
              </p>
              <p>
                Every adventure uses the same set of rules, so a character you make can go into any of them and keeps their gear between adventures.
              </p>
            </>
          ),
        },
        {
          id: "get",
          title: "Get the game",
          body: (
            <p>
              The game is free and runs on Windows for now. <Link href="/play">Download it here</Link>. Making an account is optional for playing; you need one to vote,
              publish and keep a profile. <Link href="/login?mode=signup">Join</Link> takes an email and a password.
            </p>
          ),
        },
        {
          id: "character",
          title: "Make a character",
          body: (
            <>
              <p>
                A character is a race, a class and a background, plus six ability scores. Scores can be bought with points, taken from a standard set, or rolled.
              </p>
              <p>
                You can do it in the game, or in the <Link href="/characters">character creator</Link> here and download the file into the game. To read up first, see
                the <Link href="/compendium/classes">classes</Link> and <Link href="/compendium/spells">spells</Link>.
              </p>
            </>
          ),
        },
        {
          id: "adventure",
          title: "Pick an adventure",
          body: (
            <>
              <p>
                <Link href="/adventures">Adventures</Link> lists everything, newest first. Filter by level so the adventure suits your party, or by tag for the kind of
                story you want. Not sure where to start? Try a <Link href="/lists">curated list</Link>, the <Link href="/index">index</Link>, or a{" "}
                <Link href="/random?kind=adventure">random adventure</Link>.
              </p>
              <p>Press Download on an adventure, or Open in Yorehold on its page if the game is installed.</p>
            </>
          ),
        },
        {
          id: "join-in",
          title: "Vote, favourite, follow",
          body: (
            <p>
              After playing, vote it up or down on its page; votes decide what rises in the library. Favourite what you want to keep or come back to. Writers you
              like have profiles listing all their work.
            </p>
          ),
        },
        {
          id: "write",
          title: "Write your own",
          body: (
            <p>
              Anyone can write an adventure or a pack of creatures, items and places. Start with <Link href="/contribute">Contribute</Link>, which covers how writing,
              publishing and the canon work.
            </p>
          ),
        },
        {
          id: "more",
          title: "Where to go next",
          body: (
            <ul>
              <li>
                <Link href="/faq">FAQ</Link>: short answers to common questions.
              </li>
              <li>
                <Link href="/site-rules">Site rules</Link>: what is and isn&apos;t allowed.
              </li>
              <li>
                <Link href="/news">News</Link>: what changed lately.
              </li>
            </ul>
          ),
        },
      ]}
    />
  );
}
