import type { ReactNode } from "react";
import { PageHead } from "./ui";

// A page whose text has not been written yet. It says so plainly instead of inventing terms.
export default function Unwritten({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHead title={title} kicker="Not written yet" />
      <div className="placeholder">{children}</div>
    </>
  );
}
