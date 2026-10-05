import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompendiumView from "@/components/CompendiumView";
import { compendiumKinds, kindInfo, loadKind } from "@/lib/compendium";

type Props = { params: Promise<{ kind: string; id: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await Promise.all(
    compendiumKinds.map(async (kind) => (await loadKind(kind.id)).map((row) => ({ kind: kind.id, id: row.id }))),
  );
  return all.flat();
}

async function find(params: Props["params"]) {
  const { kind: kindId, id } = await params;
  const kind = kindInfo(kindId);
  if (!kind) return null;
  const row = (await loadKind(kind.id)).find((entry) => entry.id === decodeURIComponent(id));
  return row ? { kind, row } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await find(params);
  return { title: found ? found.row.name : "Compendium" };
}

export default async function CompendiumEntry({ params }: Props) {
  const found = await find(params);
  if (!found) notFound();
  return <CompendiumView kind={found.kind} selectedId={found.row.id} />;
}
