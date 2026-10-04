"use server";

import { redirect } from "next/navigation";
import { Codes, contentVote, isId, report, type VoteRequest } from "@/lib/server";
import { getSession } from "@/lib/session";

function pagePath(id: string): string {
  return "/c/" + encodeURIComponent(id);
}

function loginPath(next: string): string {
  return "/login?next=" + encodeURIComponent(next);
}

export async function voteAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const vote = String(formData.get("vote") ?? "");
  if (!isId(id)) redirect("/library");
  if (vote !== "up" && vote !== "down" && vote !== "clear") redirect(pagePath(id));

  const session = await getSession();
  if (!session) redirect(loginPath(pagePath(id)));

  const result = await contentVote(id, vote as VoteRequest, session.token);
  if (!result.ok) {
    if (result.code === Codes.unauthenticated) redirect(loginPath(pagePath(id)));
    redirect(pagePath(id) + "?vote=" + (result.offline ? "offline" : "failed"));
  }
  redirect(pagePath(id));
}

export async function reportAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!isId(id)) redirect("/library");
  const reportPath = pagePath(id) + "/report";

  const session = await getSession();
  if (!session) redirect(loginPath(reportPath));
  if (reason === "" || reason.length > 1000) redirect(reportPath + "?error=reason");

  const result = await report("content", id, reason, session.token);
  if (!result.ok) {
    if (result.code === Codes.unauthenticated) redirect(loginPath(reportPath));
    redirect(reportPath + "?error=" + (result.offline ? "offline" : "failed"));
  }
  redirect(reportPath + "?sent=1");
}
