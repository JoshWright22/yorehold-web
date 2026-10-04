import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Canon" };

export default function Canon() {
  return (
    <>
      <h1>Canon</h1>
      <div className="placeholder">
        <h2>The review queue will be here</h2>
        <p>
          Content that scores above its category&apos;s threshold is put forward for canon. One to three approvers of
          that category then sign it off, and it joins the shared ruleset or the featured library.
        </p>
        <p>
          The queue, sign-offs and flags aren&apos;t built yet. For now, voting in the <Link href="/library">library</Link>{" "}
          is what counts.
        </p>
      </div>
    </>
  );
}
