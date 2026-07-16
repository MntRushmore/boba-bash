import "server-only";

import { Resend } from "resend";
import {
  createRecord,
  escapeFormulaValue,
  findOne,
  updateRecord,
  type AirtableRecord,
} from "./airtable";
import type { MagicLinkFields } from "./schema";

/*
 * Attendee magic-link login (our own flow — not Hack Club Auth).
 * A raw token goes out only in the emailed link; we persist just its SHA-256
 * hash. Tokens are single-use and expire in 30 minutes.
 */

const TTL_MS = 30 * 60 * 1000;
const FROM = "Boba Bash <login@bash.hackclub.com>";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Create a magic link for an email and send it. Returns the link (for dev). */
export async function sendMagicLink(
  rawEmail: string,
  origin: string,
): Promise<{ link: string; sent: boolean }> {
  const email = normalizeEmail(rawEmail);
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();

  await createRecord<MagicLinkFields>("magic_links", {
    email,
    token_hash: tokenHash,
    expires_at: expiresAt,
    consumed: false,
  });

  const link = `${origin}/api/attendee/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev fallback: no provider configured — log the link so the flow is testable.
    console.log(`[magic-link] ${email} → ${link}`);
    return { link, sent: false };
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Boba Bash sign-in link",
    text: `Tap to sign in to Boba Bash:\n\n${link}\n\nThis link works once and expires in 30 minutes. If you didn't request it, you can ignore this email.`,
  });
  return { link, sent: true };
}

/**
 * Verify a raw token against its stored hash for an email. Consumes it on
 * success. Returns the email if valid, else null.
 */
export async function consumeMagicLink(
  rawEmail: string,
  token: string,
): Promise<string | null> {
  const email = normalizeEmail(rawEmail);
  const tokenHash = await sha256Hex(token);

  const record = (await findOne<MagicLinkFields>(
    "magic_links",
    `AND({email} = '${escapeFormulaValue(email)}', {token_hash} = '${escapeFormulaValue(tokenHash)}')`,
  )) as AirtableRecord<MagicLinkFields> | null;

  if (!record) return null;
  if (record.fields.consumed) return null;
  if (new Date(record.fields.expires_at).getTime() < Date.now()) return null;

  await updateRecord<MagicLinkFields>("magic_links", record.id, {
    consumed: true,
  });
  return email;
}
