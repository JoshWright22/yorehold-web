import type { Metadata } from "next";

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
      <h1>Forums</h1>
      <p className="notice">Coming soon. Discussion will be kept per category and per content item.</p>
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.name} className="card">
            <div className="card-body">
              <h3>{category.name}</h3>
              <p className="summary">{category.about}</p>
            </div>
            <span className="soon">coming soon</span>
          </li>
        ))}
      </ul>
    </>
  );
}
