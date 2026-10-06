import type { Metadata } from "next";
import { PageHead } from "@/components/ui";

export const metadata: Metadata = { title: "Forums" };

const categories = [
  { name: "Classes", about: "Class and subclass homebrew, balance and builds." },
  { name: "Spells", about: "New spells and how the existing ones play." },
  { name: "Races", about: "Peoples of the world and their traits." },
  { name: "Items", about: "Weapons, armour, trinkets and loot tables." },
  { name: "Maps", about: "Maps, tile kits and the places they show." },
  { name: "Adventures", about: "Adventures in the library: feedback, help and spoilers." },
  { name: "General", about: "Everything else." },
];

export default function Forums() {
  return (
    <>
      <PageHead title="Forums" kicker="Not open yet">
        <p className="muted">Discussion will be kept per category and per content item.</p>
      </PageHead>
      <ul className="forum-list">
        {categories.map((category) => (
          <li key={category.name}>
            <h3>{category.name}</h3>
            <p>{category.about}</p>
            <span className="soon">coming soon</span>
          </li>
        ))}
      </ul>
    </>
  );
}
