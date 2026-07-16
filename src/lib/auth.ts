import "server-only";

import { cookies } from "next/headers";
import type { Role } from "./schema";

/*
 * Signed-cookie session, shared by both auth paths:
 *   - Organizers  → Hack Club Auth (OIDC)      → createHcAuthSession
 *   - Attendees   → our own magic email link   → createMagicSession
 *
 * The session itself is auth-method agnostic: a JSON blob HMAC-signed with
 * AUTH_SECRET (SHA-256), stored in an httpOnly cookie, verified with a
 * constant-time compare. Ported from Hack Club high-seas, generalized.
 */

export interface BashSession {
  /** People record id. */
  personId: string;
  authType: "hc-auth" | "magic-link";
  /** HC Auth `sub` (organizers) — absent for magic-link attendees. */
  hcAuthSub?: string;
  email: string;
  name?: string;
  role: Role;
  sig?: string;
}

export const SESSION_COOKIE = "bash-session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function hashSession(session: BashSession): Promise<string> {
  const str = [
    session.personId,
    session.authType,
    session.hcAuthSub || "",
    session.email,
    session.name || "",
    session.role,
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

/** Establish a signed session for a resolved Person. */
export async function establishSession(input: {
  personId: string;
  authType: BashSession["authType"];
  email: string;
  name?: string;
  role: Role;
  hcAuthSub?: string;
}): Promise<void> {
  await signAndSet({
    personId: input.personId,
    authType: input.authType,
    hcAuthSub: input.hcAuthSub,
    email: input.email,
    name: input.name,
    role: input.role,
  });
}
