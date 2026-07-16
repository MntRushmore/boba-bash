import "server-only";

import {
  createRecord,
  escapeFormulaValue,
  findOne,
  updateRecord,
  type AirtableRecord,
} from "./airtable";
import type { PersonFields, Role } from "./schema";

export type PersonRecord = AirtableRecord<PersonFields>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Look up a Person by email (the shared identity key). */
export async function getPersonByEmail(
  email: string,
): Promise<PersonRecord | null> {
  return findOne<PersonFields>(
    "people",
    `LOWER({email}) = '${escapeFormulaValue(normalizeEmail(email))}'`,
  );
}

/** Resolve an organizer by their referral code (used by /j/<code>). */
export async function getPersonByReferralCode(
  code: string,
): Promise<PersonRecord | null> {
  return findOne<PersonFields>(
    "people",
    `{referral_code} = '${escapeFormulaValue(code)}'`,
  );
}

/**
 * Upsert an ORGANIZER from a Hack Club Auth login. Creates on first sign-in,
 * marks them an organizer, and stores the mailing address pulled from HC Auth.
 */
export async function upsertOrganizerFromHcAuth(input: {
  sub: string;
  email: string;
  name?: string;
  address?: string;
}): Promise<PersonRecord> {
  const email = normalizeEmail(input.email);
  const existing = await getPersonByEmail(email);
  if (existing) {
    // Keep HC-sourced fields fresh; ensure organizer role.
    return updateRecord<PersonFields>("people", existing.id, {
      hcauth_sub: input.sub,
      role: "organizer",
      ...(input.address ? { mailing_address: input.address } : {}),
    });
  }
  return createRecord<PersonFields>("people", {
    email,
    full_name: input.name,
    role: "organizer",
    hcauth_sub: input.sub,
    mailing_address: input.address,
    referral_code: generateReferralCode(email),
  });
}

/**
 * Upsert an ATTENDEE from a verified magic-link email. Creates on first login.
 * Attendees start with the attendee role and no HC identity.
 */
export async function upsertAttendeeByEmail(
  rawEmail: string,
): Promise<PersonRecord> {
  const email = normalizeEmail(rawEmail);
  const existing = await getPersonByEmail(email);
  if (existing) return existing;
  return createRecord<PersonFields>("people", {
    email,
    role: "attendee",
    referral_code: generateReferralCode(email),
  });
}

export async function setRole(
  personId: string,
  role: Role,
): Promise<PersonRecord> {
  return updateRecord<PersonFields>("people", personId, { role });
}

/**
 * Attribute a person to the organizer behind a referral code — once. No-op if
 * they're already attributed, if the code is unknown, or if it's their own code
 * (an organizer can't refer themselves).
 */
export async function applyReferral(
  person: PersonRecord,
  code: string,
): Promise<void> {
  if (person.fields.referred_by?.length) return;
  if (person.fields.referral_code === code) return;

  const organizer = await getPersonByReferralCode(code);
  if (!organizer || organizer.id === person.id) return;

  await updateRecord<PersonFields>("people", person.id, {
    referred_by: [organizer.id],
  });
}

/**
 * URL-safe referral code derived from the email — stable per person and
 * readable in a link. Not a secret; it only attributes signups.
 */
function generateReferralCode(email: string): string {
  const local = email.split("@")[0] ?? email;
  const slug = local.toLowerCase().replace(/[^a-z0-9]/g, "");
  // Short hash suffix keeps codes unique when local-parts collide.
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0;
  const suffix = (h >>> 0).toString(36).slice(0, 4);
  return `${slug.slice(0, 8)}${suffix}`;
}
