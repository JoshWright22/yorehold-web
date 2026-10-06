// The compendium: the game's own chapters, creatures, items, spells and classes, read from the
// game repo's asset files when the site is built. Like the docs, a folder that isn't there is left
// out, so the site still builds on its own.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Column, Pair, Row, Sheet, SheetSection } from "./sheet";

const assetRoot = "../yorehold-godot/assets";

export type CompendiumKind = "chapters" | "creatures" | "items" | "spells" | "classes" | "skins";

export interface KindInfo {
  id: CompendiumKind;
  label: string;
  one: string;
  columns: Column[];
}

export const compendiumKinds: KindInfo[] = [
  {
    id: "chapters",
    label: "Chapters",
    one: "chapter",
    columns: [
      { key: "level", label: "Lvl", numeric: true },
      { key: "fights", label: "Fights", numeric: true },
      { key: "foes", label: "Foes", numeric: true, wide: true },
      { key: "xp", label: "XP", numeric: true, wide: true },
    ],
  },
  {
    id: "creatures",
    label: "Creatures",
    one: "creature",
    columns: [
      { key: "hp", label: "HP", numeric: true },
      { key: "ac", label: "AC", numeric: true },
      { key: "speed", label: "Speed", numeric: true, wide: true },
      { key: "ai", label: "Behaviour", wide: true },
    ],
  },
  {
    id: "items",
    label: "Items",
    one: "item",
    columns: [
      { key: "slot", label: "Slot" },
      { key: "damage", label: "Dmg", wide: true },
      { key: "weight", label: "Wt", numeric: true, wide: true },
      { key: "value", label: "Value", numeric: true },
    ],
  },
  {
    id: "spells",
    label: "Spells",
    one: "spell",
    columns: [
      { key: "level", label: "Lvl", numeric: true },
      { key: "target", label: "Target", wide: true },
      { key: "save", label: "Save" },
      { key: "effect", label: "Effect", wide: true },
    ],
  },
  {
    id: "classes",
    label: "Classes",
    one: "class",
    columns: [
      { key: "hitDie", label: "HD", numeric: true },
      { key: "key", label: "Key" },
      { key: "casting", label: "Casting", wide: true },
      { key: "speed", label: "Speed", numeric: true, wide: true },
    ],
  },
  { id: "skins", label: "Skins", one: "skin", columns: [] },
];

export function kindInfo(id: string): KindInfo | undefined {
  return compendiumKinds.find((kind) => kind.id === id);
}

export type Json = { [key: string]: unknown };

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function words(value: unknown): string[] {
  return list(value).map(text).filter((word) => word !== "");
}

function ability(value: unknown): string {
  return text(value).toUpperCase();
}

// "mainHand" reads better as "main hand".
function spaced(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

export function fromRoot(...parts: string[]): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), assetRoot, ...parts);
}

export async function readJson(file: string): Promise<Json | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function jsonFiles(folder: string): Promise<Json[]> {
  let names: string[];
  try {
    names = await readdir(fromRoot(folder));
  } catch {
    return [];
  }
  const found: Json[] = [];
  for (const name of names.filter((entry) => entry.endsWith(".json")).sort()) {
    const json = await readJson(fromRoot(folder, name));
    if (json && text(json.id)) found.push(json);
  }
  return found;
}

function pairs(entries: [string, string | number | undefined][]): Pair[] {
  return entries
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([label, value]) => ({ label, value: String(value) }));
}

function row(kind: CompendiumKind, json: Json, name: string, cells: Row["cells"], chips: string[], sheet: Omit<Sheet, "kind" | "title">): Row {
  const id = text(json.id);
  return {
    id,
    name,
    href: "/compendium/" + kind + "/" + encodeURIComponent(id),
    kind,
    cells,
    chips,
    sheet: { kind, title: name, ...sheet },
  };
}

function targetLine(target: unknown, area: unknown): string {
  const parts: string[] = [];
  if (isObject(target)) {
    const kind = text(target.kind);
    const side = text(target.side);
    if (kind) parts.push(side && side !== "any" ? side + " " + kind : kind);
    const range = num(target.range);
    if (range !== undefined) parts.push("range " + range);
  }
  if (isObject(area)) {
    const shape = text(area.shape);
    const size = num(area.size);
    if (shape) parts.push(shape + (size !== undefined ? " " + size : ""));
  }
  return parts.join(", ");
}

function effectLine(effect: unknown): string {
  if (!isObject(effect)) return "";
  const parts = [text(effect.do), text(effect.dice), text(effect.type)].filter((part) => part !== "");
  let line = parts.join(" ");
  const onSave = text(effect.onSave);
  if (onSave) line += ", " + onSave + " on a save";
  const scale = effect.scale;
  if (isObject(scale) && text(scale.dice)) line += ", +" + text(scale.dice) + " per " + (text(scale.by) || "step");
  const condition = text(effect.condition);
  if (condition) line += " " + condition;
  return line;
}

