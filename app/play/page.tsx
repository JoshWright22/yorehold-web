import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { downloadUrl } from "@/lib/server";

export const metadata: Metadata = { title: "Play" };

export default function Play() {
  return (
    <>
      <PageHead title="Play" kicker="In the browser" art="knights" />
      <div className="placeholder">
        <h2>The game will run here</h2>
        <p>
          This page is kept for the browser build of Yorehold. When it is ready the game itself will run in this page,
          signed in with your account on this site, so playing and Create work without a download.
        </p>
        <p>It isn&apos;t built yet. Until then, play the desktop version.</p>
        <p className="actions">
          <a href={downloadUrl()} className="button">
            Download Yorehold
          </a>
        </p>
        <p className="muted small">Windows only for now.</p>
      </div>
    </>
  );
}
