import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { config, serverConfigured } from "@/lib/server";

export const metadata: Metadata = { title: "Server status" };

// Asked of the server on every visit.
export const dynamic = "force-dynamic";

// Asks the server for anything at all and times the answer.
async function ask() {
  const started = performance.now();
  const answer = await config();
  return { answer, took: Math.round(performance.now() - started) };
}

export default async function Status() {
  const { answer, took } = await ask();

  // A refusal still means the server is there and answering.
  const up = answer.ok || !answer.offline;

  return (
    <>
      <PageHead title="Server status" kicker="Checked just now" />
      <table className="status-table">
        <tbody>
          <tr>
            <th scope="row">Website</th>
            <td>
              <span className="status-dot up" aria-hidden="true" />
              Up
            </td>
            <td className="muted">You are reading it.</td>
          </tr>
          <tr>
            <th scope="row">Game server</th>
            <td>
              <span className={up ? "status-dot up" : "status-dot down"} aria-hidden="true" />
              {up ? "Up" : "Down"}
            </td>
            <td className="muted">
              {up ? (
                <>
                  Answered in <span className="num">{took} ms</span>.
                </>
              ) : serverConfigured() ? (
                "It can't be reached. The library, accounts and votes are off until it is back; the compendium and docs still work."
              ) : (
                "This copy of the site isn't connected to one."
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
