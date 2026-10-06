// Made-up library content for working on the site without a game server. Only used when
// YOREHOLD_SAMPLE=1 is set and the server cannot be reached, so a live site never shows it.

import type {
  Completion,
  CompletionsListResponse,
  ContentGetResponse,
  ContentItem,
  ContentKind,
  ContentSearchRequest,
  ContentSearchResponse,
  StatPoint,
  StatsResponse,
} from "./server";

export function sampleOn(): boolean {
  return (process.env.YOREHOLD_SAMPLE ?? "").trim() === "1";
}

const authors = [
  { id: "0b6d2f6e-1a3c-4e7a-9a51-3c2f0e8d1a01", name: "marrowquill" },
  { id: "0b6d2f6e-1a3c-4e7a-9a51-3c2f0e8d1a02", name: "Tamsin_Vale" },
  { id: "0b6d2f6e-1a3c-4e7a-9a51-3c2f0e8d1a03", name: "oldcartographer" },
  { id: "0b6d2f6e-1a3c-4e7a-9a51-3c2f0e8d1a04", name: "Bram" },
  { id: "0b6d2f6e-1a3c-4e7a-9a51-3c2f0e8d1a05", name: "ninefold" },
  { id: "0b6d2f6e-1a3c-4e7a-9a51-3c2f0e8d1a06", name: "Hollis Reed" },
];

// name, kind, author index, tags, level range, up votes, down votes, days before today
type Row = [string, ContentKind, number, string[], number, number, number, number, number, string];

const rows: Row[] = [
  ["The Drowned Bell", "adventure", 0, ["mystery", "coast"], 1, 3, 212, 9, 0, "A church bell rings under the harbour every night at low tide. The fishers want it stopped; the priest wants it found."],
  ["Ash Over Kestrel Ford", "adventure", 1, ["war", "siege"], 4, 6, 188, 14, 1, "Hold a river crossing for three days against a warband that should not know the ford exists."],
  ["Lantern Road", "adventure", 2, ["travel", "horror"], 2, 4, 143, 6, 1, "A caravan job through the marsh, where the way-lanterns keep moving."],
  ["Low Magic", "ruleset", 3, ["variant", "gritty"], 0, 0, 97, 21, 2, "Spell slots halved, rests take a week, healing potions are rare. For long campaigns that should hurt."],
  ["Cellar of the Copper King", "adventure", 4, ["dungeon", "short"], 1, 2, 131, 4, 2, "A one-evening crawl under an inn. Good first chapter for a new party."],
  ["Beasts of the Greywood", "definitions", 5, ["creatures", "forest"], 0, 0, 86, 3, 3, "Fourteen forest creatures with full stat blocks, from the moss boar to the hollow stag."],
  ["The Salt Wife", "adventure", 0, ["coast", "dialogue"], 3, 5, 120, 11, 4, "Mostly talking. A widow on the cliffs knows who sank the ships, and she will tell you for a price."],
  ["Hunger in the Hill Forts", "adventure", 1, ["survival", "winter"], 5, 8, 74, 12, 5, "Winter, three forts, one grain store. Decide who eats."],
  ["Duelling Rules", "ruleset", 2, ["variant", "pvp"], 0, 0, 52, 8, 6, "One-on-one honour duels: no allies, first blood or yield, with a stance choice each round."],
  ["The Pale Archive", "adventure", 3, ["dungeon", "mystery"], 6, 9, 165, 7, 7, "A library that files its readers. Find the missing scholar before you are catalogued too."],
  ["Smith's Folio", "definitions", 4, ["items", "crafting"], 0, 0, 61, 2, 8, "Forty weapons and pieces of armour with crafting costs, for rulesets that use the forge."],
  ["Wolves at Merrow Gate", "adventure", 5, ["city", "intrigue"], 3, 6, 103, 15, 9, "Two guilds, one gate tax and a city watch that takes from both."],
  ["Children of the Cinder", "adventure", 0, ["cult", "fire"], 7, 10, 89, 10, 10, "A mountain cult that walks on coals and a village that has started joining it."],
  ["The Long Night at Orrin's Mill", "adventure", 1, ["horror", "short"], 1, 3, 77, 5, 11, "Survive until morning in a mill with one door and too many windows."],
  ["Hedge Spells", "definitions", 2, ["spells", "low level"], 0, 0, 44, 4, 12, "Twenty minor charms for village wise-folk: finding, mending, warding the cattle."],
  ["Under the Ninth Bridge", "adventure", 3, ["city", "dungeon"], 2, 5, 69, 9, 13, "The sewers below the old bridge connect to something much older than the city."],
  ["Brine and Iron", "adventure", 4, ["naval", "pirates"], 4, 7, 58, 6, 15, "Crew a captured ship and get it home before its owners notice."],
  ["Hard Travel", "ruleset", 5, ["variant", "travel"], 0, 0, 39, 11, 17, "Rations, weather and exhaustion on the road, as an add-on to the standard rules."],
  ["The Thornwake Heir", "adventure", 0, ["intrigue", "dialogue"], 5, 8, 47, 3, 19, "Escort a claimant to her coronation. Half her court would rather she arrived late."],
  ["Fen Lights", "adventure", 1, ["horror", "marsh"], 3, 5, 33, 7, 21, "A sequel to Lantern Road: the lanterns have reached the town."],
  ["Gods of Small Places", "definitions", 2, ["lore", "religion"], 0, 0, 28, 1, 24, "Shrines, saints and household gods, with the blessings each grants."],
  ["Stonecutter's Debt", "adventure", 3, ["dungeon", "dwarves"], 6, 8, 21, 6, 27, "Collect a debt from a quarry crew who dug too deep to pay it."],
  ["Rookery", "adventure", 4, ["city", "thieves"], 2, 4, 14, 9, 30, "A heist in a tower full of trained crows."],
  ["The Quiet Coast", "adventure", 5, ["coast", "exploration"], 1, 2, 9, 2, 34, "Map a stretch of shore where nobody has landed in fifty years."],
];

