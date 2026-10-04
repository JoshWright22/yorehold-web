// The format docs, read from the sibling repos when the site is built. A file that isn't there is
// left out, so the site still builds on its own.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

export interface Doc {
  slug: string;
  title: string;
  source: string;
  html: string;
}

const sources = [
  { slug: "content", title: "Content files", file: "../yorehold/docs/CONTENT.md" },
  { slug: "dialogue", title: "Dialogue", file: "../yorehold-framework/docs/DIALOGUE.md" },
  { slug: "quests", title: "Quests", file: "../yorehold-framework/docs/QUESTS.md" },
];

export async function loadDocs(): Promise<Doc[]> {
  const docs: Doc[] = [];
  for (const source of sources) {
    let text: string;
    try {
      text = await readFile(path.join(/* turbopackIgnore: true */ process.cwd(), source.file), "utf8");
    } catch {
      continue;
    }
    const html = await marked.parse(text, { gfm: true });
    docs.push({ slug: source.slug, title: source.title, source: source.file.replace("../", ""), html });
  }
  return docs;
}
