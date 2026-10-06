// What a report can be about. The label goes in front of the reporter's own words, so moderators
// can sort reports at a glance without the server knowing the list.

export const reportKinds: { id: string; label: string }[] = [
  { id: "generated", label: "Made with AI" },
  { id: "stolen", label: "Someone else's work" },
  { id: "broken", label: "Broken or won't load" },
  { id: "offensive", label: "Hateful or harassing" },
  { id: "other", label: "Something else" },
];

export function reportLabel(id: string): string {
  return (reportKinds.find((kind) => kind.id === id) ?? reportKinds[reportKinds.length - 1]).label;
}
