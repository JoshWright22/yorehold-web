import { NextResponse, type NextRequest } from "next/server";
import { sessionCookie } from "@/lib/session";

// Signing out is a POST (the nav and the account page send one), so a link or a prefetch can't
// sign anyone out by accident.
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(sessionCookie);
  return response;
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/account", request.url), 303);
}
