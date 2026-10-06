// What the character creator offers, read from the game's own ruleset files at build time like the
// compendium, so the site and the game agree on races, backgrounds, classes and score rules.
// Server only.

import { fromRoot, jsonFiles, readJson, type Json } from "./compendium";

export interface Named {
  id: string;
  name: string;
}

export interface Pick extends Named {
  description: string;
  // Changes to ability scores, by ability id.
  abilities: Record<string, number>;
  proficiencies: string[];
  feats: string[];
  bonusHp: number;
  speed: number;
}

export interface ClassPick extends Pick {
  hitDie: number;
  items: string[];
  // What the first level gives, as name and line.
  firstLevel: { name: string; description: string }[];
}

export interface CreatorData {
  ruleset: string;
  abilities: Named[];
  skills: (Named & { ability: string })[];
  standardArray: number[];
  pointBudget: number;
  // Score to cost, for point buy.
  pointCosts: Record<string, number>;
  roll: string;
  baseArmorClass: number;
  races: Pick[];
  backgrounds: Pick[];
  classes: ClassPick[];
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function whole(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
}

function texts(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter((entry) => entry !== "") : [];
}

function numbers(value: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, entry] of Object.entries(value)) out[key] = whole(entry);
  }
  return out;
}

function pick(json: Json): Pick {
  return {
    id: text(json.id),
    name: text(json.name) || text(json.id),
    description: text(json.description),
    abilities: numbers(json.abilities),
    proficiencies: texts(json.proficiencies),
    feats: texts(json.feats),
    bonusHp: whole(json.bonusHp),
    speed: whole(json.speed),
  };
}

function classPick(json: Json): ClassPick {
  const levels = Array.isArray(json.levels) ? json.levels : [];
  const first = (levels[0] ?? {}) as Json;
  const features = Array.isArray(first.features) ? (first.features as Json[]) : [];
  return {
    ...pick(json),
    hitDie: whole(json.hitDie, 8),
    items: texts(json.items),
    firstLevel: features.map((feature) => ({ name: text(feature.name), description: text(feature.description) })).filter((feature) => feature.name),
  };
}

export async function loadCreator(): Promise<CreatorData | null> {
  const rules = await readJson(fromRoot("rulesets", "yorehold", "ruleset.json"));
  if (!rules) return null;
  const methods = (rules.scoreMethods ?? {}) as Json;
  const named = (value: unknown): Named[] =>
    (Array.isArray(value) ? (value as Json[]) : []).map((entry) => ({ id: text(entry.id), name: text(entry.name) || text(entry.id) }));
  return {
    ruleset: text(rules.id) || "yorehold",
    abilities: named(rules.abilities),
    skills: (Array.isArray(rules.skills) ? (rules.skills as Json[]) : []).map((entry) => ({ id: text(entry.id), name: text(entry.name), ability: text(entry.ability) })),
    standardArray: Array.isArray(methods.standardArray) ? methods.standardArray.map((value) => whole(value)) : [],
    pointBudget: whole(methods.pointBudget),
    pointCosts: numbers(methods.pointCosts),
    roll: text(methods.roll) || "4d6kh3",
    baseArmorClass: whole(rules.baseArmorClass, 10),
    races: (await jsonFiles("rulesets/yorehold/races")).map(pick),
    backgrounds: (await jsonFiles("rulesets/yorehold/backgrounds")).map(pick),
    classes: (await jsonFiles("classes")).map(classPick),
  };
}
