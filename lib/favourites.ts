// Favourite adventures, kept in this browser until the server has a place for them. Each one keeps
// enough of the entry to draw its card, so the favourites list needs no server at all.
//
// Client only: it reads localStorage.

import { useSyncExternalStore } from "react";
import type { ContentItem } from "./server";

export type Favourite = Pick<ContentItem, "id" | "kind" | "name" | "description" | "tags" | "levelMin" | "levelMax" | "author" | "score" | "votesUp" | "votesDown"> & {
  savedAt: number;
};

const key = "yorehold.favourites";
// Sent to this tab's own listeners; the storage event only reaches other tabs.
const changed = "yorehold-favourites";
const none: Favourite[] = [];

let lastRaw: string | null = null;
let lastList: Favourite[] = none;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Private windows and blocked storage land here; there are simply no favourites.
    return null;
  }
}

function snapshot(): Favourite[] {
  const raw = readRaw();
  if (raw === lastRaw) return lastList;
  lastRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    lastList = Array.isArray(parsed) ? (parsed as Favourite[]) : none;
  } catch {
    lastList = none;
  }
  return lastList;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(changed, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changed, onChange);
  };
}

export function useFavourites(): Favourite[] {
  return useSyncExternalStore(subscribe, snapshot, () => none);
}

export function toggleFavourite(item: Omit<Favourite, "savedAt">): void {
  const list = snapshot();
  const next = list.some((entry) => entry.id === item.id)
    ? list.filter((entry) => entry.id !== item.id)
    : [{ ...item, savedAt: Date.now() }, ...list];
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(changed));
}
