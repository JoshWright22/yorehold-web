// The plain data behind the list and detail browser. Pages build rows on the server and hand them
// to the client browser, so everything here has to survive being sent as JSON.

export interface Column {
  key: string;
  label: string;
  // Numbers sort as numbers and are set in monospace.
  numeric?: boolean;
  // Left out on narrow screens.
  wide?: boolean;
}

export interface Pair {
  label: string;
  value: string;
}

export interface SheetSection {
  title: string;
  lines: { label?: string; text: string }[];
}

// One entry laid out like a page of a rule book.
export interface Sheet {
  kind: string;
  title: string;
  subtitle?: string;
  description?: string[];
  tiles?: Pair[];
  stats?: Pair[];
  sections?: SheetSection[];
  chips?: string[];
  links?: { label: string; href: string; primary?: boolean }[];
}

// One line of the ranked table.
export interface RankedRow {
  id: string;
  rank: number;
  name: string;
  href: string;
  author: string;
  authorHref: string;
  kind: string;
  // 0 means "any".
  levelMin: number;
  levelMax: number;
  score: number;
  revision: number;
  tags: string[];
}

export interface Row {
  id: string;
  name: string;
  // The entry's own page.
  href: string;
  kind: string;
  cells: { [key: string]: string | number };
  chips: string[];
  sheet: Sheet;
}
