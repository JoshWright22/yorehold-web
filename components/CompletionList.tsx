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
  if (completions.length === 0) return <p className="empty">{empty}</p>;
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Adventure</th>
            <th>Finished</th>
            <th className="wide">Difficulty</th>
            <th className="numeric">Rev</th>
            <th className="numeric">Times</th>
            <th className="wide">Party</th>
          </tr>
        </thead>
        <tbody>
          {completions.map((completion) => (
            <tr key={completion.adventure}>
              <td className="name-cell">
                <Link href={"/c/" + encodeURIComponent(completion.adventure)}>{completion.adventure}</Link>
              </td>
              <td className="num">{date(completion.completedAt)}</td>
              <td className="wide">{completion.difficulty || <span className="dash">-</span>}</td>
              <td className="numeric num">{completion.revision}</td>
              <td className="numeric num">{completion.times}</td>
              <td className="wide">{partyLine(completion) || <span className="dash">-</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
