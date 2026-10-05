import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompendiumView from "@/components/CompendiumView";
import { compendiumKinds, kindInfo } from "@/lib/compendium";

type Props = { params: Promise<{ kind: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return compendiumKinds.map((kind) => ({ kind: kind.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kind = kindInfo((await params).kind);
  return { title: kind ? kind.label : "Compendium" };
}

export default async function CompendiumKind({ params }: Props) {
  const kind = kindInfo((await params).kind);
  if (!kind) notFound();
  return <CompendiumView kind={kind} />;
}
