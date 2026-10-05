import Link from "next/link";

const columns = [
  {
    title: "Play",
    links: [
      { href: "/play", label: "Play in the browser" },
      { href: "/library", label: "Find an adventure" },
    ],
  },
  {
    title: "Browse",
    links: [
      { href: "/library", label: "Library" },
      { href: "/compendium", label: "Compendium" },
      { href: "/canon", label: "Canon" },
    ],
  },
  {
    title: "Make",
    links: [
      { href: "/docs", label: "Format docs" },
      { href: "/forums", label: "Forums" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/login?mode=signup", label: "Create an account" },
      { href: "/account", label: "Your account" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="brand">
            <span className="brand-mark" aria-hidden="true">
              Y
            </span>
            Yorehold
          </p>
          <p className="muted">Everything here is made by players and free to play.</p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} className="footer-column" aria-label={column.title}>
            <h2>{column.title}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
