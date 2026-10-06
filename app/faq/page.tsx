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
          body: (
            <p>
              Yes. You sign in to play, and the same account holds your characters, favourites, votes, published work and profile. <Link href="/login?mode=signup">Join</Link>{" "}
              takes an email and a password.
            </p>
          ),
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
              Yes. Characters belong to your account, not to an adventure, and keep their gear. You can also make a new one for each game, in the game or under{" "}
              <Link href="/account?tab=characters">Characters on your profile</Link>.
            </p>
          ),
        },
        {
          id: "death",
          title: "What happens when a character dies?",
          body: <p>They go down and make death saves. If they die, they can be brought back with a scroll, a spell, or at camp.</p>,
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
