import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import MeetupForm from "./MeetupForm";

export const dynamic = "force-dynamic";

export default async function NewMeetup() {
  const session = await getSession();
  if (!session) redirect("/signin");
  if (session.role !== "organizer") redirect("/dashboard");

  return (
    <main className="flex-1 mx-auto w-full max-w-2xl px-6 py-16">
      <Link
        href="/dashboard"
        className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-accent"
      >
        ← Dashboard
      </Link>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-accent">
        New Bash
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-balance">
        Put your meetup on the map
      </h1>
      <p className="mt-3 text-ink-soft">
        Pick a café, set a date, and share the referral link with your friends.
        You earn toward the food for every real signup you bring in.
      </p>

      <MeetupForm />
    </main>
  );
}
