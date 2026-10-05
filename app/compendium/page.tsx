import type { Metadata } from "next";
import CompendiumView from "@/components/CompendiumView";
import { compendiumKinds } from "@/lib/compendium";

export const metadata: Metadata = { title: "Compendium" };

// Built once, from the game's files at build time.
export const dynamic = "force-static";

export default function Compendium() {
  return <CompendiumView kind={compendiumKinds[0]} />;
}