function saveLine(save: unknown): string {
  if (!isObject(save)) return "";
  const dc = text(save.dc);
  return ability(save.ability) + (dc ? " " + (dc === "caster" ? "DC" : "DC " + dc) : "");
}

function ranks(value: unknown): string {
  if (!isObject(value)) return "";
  return Object.entries(value)
    .map(([key, rank]) => key + " " + text(rank))
    .join(", ");
}

function behaviour(ai: unknown): string {
  if (typeof ai === "string") return ai;
  if (isObject(ai)) return text(ai.base) + (ai.leader === true ? ", leader" : "");
  return "";
}

async function creatures(): Promise<Row[]> {
  return (await jsonFiles("creatures")).map((json) => {
    const name = text(json.name) || text(json.id);
    const hp = num(json.hp);
    const ac = num(json.armorClass);
    const speed = num(json.speed);
    const ai = behaviour(json.ai);
    const loot = isObject(json.loot) ? Object.entries(json.loot).map(([what, dice]) => text(dice) + " " + what) : [];
    const sections: SheetSection[] = [];
    const gear = words(json.items);
    if (gear.length > 0) sections.push({ title: "Gear", lines: gear.map((item) => ({ text: item })) });
    return row(
      "creatures",
      json,
      name,
      { hp: hp ?? "", ac: ac ?? "", speed: speed ?? "", ai },
      ai ? [ai.split(",")[0]] : [],
      {
        subtitle: "Creature",
        description: text(json.description) ? [text(json.description)] : undefined,
        tiles: pairs([["HP", hp], ["AC", ac], ["Speed", speed]]),
        stats: pairs([
          ["DC ability", ability(json.dcAbility)],
          ["Darkvision", num(json.darkvision) !== undefined ? json.darkvision + " ft" : undefined],
          ["Proficient in", words(json.proficiencies).join(", ")],
          ["Ranks", ranks(json.proficiencyRanks)],
          ["Behaviour", ai],
          ["Loot", loot.join(", ")],
        ]),
        sections,
      },
    );
  });
}

async function items(): Promise<Row[]> {
  return (await jsonFiles("items")).map((json) => {
    const name = text(json.name) || text(json.id);
    const slot = text(json.slot) ? spaced(text(json.slot)) : "carried";
    const use = isObject(json.use) ? json.use : null;
    const sections: SheetSection[] = [];
    const modifiers = list(json.modifiers)
      .filter(isObject)
      .map((mod) => ({ text: text(mod.stat) + " " + (text(mod.op) === "override" ? "becomes " : "+") + text(mod.value) }));
    if (modifiers.length > 0) sections.push({ title: "Modifiers", lines: modifiers });
    if (use) {
      const lines = [
        { label: "Target", text: targetLine(use.target, use.area) },
        { label: "Save", text: saveLine(use.save) },
        ...list(use.effects).map((effect) => ({ label: "Effect", text: effectLine(effect) })),
      ].filter((line) => line.text !== "");
      if (lines.length > 0) sections.push({ title: "Use", lines });
    }
    const chips = [slot];
    if (use) chips.push("usable");
    if (json.magic === true) chips.push("magic");
    return row(
      "items",
      json,
      name,
      { slot, damage: text(json.damage), weight: num(json.weight) ?? "", value: num(json.value) ?? "" },
      chips,
      {
        subtitle: "Item, " + slot,
        description: text(json.description) ? [text(json.description)] : undefined,
        tiles: pairs([["Damage", text(json.damage)], ["Weight", num(json.weight)], ["Value", num(json.value)]]),
        stats: pairs([
          ["Attack with", ability(json.attackAbility)],
          ["Hands", num(json.hands)],
        ]),
        sections,
      },
    );
  });
}

async function spells(): Promise<Row[]> {
  return (await jsonFiles("rulesets/yorehold/spells")).map((json) => {
    const name = text(json.name) || text(json.id);
    const level = num(json.level) ?? 0;
    const target = targetLine(json.target, json.area);
    const save = saveLine(json.save);
    const effects = list(json.effects).map(effectLine).filter((line) => line !== "");
    const chips = [level === 0 ? "cantrip" : "level " + level];
    if (json.concentration === true) chips.push("concentration");
    const spends = isObject(json.spends) ? Object.entries(json.spends).map(([what, amount]) => text(amount) + " " + what) : [];
    return row(
      "spells",
      json,
      name,
      { level, target, save, effect: effects[0] ?? "" },
      chips,
      {
        subtitle: level === 0 ? "Cantrip" : "Level " + level + " spell",
        description: text(json.description) ? [text(json.description)] : undefined,
        tiles: pairs([["Level", level], ["Hands", num(json.hands)], ["Cost", num(json.cost)]]),
        stats: pairs([
          ["Target", target],
          ["Save", save],
          ["Spends", spends.join(", ")],
          ["Concentration", json.concentration === true ? "yes" : undefined],
        ]),
        sections: effects.length > 0 ? [{ title: "Effects", lines: effects.map((line) => ({ text: line })) }] : [],
      },
    );
  });
}

