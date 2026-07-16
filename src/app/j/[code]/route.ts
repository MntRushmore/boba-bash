import { NextRequest, NextResponse } from "next/server";
import { stashReferral } from "@/lib/referral";
import { getSession } from "@/lib/auth";

/**
 * Referral entry point: bash.hackclub.com/j/<code>.
 * Stashes the organizer's code, then sends the visitor to sign in (or straight
 * to the dashboard if they're already signed in — attribution still applies).
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  await stashReferral(code);

  const session = await getSession();
  const dest = session ? "/dashboard" : "/signin?ref=1";
  return NextResponse.redirect(new URL(dest, request.nextUrl.origin));
}
