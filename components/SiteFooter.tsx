import Link from "next/link";

// Only what a visitor might need from any page and cannot reach from the top bar.
const links = [
  { href: "/site-rules", label: "Site rules" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/status", label: "Server status" },
  { href: "https://github.com/JoshWright22/yorehold", label: "Source code" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith("/") ? (
              <Link href={link.href}>{link.label}</Link>
            ) : (
              <a href={link.href} rel="noopener noreferrer">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
      <p>Yorehold 2026</p>
    </footer>
  );
}
