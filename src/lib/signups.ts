import "server-only";

import {
  createRecord,
  selectRecords,
  type AirtableRecord,
} from "./airtable";
import type { SignupFields } from "./schema";

export type SignupRecord = AirtableRecord<SignupFields>;

/** All signups for a person (across meetups). Filtered in code — see meetups.ts. */
export async function getSignupsByPerson(
  personId: string,
): Promise<SignupRecord[]> {
  const all = await selectRecords<SignupFields>("signups");
  return all.filter((s) => s.fields.person?.includes(personId));
}

/** The person's signup for a specific meetup, if any. */
export async function getSignup(
  personId: string,
  meetupId: string,
): Promise<SignupRecord | null> {
  const mine = await getSignupsByPerson(personId);
  return mine.find((s) => s.fields.meetup?.includes(meetupId)) ?? null;
}

/**
 * RSVP a person to a meetup. Idempotent — returns the existing signup if they
 * already RSVP'd. New signups start `pending` fraud review (they don't earn the
 * organizer money until staff clear them).
 */
export async function rsvp(input: {
  personId: string;
  meetupId: string;
  viaReferral: boolean;
  label?: string;
}): Promise<SignupRecord> {
  const existing = await getSignup(input.personId, input.meetupId);
  if (existing) return existing;

  return createRecord<SignupFields>("signups", {
    label: input.label,
    person: [input.personId],
    meetup: [input.meetupId],
    via_referral: input.viaReferral,
    rsvp_status: "going",
    checked_in: false,
    fraud_status: "pending",
    earns_payout: false,
  });
}
