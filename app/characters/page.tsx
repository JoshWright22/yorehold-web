import { redirect } from "next/navigation";

// Characters live on the player's own page now; old links land on that tab.
export default function Characters() {
  redirect("/account?tab=characters");
}
