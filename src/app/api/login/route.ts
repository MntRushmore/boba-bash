import { NextRequest, NextResponse } from "next/server";
import { getSlackAuthUrl } from "@/lib/auth";

/** Kick off Slack OpenID login, then bounce to Slack's authorize page. */
export async function GET(_request: NextRequest) {
  const authUrl = await getSlackAuthUrl();
  return NextResponse.redirect(authUrl);
}
