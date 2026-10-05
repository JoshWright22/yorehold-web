import Browser from "./Browser";
import { PageHead, TabBar } from "./ui";
import { compendiumKinds, loadKind, type KindInfo } from "@/lib/compendium";

const chipLabels: { [kind: string]: string } = {
  chapters: "Foe",
  creatures: "Behaviour",
  items: "Type",
  spells: "Level",
  classes: "Style",
};

export default async function CompendiumView({ kind, selectedId }: { kind: KindInfo; selectedId?: string }) {
  const [rows, counts] = await Promise.all([
    loadKind(kind.id),
    Promise.all(compendiumKinds.map(async (other) => (other.id === kind.id ? -1 : (await loadKind(other.id)).length))),
  ]);

  const tabs = compendiumKinds.map((other, index) => ({
    href: "/compendium/" + other.id,
    label: other.label,
    active: other.id === kind.id,
    count: counts[index] === -1 ? rows.length : counts[index],
  }));

  return (
    <>
      <PageHead title="Compendium" kicker="The game's own content">
        <p className="muted">Everything that ships with Yorehold, straight from the game&apos;s files.</p>
      </PageHead>
      <TabBar tabs={tabs} label="Kinds of entry" />
      {kind.id === "skins" ? (
        <div className="placeholder">
          <h2>No skins yet</h2>
          <p>Skins will be listed here with a one-click install once the game has them.</p>
        </div>
      ) : (
        <Browser
          rows={rows}
          columns={kind.columns}
          selectedId={selectedId}
          syncUrl
          chipLabel={chipLabels[kind.id]}
          empty={"No " + kind.label.toLowerCase() + " were found when this site was built."}
        />
      )}
    </>
  );
}
