import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter_Tight, JetBrains_Mono, Newsreader } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import TopBar from "@/components/TopBar";
import "./theme.css";
import "./globals.css";

// Three faces: a tight grotesque for the page, a book serif for entries, a mono for numbers.
// theme.css reads them through these variables.
const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Yorehold", template: "%s | Yorehold" },
  description: "Adventures, rulesets and homebrew for Yorehold, made and shared by players.",
};

export const viewport: Viewport = {
  themeColor: "#1e1e1e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sans.variable + " " + serif.variable + " " + code.variable}>
      <body>
        <a href="#main" className="skip-link">
          Skip to the page
        </a>
        <TopBar />
        <main id="main" className="page">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
