import type { Metadata } from "next";
import Unwritten from "@/components/Unwritten";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <Unwritten title="Terms">
      <p>The terms for using this site and publishing to the library will be here before accounts open to everyone.</p>
    </Unwritten>
  );
}
