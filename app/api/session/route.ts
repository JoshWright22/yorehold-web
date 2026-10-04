// GET: who is signed in (for the nav). POST: sign in or sign up from the /login form, keeping the
// server's session token in an httpOnly cookie.

import { NextResponse, type NextRequest } from "next/server";
import { authenticateEmail, Codes } from "@/lib/server";
import { getSession, readToken, safeNext, sessionCookie } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    { user: session ? { id: session.userId, name: session.name } : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// A form on another site must not be able to sign a visitor in here.
function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return false;
  }
}

function back(request: NextRequest, mode: string, next: string, error: string) {
  const url = new URL("/login", request.url);
  if (mode === "signup") url.searchParams.set("mode", "signup");
  url.searchParams.set("next", next);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Wrong origin" }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Expected a form" }, { status: 400 });
  }

  const mode = form.get("mode") === "signup" ? "signup" : "signin";
  const next = safeNext(form.get("next"));
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const username = String(form.get("username") ?? "").trim();

  if (email === "" || password === "") return back(request, mode, next, "missing");
  // Nakama's own limits; said here so the answer is a clear one.
  if (password.length < 8) return back(request, mode, next, "short");
  if (mode === "signup" && !/^[A-Za-z0-9_.-]{3,32}$/.test(username)) return back(request, mode, next, "name");

  const result = await authenticateEmail(email, password, mode === "signup", username);
  if (!result.ok) {
    if (result.offline) return back(request, mode, next, "offline");
    if (result.code === Codes.alreadyExists) return back(request, mode, next, "taken");
    if (mode === "signin") return back(request, mode, next, "wrong");
    return back(request, mode, next, "refused");
  }

  const session = readToken(result.data.token);
  if (!session) return back(request, mode, next, "offline");

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(sessionCookie, result.data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expires * 1000),
  });
  return response;
}
