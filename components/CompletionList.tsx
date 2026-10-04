import Link from "next/link";
import type { Completion } from "@/lib/server";
import { date } from "@/lib/format";

function partyLine(completion: Completion): string {
  if (!Array.isArray(completion.party)) return "";
  return completion.party
    .map((member) => {
      const name = typeof member?.name === "string" ? member.name : "";
      const cls = typeof member?.class === "string" ? member.class : "";
      const level = typeof member?.level === "number" ? " " + member.level : "";
      if (name && cls) return name + " (" + cls + level + ")";
      return name || cls;
    })
    .filter((line) => line !== "")
    .join(", ");
}

export default function CompletionList({ completions, empty }: { completions: Completion[]; empty: string }) {
  if (completions.length === 0) return <p className="muted">{empty}</p>;
  return (
    <ul className="completion-list">
      {completions.map((completion) => {
        const party = partyLine(completion);
        return (
          <li key={completion.adventure} className="card">
            <div className="card-body">
              <h3>
                <Link href={"/c/" + encodeURIComponent(completion.adventure)}>{completion.adventure}</Link>
              </h3>
              <p className="meta">
                <span>finished {date(completion.completedAt)}</span>
                {completion.difficulty ? <span>{completion.difficulty}</span> : null}
                <span>revision {completion.revision}</span>
                {completion.times > 1 ? <span>{completion.times} times</span> : null}
              </p>
              {party ? <p className="summary">{party}</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
