import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeetup } from "@/lib/meetups";
import { getSession } from "@/lib/auth";
import { getSignup } from "@/lib/signups";
import RsvpButton from "./RsvpButton";

export const dynamic = "force-dynamic";

export default async function MeetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meetup = await getMeetup(id);
  if (!meetup || meetup.fields.status !== "approved" || meetup.fields.hidden) {
    notFound();
  }

  const session = await getSession();
  const existingSignup = session
    ? await getSignup(session.personId, id)
    : null;

  const f = meetup.fields;

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-16">
      <Link
        href="/map"
        className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-accent"
      >
        ← All Bashes
      </Link>

      <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-accent">
        Boba Bash
      </p>
      <h1 className="mt-1 font-display text-4xl font-semibold text-balance">
        {f.name}
      </h1>

      <dl className="mt-6 grid gap-3 text-ink-soft">
        {f.venue ? (
          <div className="flex gap-2">
            <dt className="font-mono text-xs uppercase tracking-wide">Venue</dt>
            <dd className="text-ink">{f.venue}</dd>
          </div>
        ) : null}
        {f.city ? (
          <div className="flex gap-2">
            <dt className="font-mono text-xs uppercase tracking-wide">City</dt>
            <dd className="text-ink">{f.city}</dd>
          </div>
        ) : null}
        {f.date ? (
          <div className="flex gap-2">
            <dt className="font-mono text-xs uppercase tracking-wide">Date</dt>
            <dd className="text-ink">{f.date}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-10">
        {existingSignup ? (
          <p className="rounded-xl border border-good/30 bg-good/10 px-5 py-4 text-good">
            You&apos;re signed up for this Bash. See you there! Head to your{" "}
            <Link href="/dashboard" className="underline">
              dashboard
            </Link>{" "}
            to submit your site.
          </p>
        ) : session ? (
          <RsvpButton meetupId={id} />
        ) : (
          <a
            href={`/signin?next=/meetup/${id}`}
            className="rounded-full bg-syrup px-7 py-3 font-mono text-sm font-semibold text-cream-soft transition hover:-translate-y-0.5"
          >
            Sign in to RSVP
          </a>
        )}
      </div>
    </main>
  );
}
