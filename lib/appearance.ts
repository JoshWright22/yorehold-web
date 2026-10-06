// A player's picture and profile background. Kept in this browser, per account, until the server
// stores them; so for now only the owner sees their own, and everyone else sees the defaults.
//
// Client only: it reads localStorage and draws on a canvas.

import { useSyncExternalStore } from "react";

export interface Appearance {
  // Both are JPEG data URLs, already cut down to size.
  avatar?: string;
  cover?: string;
}

const prefix = "yorehold.appearance.";
const changed = "yorehold-appearance";
const none: Appearance = {};
const cache = new Map<string, { raw: string | null; value: Appearance }>();

function read(userId: string): Appearance {
  if (!userId) return none;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(prefix + userId);
  } catch {
    return none;
  }
  const hit = cache.get(userId);
  if (hit && hit.raw === raw) return hit.value;
  let value: Appearance = none;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") value = parsed as Appearance;
  } catch {
    value = none;
  }
  cache.set(userId, { raw, value });
  return value;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(changed, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changed, onChange);
  };
}

export function useAppearance(userId: string): Appearance {
  return useSyncExternalStore(
    subscribe,
    () => read(userId),
    () => none,
  );
}

// False when the browser would not keep it (storage full or blocked).
export function setAppearance(userId: string, change: Partial<Record<keyof Appearance, string | null>>): boolean {
  const next: Appearance = { ...read(userId) };
  for (const [key, value] of Object.entries(change) as [keyof Appearance, string | null][]) {
    if (value) next[key] = value;
    else delete next[key];
  }
  try {
    window.localStorage.setItem(prefix + userId, JSON.stringify(next));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(changed));
  return true;
}

// Crops the picture to the given shape from its middle and scales it down, as a JPEG data URL.
export function fitImage(file: File, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.max(width / image.width, height / image.height);
      const cropW = width / scale;
      const cropH = height / scale;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("no canvas"));
        return;
      }
      context.drawImage(image, (image.width - cropW) / 2, (image.height - cropH) / 2, cropW, cropH, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("not a picture"));
    };
    image.src = url;
  });
}
