import "server-only";

import { selectRecords } from "./airtable";
import type { SignupFields, SubmissionFields } from "./schema";
import { PAYOUT_PER_SIGNUP } from "./schema";
import { getMeetupsByOrganizer } from "./meetups";

export interface OrganizerStats {
  meetupCount: number;
  approvedMeetupCount: number;
  /** Signups across the organizer's meetups that have cleared fraud review. */
  clearedSignups: number;
  /** Signups still awaiting fraud review. */
  pendingSignups: number;
  /** $8.50 x cleared signups — the food balance. */
  foodBalance: number;
  /** Soft goal: how many signups turned into an approved submission. */
  approvedSubmissions: number;
}

/**
 * Aggregate an organizer's numbers for the dashboard. Money accrues on
 * fraud-cleared SIGNUPS (not attendance, not submissions). Approved submissions
 * are surfaced only as a soft goal and never affect the balance.
 */
export async function getOrganizerStats(
  organizerId: string,
): Promise<OrganizerStats> {
  const meetups = await getMeetupsByOrganizer(organizerId);
  const meetupIds = new Set(meetups.map((m) => m.id));

  if (meetupIds.size === 0) {
    return {
      meetupCount: 0,
      approvedMeetupCount: 0,
      clearedSignups: 0,
      pendingSignups: 0,
      foodBalance: 0,
      approvedSubmissions: 0,
    };
  }

  // Airtable can't formula-filter a link field by record id, so fetch and match
  // the meetup id array in code (see getMeetupsByOrganizer).
  const belongsToOrganizer = (meetupLink?: string[]) =>
    meetupLink?.some((id) => meetupIds.has(id)) ?? false;

  const allSignups = await selectRecords<SignupFields>("signups");
  const allSubmissions = await selectRecords<SubmissionFields>("submissions");
  const signups = allSignups.filter((s) => belongsToOrganizer(s.fields.meetup));
  const submissions = allSubmissions.filter((s) =>
    belongsToOrganizer(s.fields.meetup),
  );

  const clearedSignups = signups.filter(
    (s) => s.fields.fraud_status === "cleared",
  ).length;
  const pendingSignups = signups.filter(
    (s) => s.fields.fraud_status === "pending",
  ).length;
  const approvedSubmissions = submissions.filter(
    (s) => s.fields.status === "approved",
  ).length;

  return {
    meetupCount: meetups.length,
    approvedMeetupCount: meetups.filter((m) => m.fields.status === "approved")
      .length,
    clearedSignups,
    pendingSignups,
    foodBalance: clearedSignups * PAYOUT_PER_SIGNUP,
    approvedSubmissions,
  };
}
