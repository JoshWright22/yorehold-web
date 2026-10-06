import type { Metadata } from "next";
import Link from "next/link";
import HelpPage from "@/components/HelpPage";

export const metadata: Metadata = { title: "FAQ" };

export default function Faq() {
  return (
    <HelpPage
      title="FAQ"
      kicker="Getting started"
      lead="Short answers. If yours isn't here, the forums will be the place to ask once they open."
      sections={[
        {
          id: "cost",
          title: "Does it cost anything?",
          body: <p>No. The game and every adventure in the library are free.</p>,
        },
        {
          id: "platforms",
          title: "What does it run on?",
          body: (
            <p>
              Windows for now. A browser version is planned; <Link href="/play">Play</Link> will have it when it is ready.
            </p>
          ),
        },
        {
          id: "account",
          title: "Do I need an account?",
          body: <p>Not to play. You need one to vote, favourite on every device, publish, and have a profile.</p>,
        },
        {
          id: "rules",
          title: "Which rules does it use?",
          body: (
            <p>
              Its own d20 rules, close to the fifth edition of the best-known tabletop game with some ideas from others. There is one set of rules for the whole game,
              so characters move between adventures freely. The rules are listed in the <Link href="/compendium">compendium</Link>.
            </p>
          ),
        },
        {
          id: "party",
          title: "How big is a party?",
          body: <p>Up to four player characters, and one player can run several. Some adventures add companions who join on top of that.</p>,
        },
        {
          id: "characters",
          title: "Can I bring a character from one adventure to another?",
          body: (
            <p>
              Yes. Characters belong to you, not to an adventure, and keep their gear. You can also make a new one for each game; the{" "}
              <Link href="/characters">character creator</Link> works on the site too.
            </p>
          ),
        },
        {
          id: "death",
          title: "What happens when a character dies?",
          body: <p>By default they stay dead. An adventure or your own settings can soften that.</p>,
        },
        {
          id: "rules-change",
          title: "What happens when the rules change?",
          body: (
            <p>
              Each character is rebuilt under the new rules as closely as they allow, and you play that version from then on. The old one stays viewable. Where a
              choice no longer exists, you pick a replacement first.
            </p>
          ),
        },
        {
          id: "publish",
          title: "How do I publish an adventure?",
          body: (
            <p>
              Write it with Create in the game and publish from there. <Link href="/contribute">Contribute</Link> has the details, and the{" "}
              <Link href="/docs">format docs</Link> describe the files.
            </p>
          ),
        },
        {
          id: "report",
          title: "Something in the library breaks the rules. What do I do?",
          body: <p>Open its page and press Report. A moderator looks at every report.</p>,
        },
      ]}
    />
  );
}