const today = Date.UTC(2026, 9, 5, 12);
const day = 24 * 60 * 60 * 1000;

function slug(name: string): string {
  return "sample-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const items: ContentItem[] = rows.map(([name, kind, author, tags, levelMin, levelMax, up, down, age, description], i) => ({
  id: slug(name),
  kind,
  name,
  description,
  tags,
  levelMin,
  levelMax,
  revision: 1 + (i % 4),
  rulesetVersion: "0.4",
  fileHash: "",
  fileSize: 18_000 + i * 7_321,
  fileUrl: "",
  author: authors[author],
  score: up - down,
  votesUp: up,
  votesDown: down,
  hidden: false,
  // Spread through the day so items made on the same day still have an order.
  createdAt: today - age * day - i * 3_600_000,
  updatedAt: today - age * day - i * 3_600_000 + ((i * 5) % 7) * 3_600_000,
}));

function search(request: ContentSearchRequest): ContentSearchResponse {
  const text = (request.text ?? "").toLowerCase();
  let found = items.filter(
    (item) =>
      (!request.kind || item.kind === request.kind) &&
      (!request.tag || item.tags.includes(request.tag)) &&
      (!request.author || item.author.id === request.author) &&
      (!text || item.name.toLowerCase().includes(text) || item.description.toLowerCase().includes(text)) &&
      (!request.levelMin || !item.levelMax || item.levelMax >= request.levelMin) &&
      (!request.levelMax || !item.levelMin || item.levelMin <= request.levelMax),
  );
  const sort = request.sort ?? "score";
  found = [...found].sort((a, b) =>
    sort === "new" ? b.createdAt - a.createdAt : sort === "name" ? a.name.localeCompare(b.name) : b.score - a.score,
  );
  const limit = Math.min(Math.max(request.limit ?? 20, 1), 50);
  const start = Number(request.cursor ?? "0") || 0;
  const end = start + limit;
  return { content: found.slice(start, end), cursor: end < found.length ? String(end) : "" };
}

function completions(userId: string): CompletionsListResponse {
  const adventures = items.filter((item) => item.kind === "adventure");
  const seed = authors.findIndex((author) => author.id === userId);
  const list: Completion[] = adventures
    .filter((_, i) => seed >= 0 && (i + seed) % 3 === 0)
    .map((item, i) => ({
      adventure: item.id,
      revision: item.revision,
      party: [
        { name: "Wren", class: "Rogue", level: item.levelMax || 3 },
        { name: "Odo", class: "Cleric", level: item.levelMax || 3 },
      ],
      difficulty: i % 2 === 0 ? "normal" : "hard",
      completedAt: item.createdAt + (i + 1) * day,
      firstCompletedAt: item.createdAt + day,
      times: 1 + (i % 3),
    }));
  return { userId, completions: list, cursor: "" };
}

function dayString(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

// A slow climb with weekend bumps and a jump after the library opened, so the graphs have a shape.
function stats(): StatsResponse {
  const weeks = 16;
  const publishedWeekly: StatPoint[] = [];
  for (let i = 0; i < weeks; i++) {
    const ago = weeks - 1 - i;
    const value = Math.round(2 + i * 1.1 + ((i * 7) % 5) + (ago < 3 ? 6 : 0));
    publishedWeekly.push({ day: dayString(today - (ago * 7 + 6) * day), value });
  }
  const days = 60;
  const playersDaily: StatPoint[] = [];
  for (let i = 0; i < days; i++) {
    const at = today - (days - 1 - i) * day;
    const weekday = new Date(at).getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 1.35 : 1;
    const wobble = 1 + (((i * 37) % 11) - 5) / 50;
    const value = Math.round((140 + i * 6.5 + (i > 45 ? 120 : 0)) * weekend * wobble);
    playersDaily.push({ day: dayString(at), value });
  }
  return { publishedWeekly, playersDaily };
}

// The answer the server would give to an RPC, or null for one the sample does not cover.
export function sampleRpc(id: string, payload: object): unknown {
  const body = payload as Record<string, unknown>;
  switch (id) {
    case "content_search":
      return search(body as ContentSearchRequest);
    case "content_get": {
      const item = items.find((entry) => entry.id === body.id);
      return item ? ({ content: item, myVote: "" } satisfies ContentGetResponse) : null;
    }
    case "completions_list":
      return completions(String(body.userId ?? ""));
    case "stats":
      return stats();
    // config is left out on purpose: the status page asks it to learn whether the server is up.
    default:
      return null;
  }
}
