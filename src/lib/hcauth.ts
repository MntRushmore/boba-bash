import "server-only";

/*
 * Hack Club Auth — OIDC (Doorkeeper + doorkeeper-openid_connect).
 * Used for ORGANIZERS. Standard authorization-code flow against the fixed,
 * confirmed endpoints. We request community scopes plus `address` (HQ-only —
 * requires this client to be promoted to hq_official/trusted) so we can pull
 * the organizer's mailing address straight from their HC identity.
 *
 * Docs: https://auth.hackclub.com/docs/oidc-guide
 */

const ISSUER = "https://auth.hackclub.com";
const AUTHORIZE_URL = `${ISSUER}/oauth/authorize`;
const TOKEN_URL = `${ISSUER}/oauth/token`;
const USERINFO_URL = `${ISSUER}/oauth/userinfo`;

/** Scopes: community-allowed + `address` (HQ-gated, for the mailing address). */
const SCOPES = "openid profile email name verification_status address";

export interface HcAuthUser {
  sub: string;
  email: string;
  name?: string;
  /** Standard OIDC structured address (HQ `address` scope). */
  address?: {
    formatted?: string;
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
  verification_status?: string;
}

function callbackUrl(origin: string): string {
  return `${origin}/api/auth/callback`;
}

export function buildAuthorizeUrl(origin: string, state: string): string {
  const clientId = process.env.HCAUTH_CLIENT_ID;
  if (!clientId) throw new Error("Env HCAUTH_CLIENT_ID is not set");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: callbackUrl(origin),
    scope: SCOPES,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCode(
  origin: string,
  code: string,
): Promise<HcAuthUser> {
  const clientId = process.env.HCAUTH_CLIENT_ID;
  const clientSecret = process.env.HCAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error("HCAUTH_CLIENT_ID / HCAUTH_CLIENT_SECRET not set");

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl(origin),
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`HC Auth token exchange failed (${tokenRes.status})`);
  }
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("HC Auth token missing access_token");

  const userRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!userRes.ok) {
    throw new Error(`HC Auth userinfo failed (${userRes.status})`);
  }
  const claims = (await userRes.json()) as HcAuthUser;
  if (!claims.sub || !claims.email)
    throw new Error("HC Auth userinfo missing sub/email");
  return claims;
}
