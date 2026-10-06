// The news on the home page, newest first. Add an entry at the top to post one.

export interface NewsItem {
  title: string;
  // The day it was posted, as YYYY-MM-DD.
  day: string;
  line: string;
  // Where the title leads, if anywhere.
  href?: string;
}

export const news: NewsItem[] = [
  {
    title: "The compendium is up",
    day: "2026-10-05",
    line: "Chapters, creatures, items, spells and classes from the game's own files, as tables you can filter.",
    href: "/compendium",
  },
  {
    title: "Format docs on the site",
    day: "2026-10-03",
    line: "How content, dialogue and quest files are written, for anyone making their own.",
    href: "/docs",
  },
  {
    title: "Library and accounts",
    day: "2026-10-03",
    line: "Browse what players have published, vote on it and sign in by email.",
    href: "/library",
  },
];
