"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSignupsByPerson } from "@/lib/signups";
import { getMeetup } from "@/lib/meetups";
import { upsertSubmission } from "@/lib/submissions";

export interface SubmitState {
  error?: string;
}

const URL_RE = /^https?:\/\/.+/i;

export async function submitSiteAction(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const session = await getSession();
  if (!session) redirect("/signin?next=/submit");

  const meetupId = String(formData.get("meetup_id") ?? "").trim();
  const repoUrl = String(formData.get("repo_url") ?? "").trim();
  const liveUrl = String(formData.get("live_url") ?? "").trim();

  if (!meetupId) return { error: "Pick which Bash you're submitting for." };
  if (!repoUrl && !liveUrl) {
    return { error: "Add a repo link or a live site link (or both)." };
  }
  if (repoUrl && !URL_RE.test(repoUrl)) {
    return { error: "The repo link should start with http(s)://." };
  }
  if (liveUrl && !URL_RE.test(liveUrl)) {
    return { error: "The live link should start with http(s)://." };
  }

  // Must have RSVP'd to that meetup.
  const signups = await getSignupsByPerson(session.personId);
  const rsvped = signups.some((s) => s.fields.meetup?.includes(meetupId));
  if (!rsvped) return { error: "RSVP to that Bash before submitting." };

  const meetup = await getMeetup(meetupId);

  try {
    await upsertSubmission({
      personId: session.personId,
      meetupId,
      repoUrl: repoUrl || undefined,
      liveUrl: liveUrl || undefined,
      label: `${session.email} @ ${meetup?.fields.name ?? meetupId}`,
    });
  } catch (e) {
    console.error("submit failed:", e);
    return { error: "Couldn't save your submission. Please try again." };
  }

  redirect("/dashboard?submitted=1");
}
