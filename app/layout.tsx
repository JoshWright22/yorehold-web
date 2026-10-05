import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import TopBar from "@/components/TopBar";
import "./theme.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Yorehold", template: "%s | Yorehold" },
  description: "Adventures, rulesets and homebrew for Yorehold, made and shared by players.",
};

export const viewport: Viewport = {
  themeColor: "#212123",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
