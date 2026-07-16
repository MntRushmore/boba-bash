import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/hcauth";
import { upsertOrganizerFromHcAuth } from "@/lib/people";
import { establishSession } from "@/lib/auth";

const STATE_COOKIE = "hcauth-state";

/** Hack Club Auth OIDC callback (organizers). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const fail = (msg: string) =>
    NextResponse.redirect(
      new URL(`/signin?tab=organizer&error=${encodeURIComponent(msg)}`, url.origin),
    );

  if (errorParam) return fail(errorParam);
  if (!code || !state) return fail("missing_code");

  // CSRF check.
  const expected = request.cookies.get(STATE_COOKIE)?.value;
  if (!expected || expected !== state) return fail("bad_state");

  let claims;
  try {
    claims = await exchangeCode(url.origin, code);
  } catch (e) {
    console.error("HC Auth exchange failed:", e);
    return fail("exchange_failed");
  }

  const person = await upsertOrganizerFromHcAuth({
    sub: claims.sub,
    email: claims.email,
    name: claims.name,
    address: claims.address?.formatted,
  });

  await establishSession({
    personId: person.id,
    authType: "hc-auth",
    email: claims.email,
    name: claims.name ?? person.fields.full_name,
    role: "organizer",
    hcAuthSub: claims.sub,
  });

  const res = NextResponse.redirect(new URL("/dashboard", url.origin));
  res.cookies.delete(STATE_COOKIE);
  return res;
}
