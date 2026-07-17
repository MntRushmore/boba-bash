import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSignupsByPerson } from "@/lib/signups";
import { getMeetup } from "@/lib/meetups";
import HdShell from "../HdShell";
import SubmitForm from "./SubmitForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const session = await getSession();
  if (!session) redirect("/signin?next=/submit");

  // Meetups the attendee has RSVP'd to — resolve names for the dropdown.
  const signups = await getSignupsByPerson(session.personId);
  const meetupIds = [
    ...new Set(signups.flatMap((s) => s.fields.meetup ?? [])),
  ];
  const meetups = (
    await Promise.all(
      meetupIds.map(async (id) => {
        const m = await getMeetup(id);
        return m ? { id: m.id, name: m.fields.name } : null;
      }),
    )
  ).filter((m): m is { id: string; name: string } => m !== null);

  return (
    <HdShell back={{ href: "/dashboard", label: "dashboard" }} width={620}>
      <div className="hd-panel sk card">
        <p className="hd-eyebrow">submit your build</p>
        <h1 className="hd-title">share the site you built</h1>

        {meetups.length === 0 ? (
          <div className="hd-empty sk thin soft" style={{ marginTop: 18 }}>
            You haven&apos;t RSVP&apos;d to a Bash yet. Find one on the{" "}
            <Link href="/map">map</Link> first.
          </div>
        ) : (
          <SubmitForm meetups={meetups} />
        )}
      </div>
    </HdShell>
  );
}
