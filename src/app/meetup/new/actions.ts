"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createMeetup } from "@/lib/meetups";

export interface MeetupFormState {
  error?: string;
}

/** Create a meetup for the signed-in organizer. Server action for the form. */
export async function createMeetupAction(
  _prev: MeetupFormState,
  formData: FormData,
): Promise<MeetupFormState> {
  const session = await getSession();
  if (!session) redirect("/signin");
  if (session.role !== "organizer") {
    return { error: "Only organizers can create a Bash." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const slackChannel = String(formData.get("slack_channel") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();

  if (!name) return { error: "Give your Bash a name." };
  if (!city) return { error: "Where is it? Add a city." };

  const capacity = capacityRaw ? Number(capacityRaw) : undefined;
  if (capacity !== undefined && (!Number.isFinite(capacity) || capacity < 0)) {
    return { error: "Capacity should be a positive number." };
  }

  try {
    await createMeetup({
      organizerId: session.personId,
      name,
      city,
      venue: venue || undefined,
      date: date || undefined,
      slackChannel: slackChannel || undefined,
      capacity,
    });
  } catch (e) {
    console.error("createMeetup failed:", e);
    return { error: "Couldn't create your Bash. Please try again." };
  }

  redirect("/dashboard?created=1");
}