async function classes(): Promise<Row[]> {
  return (await jsonFiles("classes")).map((json) => {
    const name = text(json.name) || text(json.id);
    const casting = text(json.casting);
    const sections: SheetSection[] = [];
    const gear = words(json.items);
    if (gear.length > 0) sections.push({ title: "Starting gear", lines: gear.map((item) => ({ text: item })) });
    if (isObject(json.spells)) {
      const lines = Object.entries(json.spells).map(([level, names]) => ({
        label: level === "0" ? "Cantrips" : "Level " + level,
        text: words(names).join(", "),
      }));
      if (lines.length > 0) sections.push({ title: "Spell list", lines });
    }
    const features = list(json.levels).flatMap((level, index) =>
      isObject(level)
        ? list(level.features)
            .filter(isObject)
            .map((feature) => ({ label: "Level " + (index + 1) + ", " + text(feature.name), text: text(feature.description) }))
        : [],
    );
    if (features.length > 0) sections.push({ title: "Features", lines: features });
    return row(
      "classes",
      json,
      name,
      { hitDie: num(json.hitDie) ?? "", key: ability(json.dcAbility), casting: casting || "none", speed: num(json.speed) ?? "" },
      [casting ? "caster" : "martial"],
      {
        subtitle: "Class",
        description: text(json.description) ? [text(json.description)] : undefined,
        tiles: pairs([["Hit die", num(json.hitDie) !== undefined ? "d" + json.hitDie : undefined], ["Bonus HP", num(json.bonusHp)], ["Speed", num(json.speed)]]),
        stats: pairs([
          ["Key ability", ability(json.dcAbility)],
          ["Casting", casting],
          ["Proficient in", words(json.proficiencies).join(", ")],
          ["Ranks", ranks(json.proficiencyRanks)],
        ]),
        sections,
      },
    );
  });
}

async function chapters(): Promise<Row[]> {
  let folders: string[];
  try {
    folders = (await readdir(fromRoot("chapters"))).sort();
  } catch {
    return [];
  }
  const rows: Row[] = [];
  for (const folder of folders) {
    const json = await readJson(fromRoot("chapters", folder, "chapter.json"));
    if (!json || !text(json.id)) continue;
    const name = text(json.title) || text(json.id);
    const encounters = list(json.encounters).filter(isObject);
    const foes = encounters.reduce((total, encounter) => total + list(encounter.creatures).length, 0);
    const kinds = [...new Set(encounters.flatMap((encounter) => list(encounter.creatures).filter(isObject).map((foe) => text(foe.creature))))].filter((kind) => kind);
    const party = list(json.party)
      .filter(isObject)
      .map((member) => ({ label: text(member.name), text: text(member.class) }));
    const sections: SheetSection[] = [];
    if (party.length > 0) sections.push({ title: "Party", lines: party });
    const fights = encounters
      .map((encounter) => ({ label: text(encounter.id), text: list(encounter.creatures).length + " foes. " + text(encounter.text) }))
      .filter((line) => line.label);
    if (fights.length > 0) sections.push({ title: "Encounters", lines: fights });
    const level = num(json.level);
    rows.push(
      row(
        "chapters",
        json,
        name,
        { level: level ?? "", fights: encounters.length, foes, xp: num(json.xpPerVictory) ?? "" },
        kinds.slice(0, 3),
        {
          subtitle: "Chapter" + (level !== undefined ? ", level " + level : ""),
          description: words(json.intro),
          tiles: pairs([["Level", level], ["Fights", encounters.length], ["Foes", foes]]),
          stats: pairs([
            ["XP per win", num(json.xpPerVictory)],
            ["Creatures", kinds.join(", ")],
          ]),
          sections,
        },
      ),
    );
  }
  return rows;
}

// Skins have no files in the game yet; the tab is there so the shape of the compendium is.
async function skins(): Promise<Row[]> {
  return [];
}

const loaders: { [kind in CompendiumKind]: () => Promise<Row[]> } = { chapters, creatures, items, spells, classes, skins };

export async function loadKind(kind: CompendiumKind): Promise<Row[]> {
  return loaders[kind]();
}
