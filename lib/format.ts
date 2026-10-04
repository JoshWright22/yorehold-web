import type { ContentItem } from "./server";

export function levelRange(item: Pick<ContentItem, "levelMin" | "levelMax">): string {
  const { levelMin, levelMax } = item;
  if (!levelMin && !levelMax) return "Any level";
  if (!levelMax) return "Level " + levelMin + " and up";
  if (!levelMin) return "Up to level " + levelMax;
  if (levelMin === levelMax) return "Level " + levelMin;
  return "Levels " + levelMin + " to " + levelMax;
}

export function date(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

export function fileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function score(value: number): string {
  return value > 0 ? "+" + value : String(value);
}

// A link to a profile. The id rides along because the server can only look a name up for a
// signed-in visitor.
export function profileHref(author: { id: string; name: string }): string {
  return "/u/" + encodeURIComponent(author.name || author.id) + "?id=" + encodeURIComponent(author.id);
}

// Only web links are shown as links; anything else a publisher put in fileUrl is ignored.
export function webUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
