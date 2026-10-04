import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import NavSession from "@/components/NavSession";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Yorehold", template: "%s | Yorehold" },
  description: "Adventures, rulesets and homebrew for Yorehold, made and shared by players.",
};

const links = [
  { href: "/library", label: "Library" },
  { href: "/play", label: "Play" },
  { href: "/forums", label: "Forums" },
  { href: "/canon", label: "Canon" },
  { href: "/docs", label: "Docs" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="nav" aria-label="Main">
            <Link href="/" className="brand">
              Yorehold
            </Link>
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
            <NavSession />
          </nav>
        </header>
        <main className="page">{children}</main>
        <footer className="site-footer">
          <p>Everything here is made by players and free to play.</p>
        </footer>
      </body>
    </html>
  );
}
