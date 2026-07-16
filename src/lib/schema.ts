/*
 * Typed field shapes for the five Boba Bash Airtable tables.
 * Field names are the Airtable column keys (snake_case) — keep them in sync
 * with the base. See the platform plan for the data model.
 */

export type Role = "organizer" | "attendee";
export type FraudStatus = "pending" | "cleared" | "flagged";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type MeetupStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PayoutStatus = "advanced" | "reconciled" | "settled";
export type RsvpStatus = "going" | "waitlist" | "cancelled";

/**
 * People — one row per account. Email is the shared identity key across both
 * auth paths. Organizers authenticate via Hack Club Auth (so they carry an
 * `hcauth_sub`); attendees authenticate via our magic link (no HC identity).
 */
export interface PersonFields {
  email: string;
  full_name?: string;
  role: Role;
  /** HC Auth `sub` (organizers only) — format `ident!...`. */
  hcauth_sub?: string;
  /**
   * Mailing address (fraud line). For organizers this comes from HC Auth's
   * `address` scope; for attendees it's collected in our own signup form.
   */
  mailing_address?: string;
  /** Unique code that powers this organizer's referral link. */
  referral_code?: string;
  /** Linked People record id of the organizer who referred this person. */
  referred_by?: string[];
  /** Short-lived one-time code minted at payout claim time. */
  payout_otp?: string;
  payout_otp_expires?: string;
  created_at?: string;
}

/** Meetups — one Bash, owned by an organizer. Staff must approve. */
export interface MeetupFields {
  name: string;
  organizer: string[]; // linked People id
  venue?: string;
  city?: string;
  /** "lat,lng" for the map pin. */
  geocode?: string;
  date?: string;
  slack_channel?: string;
  capacity?: number;
  status: MeetupStatus;
  hidden?: boolean;
}

/**
 * Signups / RSVPs — the earning unit. A fraud-cleared signup credits the
 * organizer $8.50. Attendance and submission are NOT required to earn.
 */
export interface SignupFields {
  person: string[]; // linked People id
  meetup: string[]; // linked Meetups id
  /** Did this signup arrive through the organizer's referral link? */
  via_referral?: boolean;
  rsvp_status?: RsvpStatus;
  checked_in?: boolean;
  fraud_status: FraudStatus;
  /** True once cleared — this is what the payout ledger counts. */
  earns_payout?: boolean;
}

/**
 * Submissions — the website an attendee built. Approval here is Hack Club's
 * cost-recovery metric; it does NOT change the organizer's payout.
 */
export interface SubmissionFields {
  person: string[]; // linked People id
  meetup: string[]; // linked Meetups id
  repo_url?: string;
  live_url?: string;
  screenshot?: string;
  status: SubmissionStatus;
  reviewed_by?: string;
}

/**
 * Payouts — an organizer's food money. Advanced on cleared signups, then
 * reconciled with clawback of any excess.
 */
export interface PayoutFields {
  organizer: string[]; // linked People id
  cleared_signups?: number;
  advanced_amount?: number;
  /** $8.50 x final cleared signups. */
  final_amount?: number;
  clawback?: number;
  status: PayoutStatus;
  claimed_at?: string;
}

/**
 * MagicLinks — one-time email login tokens for ATTENDEES (our own flow, not HC
 * Auth). We store only a hash of the token; the raw token lives only in the
 * emailed link. Consumed on first use.
 */
export interface MagicLinkFields {
  email: string;
  /** SHA-256 hex of the raw token. */
  token_hash: string;
  expires_at: string;
  consumed?: boolean;
}

/** Dollars credited to an organizer per fraud-cleared signup. */
export const PAYOUT_PER_SIGNUP = 8.5;

/** Internal-only global budget soft ceiling (USD). Never shown to organizers. */
export const BUDGET_SOFT_CEILING = 10_000;
