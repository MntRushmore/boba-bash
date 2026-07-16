import "server-only";

import { cookies, headers } from "next/headers";
import { upsertPersonOnLogin } from "./people";
import type { Role } from "./schema";

/*
 * Signed-cookie session, ported from Hack Club high-seas (utils/server/auth.ts)
 * with three deliberate changes:
 *   1. `cookies()` / `headers()` are awaited (Next 15+ made them async).
 *   2. `verifySession` uses a constant-time compare instead of `===`.
 *   3. The session carries our `role`, and first sign-in CREATES a Person
 *      (high-seas disabled signups when the event ended).
 */

export interface BashSession {
  /** People record id. */
  personId: string;
  authType: "slack-oauth";
  slackId: string;
  email: string;
  name?: string;
  role: Role;
  picture?: string;
  sig?: string;
}

export const SESSION_COOKIE = "bash-session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function parseJwt(token: string): Record<string, unknown> {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(json);
}

async function hashSession(session: BashSession): Promise<string> {
  const str = [
    session.personId,
    session.authType,
    session.slackId,
    session.email,
    session.name || "",
    session.role,
    session.picture || "",
  ].join("|");

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) throw new Error("Env AUTH_SECRET is not set");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(authSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, encoder.encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison to avoid leaking the signature via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifySession(
  session: BashSession,
): Promise<BashSession | null> {
  if (!session?.sig) return null;
  const expected = await hashSession(session);
  return timingSafeEqual(session.sig, expected) ? session : null;
}

export async function signAndSet(session: BashSession): Promise<void> {
  session.sig = await hashSession(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Read + verify the current session from the cookie, or null. */
export async function getSession(): Promise<BashSession | null> {
  try {
    const store = await cookies();
    const cookie = store.get(SESSION_COOKIE);
    if (!cookie) return null;
    return verifySession(JSON.parse(cookie.value) as BashSession);
  } catch (error) {
    console.error("Error verifying session:", error);
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Exchange a Slack OpenID id_token for a session. Creates the Person on first
 * sign-in (attendee by default).
 */
export async function createSlackSession(idToken: string): Promise<void> {
  const payload = parseJwt(idToken);
  const slackId = payload.sub as string;
  const email = payload.email as string;
  if (!slackId || !email) throw new Error("Slack token missing sub/email");

  const person = await upsertPersonOnLogin({
    slackId,
    email,
    fullName: payload.name as string | undefined,
  });

  await signAndSet({
    personId: person.id,
    authType: "slack-oauth",
    slackId,
    email,
    name: (payload.name as string) || person.fields.full_name,
    role: person.fields.role,
    picture: payload.picture as string | undefined,
  });
}

/** Build the OAuth redirect_uri from the incoming request host. */
export async function getRedirectUri(): Promise<string> {
  const h = await headers();
  const host = h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}/api/slack_redirect`;
}

/** Slack "Sign in with Slack" (OpenID) authorize URL. */
export async function getSlackAuthUrl(state?: string): Promise<string> {
  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) throw new Error("Env SLACK_CLIENT_ID is not set");
  const redirectUri = await getRedirectUri();
  const params = new URLSearchParams({
    response_type: "code",
    scope: "openid profile email",
    client_id: clientId,
    redirect_uri: redirectUri,
  });
  if (state) params.set("state", state);
  return `https://slack.com/openid/connect/authorize?${params.toString()}`;
}
