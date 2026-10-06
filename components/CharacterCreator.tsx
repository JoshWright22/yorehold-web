"use client";

// The character creator: name, race, class, background and ability scores on the left, the sheet
// they make on the right. The result is the same choices file the game reads (CharacterChoices in
// the game's rules), so a character made here can be downloaded and opened in the game. Saved
// characters stay in this browser until accounts store them.

import { useState, useSyncExternalStore } from "react";
import type { CreatorData, Pick } from "@/lib/creator";

type Method = "pointBuy" | "array" | "roll";

interface Choices {
  version: 1;
  name: string;
  race?: string;
  background?: string;
  scoreMethod: Method;
  scores: Record<string, number>;
  levels: { class: string }[];
  xp: 0;
  ruleset: string;
}

const savedKey = "yorehold.characters";
const savedChanged = "yorehold-characters";
const noneSaved: Choices[] = [];
let lastRaw: string | null = null;
let lastSaved: Choices[] = noneSaved;

function readSaved(): Choices[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(savedKey);
  } catch {
    return noneSaved;
  }
  if (raw === lastRaw) return lastSaved;
  lastRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    lastSaved = Array.isArray(parsed) ? (parsed as Choices[]) : noneSaved;
  } catch {
    lastSaved = noneSaved;
  }
  return lastSaved;
}

function writeSaved(list: Choices[]) {
  try {
    window.localStorage.setItem(savedKey, JSON.stringify(list));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(savedChanged));
}

function subscribeSaved(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(savedChanged, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(savedChanged, onChange);
  };
}

function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function signed(value: number): string {
  return value >= 0 ? "+" + value : "−" + Math.abs(value);
}

// "4d6kh3": roll four six-sided dice and keep the highest three.
function rollScore(formula: string): number {
  const match = /^(\d+)d(\d+)(?:kh(\d+))?$/.exec(formula);
  const count = match ? Number(match[1]) : 4;
  const sides = match ? Number(match[2]) : 6;
  const keep = match && match[3] ? Number(match[3]) : count;
  const dice = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
  return dice
    .sort((a, b) => b - a)
    .slice(0, keep)
    .reduce((sum, die) => sum + die, 0);
}

function changes(pick: Pick | undefined): string {
  if (!pick) return "";
  return Object.entries(pick.abilities)
    .map(([ability, value]) => ability.toUpperCase() + " " + signed(value))
    .join(", ");
}

function PickList<T extends Pick>({
  label,
  items,
  chosen,
  onChoose,
  note,
}: {
  label: string;
  items: T[];
  chosen: string;
  onChoose: (id: string) => void;
  note: (item: T) => string;
}) {
  const current = items.find((item) => item.id === chosen);
  return (
    <section className="cc-section">
      <h2>{label}</h2>
      <ul className="cc-picks" role="radiogroup" aria-label={label}>
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" role="radio" aria-checked={item.id === chosen} className={item.id === chosen ? "on" : undefined} onClick={() => onChoose(item.id)}>
              <span className="cc-pick-name">{item.name}</span>
              <span className="cc-pick-note">{note(item)}</span>
            </button>
          </li>
        ))}
      </ul>
      {current?.description ? <p className="cc-desc">{current.description}</p> : null}
    </section>
  );
}

