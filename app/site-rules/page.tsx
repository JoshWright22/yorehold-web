import type { Metadata } from "next";
import Link from "next/link";
import HelpPage from "@/components/HelpPage";

export const metadata: Metadata = { title: "Site rules" };

export default function SiteRules() {
  return (
    <HelpPage
      title="Site rules"
      kicker="Community"
      lead="What may be published here. More rules will be added; these already apply."
      sections={[
        {
          id: "made-by-people",
          title: "Made by people",
          body: (
            <>
              <p>
                <strong>We don&apos;t accept AI-written content.</strong> Everything published here (adventures, packs, descriptions, dialogue, maps, art and rules
                proposals) must be made by people.
              </p>
              <p>
                That covers text written by a chatbot or language model, and pictures, maps or voices made by an image or voice generator, even when they have been
                edited afterwards. Spelling and grammar checkers are fine.
              </p>
              <p>Work found to be generated is hidden, and repeated uploads can cost the account its publishing rights.</p>
            </>
          ),
        },
        {
          id: "your-own-work",
          title: "Your own work",
          body: (
            <p>
              Publish only what you made or have the right to share. When you build on someone else&apos;s work, credit them. Copied work is hidden on report.
            </p>
          ),
        },
        {
          id: "reporting",
          title: "Reporting",
          body: (
            <p>
              Every published entry has a Report link on its page; pick &quot;Made with AI&quot; or another reason and say what you noticed. Reports go to the
              moderators, never to the author. <Link href="/contribute">Contribute</Link> explains how publishing works.
            </p>
          ),
        },
      ]}
    />
  );
}
