// Stand-in pictures until content carries its own cover. The same entry always gets the same one,
// so a card and the home page agree.

const arts = ["ruins", "castle", "valley", "knights", "peaks", "dragon"];

export function artFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return arts[hash % arts.length];
}
