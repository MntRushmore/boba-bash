import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { getPersonBySlackId, applyReferral } from "@/lib/people";
import { readReferral, clearReferral } from "@/lib/referral";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/signin");

  // Apply a pending referral once, on first authenticated load.
  const person = await getPersonBySlackId(session.slackId);
  const refCode = await readReferral();
  if (person && refCode) {
    await applyReferral(person, refCode);
    await clearReferral();
  }

  const isOrganizer = session.role === "organizer";

  return (
    <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            {isOrganizer ? "Organizer" : "Attendee"} dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-balance">
            Hey{session.name ? `, ${session.name.split(" ")[0]}` : ""} 🧋
          </h1>
        </div>
        <a
          href="/signout"
          className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-accent"
        >
          Sign out
        </a>
      </div>

      <div className="mt-10 rounded-xl border border-line bg-paper-2 p-6">
        <p className="text-ink-soft">
          You&apos;re signed in as{" "}
          <span className="font-mono text-sm text-ink">{session.email}</span>.
          {isOrganizer
            ? " Your organizer tools — meetup setup, referral link, guides, and food balance — land in the next build phase."
            : " Finding a Bash, RSVP, and submitting your site land in the next build phase."}
        </p>
      </div>
    </main>
  );
}
