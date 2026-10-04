// The signed-in user, read from the session cookie. The cookie holds the server's own session
// token; it is httpOnly, so only this site's server code sees it.

import { cookies } from "next/headers";

export const sessionCookie = "yorehold_session";

export interface Session {
  token: string;
  userId: string;
  name: string;
  // Seconds since 1970.
  expires: number;
}

// Reads what the token says without checking its signature: the game server checks it on every
// call made with it. This is only for showing who is signed in.
export function readToken(token: string): Session | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      uid?: unknown;
      usn?: unknown;
      exp?: unknown;
    };
    if (typeof claims.uid !== "string" || typeof claims.exp !== "number") return null;
    if (claims.exp * 1000 <= Date.now()) return null;
    return {
      token,
      userId: claims.uid,
      name: typeof claims.usn === "string" ? claims.usn : "",
      expires: claims.exp,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(sessionCookie)?.value;
  return token ? readToken(token) : null;
}

// Only paths on this site, so a sign-in link can't send someone elsewhere afterwards.
export function safeNext(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
