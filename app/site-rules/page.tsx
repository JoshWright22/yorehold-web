import type { Metadata } from "next";
import Unwritten from "@/components/Unwritten";

export const metadata: Metadata = { title: "Site rules" };

export default function SiteRules() {
  return (
    <Unwritten title="Site rules">
      <p>What may be published and how people are expected to treat each other here will be set out on this page.</p>
      <p>Until then, anything that looks wrong can be reported from its own page; reports go to the moderators.</p>
    </Unwritten>
  );
}
