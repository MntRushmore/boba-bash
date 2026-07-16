import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/hcauth";

const STATE_COOKIE = "hcauth-state";

/** Organizer login: start the Hack Club Auth OIDC flow. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  // CSRF state: random value echoed back and checked at the callback.
  const state = crypto.randomUUID();
  const url = buildAuthorizeUrl(origin, state);

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
