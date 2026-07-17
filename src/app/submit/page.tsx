import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSignupsByPerson } from "@/lib/signups";
import { getMeetup } from "@/lib/meetups";
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
    <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-16">
      <Link
        href="/dashboard"
        className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-accent"
      >
        ← Dashboard
      </Link>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-accent">
        Submit your build
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-balance">
        Share the site you built
      </h1>

      {meetups.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line px-5 py-8 text-center text-ink-soft">
          You haven&apos;t RSVP&apos;d to a Bash yet. Find one on the{" "}
          <Link href="/map" className="underline">
            map
          </Link>{" "}
          first.
        </p>
      ) : (
        <SubmitForm meetups={meetups} />
      )}
    </main>
  );
}
