// Curated lists: hand-picked runs of adventures with a line on why. Add a list at the top to post
// one. Entries are content ids; one that is not in the library (yet, or any more) is left out.
// These starters point at the sample library until editors pick from the real one.

export interface CuratedList {
  id: string;
  title: string;
  line: string;
  entries: string[];
}

export const lists: CuratedList[] = [
  {
    id: "first-nights",
    title: "First nights",
    line: "Short and low level, for a party that has never played together.",
    entries: ["sample-cellar-of-the-copper-king", "sample-the-drowned-bell", "sample-lantern-road", "sample-the-long-night-at-orrin-s-mill"],
  },
  {
    id: "talking-not-fighting",
    title: "Talking, not fighting",
    line: "Adventures won mostly with words.",
    entries: ["sample-the-salt-wife", "sample-the-thornwake-heir", "sample-wolves-at-merrow-gate"],
  },
  {
    id: "the-lantern-roads",
    title: "The lantern roads",
    line: "Read in order: the marsh, then the town it reaches.",
    entries: ["sample-lantern-road", "sample-fen-lights"],
  },
  {
    id: "hard-choices",
    title: "Hard choices",
    line: "No clean way out; every ending costs someone.",
    entries: ["sample-hunger-in-the-hill-forts", "sample-ash-over-kestrel-ford", "sample-children-of-the-cinder"],
  },
];
