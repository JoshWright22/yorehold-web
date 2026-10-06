import type { Metadata } from "next";
import CharacterCreator from "@/components/CharacterCreator";
import { PageHead } from "@/components/ui";
import { loadCreator } from "@/lib/creator";

export const metadata: Metadata = { title: "Character creator" };

export default async function Characters() {
  const data = await loadCreator();
  return (
    <>
      <PageHead title="Character creator" kicker="Players">
        <p>Make a first-level character by the game&apos;s rules, save it here, or download it and open it in the game.</p>
      </PageHead>
      {data && data.classes.length > 0 ? (
        <CharacterCreator data={data} />
      ) : (
        <p className="list-empty">The game&apos;s rules files are not next to the site, so there is nothing to build from.</p>
      )}
    </>
  );
}
