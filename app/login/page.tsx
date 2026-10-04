import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { first } from "@/lib/format";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

const errors: { [key: string]: string } = {
  missing: "Enter your email and password.",
  short: "The password must be at least 8 characters.",
  name: "A name is 3 to 32 letters, digits, dots, dashes or underscores.",
  wrong: "That email and password don't match an account.",
  taken: "That name or email is already in use.",
  refused: "The server didn't accept that. Check the email address and try again.",
  offline: "The game server can't be reached right now. Try again in a little while.",
};

type Query = { [key: string]: string | string[] | undefined };

export default async function Login({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const next = safeNext(first(query.next));
  if (await getSession()) redirect(next);

  const signup = first(query.mode) === "signup";
  const error = errors[first(query.error)];
  const other = "/login?" + new URLSearchParams(signup ? { next } : { mode: "signup", next }).toString();

  return (
    <div className="narrow">
      <h1>{signup ? "Create an account" : "Sign in"}</h1>
      <p className="muted">The same account works here and in the game.</p>

      {error ? (
        <p className="notice error" role="alert">
          {error}
        </p>
      ) : null}

      <form method="post" action="/api/session" className="stack">
        <input type="hidden" name="mode" value={signup ? "signup" : "signin"} />
        <input type="hidden" name="next" value={next} />
        {signup ? (
          <label>
            Name
            <input type="text" name="username" required minLength={3} maxLength={32} pattern="[A-Za-z0-9_.\-]+" autoComplete="username" />
          </label>
        ) : null}
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" name="password" required minLength={8} autoComplete={signup ? "new-password" : "current-password"} />
        </label>
        <button type="submit" className="button">
          {signup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p>
        {signup ? "Already have an account? " : "New here? "}
        <Link href={other}>{signup ? "Sign in" : "Create an account"}</Link>
      </p>
    </div>
  );
}
