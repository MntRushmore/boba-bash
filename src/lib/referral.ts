import "server-only";

import { cookies } from "next/headers";

/**
 * Referral attribution. An organizer's link is bash.hackclub.com/j/<code>.
 * Opening it stashes the code in a cookie that survives the Slack OAuth
 * round-trip; on the new attendee's first authenticated load we read the code,
 * resolve the organizer, and write the `referred_by` link — once.
 */

export const REFERRAL_COOKIE = "bash-ref";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function stashReferral(code: string): Promise<void> {
  const store = await cookies();
  store.set(REFERRAL_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function readReferral(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFERRAL_COOKIE)?.value ?? null;
}

export async function clearReferral(): Promise<void> {
  const store = await cookies();
  store.delete(REFERRAL_COOKIE);
}

/** The full shareable link for an organizer's referral code. */
export function referralLink(code: string, origin: string): string {
  return `${origin}/j/${code}`;
}
