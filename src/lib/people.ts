import "server-only";

import {
  createRecord,
  escapeFormulaValue,
  findOne,
  updateRecord,
  type AirtableRecord,
} from "./airtable";
import type { PersonFields, Role } from "./schema";

const SLACK_ID_RE = /^[UW][A-Z0-9]{8,11}$/;

export type PersonRecord = AirtableRecord<PersonFields>;

/** Look up a Person by their Slack user id. */
export async function getPersonBySlackId(
  slackId: string,
): Promise<PersonRecord | null> {
  if (!SLACK_ID_RE.test(slackId)) {
    throw new Error(`Invalid Slack ID passed to getPersonBySlackId: ${slackId}`);
  }
  return findOne<PersonFields>(
    "people",
    `{slack_id} = '${escapeFormulaValue(slackId)}'`,
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
 * Create a Person on first sign-in. Everyone starts as an attendee; becoming an
 * organizer happens when they create a meetup. A referral code is generated for
 * every account so anyone can share their link.
 */
export async function createPerson(input: {
  slackId: string;
  email: string;
  fullName?: string;
  role?: Role;
}): Promise<PersonRecord> {
  return createRecord<PersonFields>("people", {
    slack_id: input.slackId,
    email: input.email,
    full_name: input.fullName,
    role: input.role ?? "attendee",
    referral_code: generateReferralCode(input.slackId),
  });
}

export async function upsertPersonOnLogin(input: {
  slackId: string;
  email: string;
  fullName?: string;
}): Promise<PersonRecord> {
  const existing = await getPersonBySlackId(input.slackId);
  if (existing) return existing;
  return createPerson(input);
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
 * Deterministic, URL-safe referral code derived from the Slack id — stable per
 * person and readable in a link. Not a secret; it only attributes signups.
 */
function generateReferralCode(slackId: string): string {
  return slackId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
}
