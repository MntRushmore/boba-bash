import { NextRequest, NextResponse } from "next/server";
import { createSlackSession, getRedirectUri } from "@/lib/auth";
import { REFERRAL_COOKIE } from "@/lib/referral";

/**
 * Slack OpenID callback. Exchanges the `code` for an id_token, creates the
 * session (and the Person on first sign-in), then routes to the dashboard.
 * A referral code, if present, was stashed in a cookie before the OAuth hop
 * and is applied on the dashboard's first load.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");

  const errRedirect = (msg: string) =>
    NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(msg)}`, url.origin),
    );

  if (errorParam) return errRedirect(errorParam);
  if (!code) return errRedirect("missing_code");

  const redirectUri = await getRedirectUri();
  const exchangeUrl =
    `https://slack.com/api/openid.connect.token` +
    `?code=${encodeURIComponent(code)}` +
    `&client_id=${process.env.SLACK_CLIENT_ID}` +
    `&client_secret=${process.env.SLACK_CLIENT_SECRET}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const res = await fetch(exchangeUrl, { method: "POST" });
  if (!res.ok) return errRedirect("slack_token_status");

  let data: { ok?: boolean; id_token?: string };
  try {
    data = await res.json();
  } catch {
    return errRedirect("slack_token_parse");
  }
  if (!data.ok || !data.id_token) return errRedirect("slack_token_invalid");

  try {
    await createSlackSession(data.id_token);
  } catch (e) {
    console.error("createSlackSession failed:", e);
    return errRedirect("session_create_failed");
  }

  // The referral cookie (if any) is consumed on the dashboard.
  const referred = request.cookies.get(REFERRAL_COOKIE)?.value;
  const dest = referred ? "/dashboard?welcome=1" : "/dashboard";
  return NextResponse.redirect(new URL(dest, url.origin));
}
