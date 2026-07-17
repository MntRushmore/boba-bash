"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getMeetup } from "@/lib/meetups";
import { rsvp } from "@/lib/signups";
import { readReferral, clearReferral } from "@/lib/referral";
import { getPersonByReferralCode } from "@/lib/people";

/** RSVP the signed-in person to a meetup. */
export async function rsvpAction(meetupId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect(`/signin?next=/meetup/${meetupId}`);

  const meetup = await getMeetup(meetupId);
  if (!meetup || meetup.fields.status !== "approved") {
    redirect("/map?error=unavailable");
  }

  // Did they arrive via an organizer's referral link?
  const refCode = await readReferral();
  let viaReferral = false;
  if (refCode) {
    const organizer = await getPersonByReferralCode(refCode);
    // Referral counts only if it points at THIS meetup's organizer.
    viaReferral = !!organizer && meetup!.fields.organizer?.includes(organizer.id);
  }

  await rsvp({
    personId: session.personId,
    meetupId,
    viaReferral,
    label: `${session.email} @ ${meetup!.fields.name}`,
  });

  if (refCode) await clearReferral();
  redirect("/dashboard?rsvp=1");
}