export default function CharacterCreator({ data }: { data: CreatorData }) {
  const abilityIds = data.abilities.map((ability) => ability.id);
  const flat = (value: number) => Object.fromEntries(abilityIds.map((id) => [id, value]));

  const [name, setName] = useState("");
  const [race, setRace] = useState(data.races[0]?.id ?? "");
  const [cls, setCls] = useState(data.classes[0]?.id ?? "");
  const [background, setBackground] = useState(data.backgrounds[0]?.id ?? "");
  const [method, setMethod] = useState<Method>("pointBuy");
  const [bought, setBought] = useState<Record<string, number>>(() => flat(8));
  const [arrayed, setArrayed] = useState<Record<string, number>>(() => flat(0));
  const [rolled, setRolled] = useState<Record<string, number>>(() => flat(0));
  const [message, setMessage] = useState("");
  const saved = useSyncExternalStore(subscribeSaved, readSaved, () => noneSaved);

  const raceDef = data.races.find((entry) => entry.id === race);
  const classDef = data.classes.find((entry) => entry.id === cls);
  const backgroundDef = data.backgrounds.find((entry) => entry.id === background);

  const costOf = (score: number) => data.pointCosts[String(score)];
  const buyable = Object.keys(data.pointCosts).map(Number).sort((a, b) => a - b);
  const spent = abilityIds.reduce((sum, id) => sum + (costOf(bought[id]) ?? 0), 0);

  const base = method === "pointBuy" ? bought : method === "array" ? arrayed : rolled;
  const complete = abilityIds.every((id) => base[id] > 0) && (method !== "pointBuy" || spent <= data.pointBudget);
  const final = (id: string) => (base[id] || 0) + (raceDef?.abilities[id] ?? 0) + (backgroundDef?.abilities[id] ?? 0);

  // The game's first-level HP: the class's hit die and bonus, the race's bonus, and CON.
  const hp = classDef ? Math.max(1, classDef.hitDie + classDef.bonusHp + (raceDef?.bonusHp ?? 0) + modifier(final("con"))) : 0;
  const armorClass = data.baseArmorClass + modifier(final("dex"));
  const speed = raceDef?.speed || classDef?.speed || 30;
  const skillIds = new Set(data.skills.map((skill) => skill.id));
  const trained = new Set([...(raceDef?.proficiencies ?? []), ...(classDef?.proficiencies ?? []), ...(backgroundDef?.proficiencies ?? [])]);

  function choices(): Choices {
    return {
      version: 1,
      name: name.trim(),
      ...(race ? { race } : {}),
      ...(background ? { background } : {}),
      scoreMethod: method,
      scores: Object.fromEntries(abilityIds.map((id) => [id, base[id]])),
      levels: [{ class: cls }],
      xp: 0,
      ruleset: data.ruleset,
    };
  }

  const problem = !name.trim() ? "Give the character a name." : !cls ? "Pick a class." : !complete ? (method === "pointBuy" ? "Point buy is over budget." : "Give every ability a score.") : "";

  function save() {
    const made = choices();
    writeSaved([made, ...saved.filter((entry) => entry.name !== made.name)]);
    setMessage("Saved in this browser.");
  }

  function download() {
    const made = choices();
    const blob = new Blob([JSON.stringify(made, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = (made.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character") + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function load(entry: Choices) {
    setName(entry.name);
    setRace(entry.race ?? "");
    setBackground(entry.background ?? "");
    setCls(entry.levels[0]?.class ?? "");
    setMethod(entry.scoreMethod);
    if (entry.scoreMethod === "pointBuy") setBought(entry.scores);
    if (entry.scoreMethod === "array") setArrayed(entry.scores);
    if (entry.scoreMethod === "roll") setRolled(entry.scores);
    setMessage("Loaded " + entry.name + ".");
  }

  return (
    <div className="cc">
      <div className="cc-form">
        <section className="cc-section">
          <h2>Name</h2>
          <input className="cc-name" value={name} maxLength={64} onChange={(event) => setName(event.target.value)} placeholder="What they are called" />
        </section>

        <PickList label="Race" items={data.races} chosen={race} onChoose={setRace} note={(item) => [changes(item), item.speed ? item.speed + " ft" : ""].filter(Boolean).join(" · ")} />
        <PickList
          label="Class"
          items={data.classes}
          chosen={cls}
          onChoose={setCls}
          note={(item) => "d" + item.hitDie + " hit die" + (item.bonusHp ? ", +" + item.bonusHp + " HP" : "")}
        />
        {classDef && classDef.firstLevel.length > 0 ? (
          <dl className="cc-features">
            {classDef.firstLevel.map((feature) => (
              <div key={feature.name}>
                <dt>{feature.name}</dt>
                <dd>{feature.description}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <PickList label="Background" items={data.backgrounds} chosen={background} onChoose={setBackground} note={(item) => changes(item)} />

        <section className="cc-section">
          <h2>Ability scores</h2>
          <p className="cc-methods">
            {(
              [
                ["pointBuy", "Point buy"],
                ["array", "Standard array"],
                ["roll", "Roll"],
              ] as [Method, string][]
            ).map(([id, label]) => (
              <button key={id} type="button" className={method === id ? "filter-chip active" : "filter-chip"} onClick={() => setMethod(id)}>
                {label}
              </button>
            ))}
            {method === "pointBuy" ? (
              <span className={spent > data.pointBudget ? "cc-budget over num" : "cc-budget num"}>
                {data.pointBudget - spent} of {data.pointBudget} points left
              </span>
            ) : null}
            {method === "roll" ? (
              <button type="button" className="button secondary small" onClick={() => setRolled(Object.fromEntries(abilityIds.map((id) => [id, rollScore(data.roll)])))}>
                Roll {data.roll}
              </button>
            ) : null}
          </p>
          <table className="cc-scores">
            <thead>
              <tr>
                <th>Ability</th>
                <th>Base</th>
                <th>Bonus</th>
                <th>Score</th>
                <th>Mod</th>
              </tr>
            </thead>
            <tbody>
              {data.abilities.map((ability) => {
                const bonus = (raceDef?.abilities[ability.id] ?? 0) + (backgroundDef?.abilities[ability.id] ?? 0);
                const index = buyable.indexOf(bought[ability.id]);
                return (
                  <tr key={ability.id}>
                    <th scope="row">{ability.name}</th>
                    <td className="num">
                      {method === "pointBuy" ? (
                        <span className="cc-step">
                          <button type="button" aria-label={"Lower " + ability.name} disabled={index <= 0} onClick={() => setBought({ ...bought, [ability.id]: buyable[index - 1] })}>
                            −
                          </button>
                          {bought[ability.id]}
                          <button
                            type="button"
                            aria-label={"Raise " + ability.name}
                            disabled={index >= buyable.length - 1 || spent - costOf(bought[ability.id]) + costOf(buyable[index + 1]) > data.pointBudget}
                            onClick={() => setBought({ ...bought, [ability.id]: buyable[index + 1] })}
                          >
                            +
                          </button>
                        </span>
                      ) : method === "array" ? (
                        <select
                          aria-label={ability.name + " score"}
                          value={arrayed[ability.id] || ""}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            // Taking a value another ability has frees that one, so each is used once.
                            const next = Object.fromEntries(Object.entries(arrayed).map(([id, held]) => [id, held === value ? 0 : held]));
                            setArrayed({ ...next, [ability.id]: value });
                          }}
                        >
                          <option value="">–</option>
                          {data.standardArray.map((value, i) => (
                            <option key={i} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      ) : (
                        rolled[ability.id] || "–"
                      )}
                    </td>
                    <td className="num">{bonus ? signed(bonus) : ""}</td>
                    <td className="num">{base[ability.id] ? final(ability.id) : "–"}</td>
                    <td className="num">{base[ability.id] ? signed(modifier(final(ability.id))) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>

      <aside className="cc-sheet">
        <article className="stat-block">
          <header>
            <h2 className="sb-title">{name.trim() || "Unnamed"}</h2>
            <p className="sb-subtitle">
              Level 1 {[raceDef?.name, classDef?.name].filter(Boolean).join(" ")}
              {backgroundDef ? ", " + backgroundDef.name.toLowerCase() : ""}
            </p>
          </header>
          <hr className="sb-rule" />
          <dl className="sb-tiles">
            <div>
              <dt>HP</dt>
              <dd className="num">{complete ? hp : "–"}</dd>
            </div>
            <div>
              <dt>AC</dt>
              <dd className="num">{complete ? armorClass : "–"}</dd>
            </div>
            <div>
              <dt>Speed</dt>
              <dd className="num">{speed} ft</dd>
            </div>
          </dl>
          <hr className="sb-rule" />
          <dl className="cc-abilities">
            {data.abilities.map((ability) => (
              <div key={ability.id}>
                <dt>{ability.id.toUpperCase()}</dt>
                <dd className="num">
                  {base[ability.id] ? final(ability.id) : "–"}
                  <span>{base[ability.id] ? signed(modifier(final(ability.id))) : ""}</span>
                </dd>
              </div>
            ))}
          </dl>
          <hr className="sb-rule" />
          <dl className="sb-stats">
            <div>
              <dt>Skills</dt>
              <dd>
                {data.skills
                  .filter((skill) => trained.has(skill.id))
                  .map((skill) => skill.name)
                  .join(", ") || "none"}
              </dd>
            </div>
            <div>
              <dt>Trained in</dt>
              <dd>{[...trained].filter((id) => !skillIds.has(id)).join(", ") || "nothing else"}</dd>
            </div>
            <div>
              <dt>Starts with</dt>
              <dd>{classDef?.items.map((item) => item.replace(/-/g, " ")).join(", ") || "nothing"}</dd>
            </div>
          </dl>
          <p className="sb-text cc-armor-note">AC is before armour; the game adds what is worn.</p>
          <p className="cc-actions">
            <button type="button" className="button primary" disabled={problem !== ""} onClick={save}>
              Save
            </button>
            <button type="button" className="button secondary" disabled={problem !== ""} onClick={download}>
              Download for the game
            </button>
          </p>
          <p className="cc-message" role="status">
            {problem || message}
          </p>
        </article>

        {saved.length > 0 ? (
          <section className="cc-saved">
            <h2>Saved in this browser</h2>
            <ul>
              {saved.map((entry) => (
                <li key={entry.name}>
                  <span>
                    {entry.name}
                    <span className="cc-pick-note">
                      {" "}
                      {[entry.race, entry.levels[0]?.class].filter(Boolean).join(" ")}
                    </span>
                  </span>
                  <button type="button" className="adv-button" onClick={() => load(entry)}>
                    Load
                  </button>
                  <button type="button" className="adv-button" onClick={() => writeSaved(saved.filter((other) => other !== entry))}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
