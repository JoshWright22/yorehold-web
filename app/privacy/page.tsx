import type { Metadata } from "next";
import Unwritten from "@/components/Unwritten";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <Unwritten title="Privacy">
      <p>What the site and the game keep about an account, and how to have it removed, will be set out here.</p>
    </Unwritten>
  );
}
