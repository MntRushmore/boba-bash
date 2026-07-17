import "server-only";

import {
  createRecord,
  selectRecords,
  updateRecord,
  type AirtableRecord,
} from "./airtable";
import type { MeetupFields } from "./schema";

export type MeetupRecord = AirtableRecord<MeetupFields>;

/**
 * All meetups owned by an organizer. Airtable can't formula-filter a link field
 * by record ID (ARRAYJOIN renders the linked record's display value, not its
 * id), so we fetch and match on the `organizer` id array in code.
 */
export async function getMeetupsByOrganizer(
  organizerId: string,
): Promise<MeetupRecord[]> {
  const records = await selectRecords<MeetupFields>("meetups");
  return records.filter((m) => m.fields.organizer?.includes(organizerId));
}

/** Create a meetup owned by an organizer; starts pending staff approval. */
export async function createMeetup(input: {
  organizerId: string;
  name: string;
  venue?: string;
  city?: string;
  geocode?: string;
  date?: string;
  slackChannel?: string;
  capacity?: number;
}): Promise<MeetupRecord> {
  return createRecord<MeetupFields>("meetups", {
    name: input.name,
    organizer: [input.organizerId],
    venue: input.venue,
    city: input.city,
    geocode: input.geocode,
    date: input.date,
    slack_channel: input.slackChannel,
    capacity: input.capacity,
    status: "pending",
    hidden: false,
  });
}

export async function updateMeetup(
  id: string,
  fields: Partial<MeetupFields>,
): Promise<MeetupRecord> {
  return updateRecord<MeetupFields>("meetups", id, fields);
}
