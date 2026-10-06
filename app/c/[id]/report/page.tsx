import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { first } from "@/lib/format";
import { reportKinds } from "@/lib/reports";
import { isId } from "@/lib/server";
import { getSession } from "@/lib/session";
import { reportAction } from "../actions";

export const metadata: Metadata = { title: "Report" };

const errors: { [key: string]: string } = {
  reason: "Say what is wrong, in up to 1000 characters.",
  offline: "The game server can't be reached right now, so the report wasn't sent.",
  failed: "The report wasn't accepted. Try again.",
};

type Query = { [key: string]: string | string[] | undefined };
type Props = { params: Promise<{ id: string }>; searchParams: Promise<Query> };

export default async function ReportPage({ params, searchParams }: Props) {
  const { id } = await params;
  if (!isId(id)) notFound();
  const path = "/c/" + encodeURIComponent(id);

  const query = await searchParams;
  if (first(query.sent)) {
    return (
      <div className="narrow">
        <h1>Report sent</h1>
        <p>Thank you. A moderator will look at it.</p>
        <p>
          <Link href={path}>Back to the page</Link>
        </p>
      </div>
    );
  }

  if (!(await getSession())) redirect("/login?next=" + encodeURIComponent(path + "/report"));
  const error = errors[first(query.error)];

  return (
    <div className="narrow">
      <h1>Report</h1>
      <p className="muted">
        Reporting <Link href={path}>{id}</Link>. Reports go to the moderators, not to the author. See the <Link href="/site-rules">site rules</Link> for
        what is not allowed.
      </p>
      {error ? (
        <p className="notice error" role="alert">
          {error}
        </p>
      ) : null}
      <form action={reportAction} className="stack">
        <input type="hidden" name="id" value={id} />
        <label>
          What kind of problem?
          <select name="kind" defaultValue={first(query.kind) || "other"}>
            {reportKinds.map((kind) => (
              <option key={kind.id} value={kind.id}>
                {kind.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          What is wrong with it?
          <textarea name="reason" required maxLength={1000} rows={6} />
        </label>
        <button type="submit" className="button">
          Send report
        </button>
      </form>
    </div>
  );
}
