import "server-only";

import {
  createRecord,
  selectRecords,
  updateRecord,
  type AirtableRecord,
} from "./airtable";
import type { SubmissionFields } from "./schema";

export type SubmissionRecord = AirtableRecord<SubmissionFields>;

/** A person's submission for a meetup, if any (one build per Bash). */
export async function getSubmission(
  personId: string,
  meetupId: string,
): Promise<SubmissionRecord | null> {
  const all = await selectRecords<SubmissionFields>("submissions");
  return (
    all.find(
      (s) =>
        s.fields.person?.includes(personId) &&
        s.fields.meetup?.includes(meetupId),
    ) ?? null
  );
}

/**
 * Create or update an attendee's submission for a meetup. Re-submitting before
 * review updates the existing record and resets it to pending.
 */
export async function upsertSubmission(input: {
  personId: string;
  meetupId: string;
  repoUrl?: string;
  liveUrl?: string;
  label?: string;
}): Promise<SubmissionRecord> {
  const existing = await getSubmission(input.personId, input.meetupId);
  const fields: Partial<SubmissionFields> = {
    repo_url: input.repoUrl,
    live_url: input.liveUrl,
    status: "pending",
  };

  if (existing) {
    return updateRecord<SubmissionFields>("submissions", existing.id, fields);
  }
  return createRecord<SubmissionFields>("submissions", {
    label: input.label,
    person: [input.personId],
    meetup: [input.meetupId],
    ...fields,
  });
}
