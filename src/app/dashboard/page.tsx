import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getPersonByEmail, applyReferral } from "@/lib/people";
import { readReferral, clearReferral } from "@/lib/referral";
import { getMeetupsByOrganizer } from "@/lib/meetups";
import { getOrganizerStats } from "@/lib/stats";
import { PAYOUT_PER_SIGNUP } from "@/lib/schema";
import ReferralLink from "./ReferralLink";

export const dynamic = "force-dynamic";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; welcome?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/signin");
  const { created } = await searchParams;

  const isOrganizer = session.role === "organizer";
  const person = await getPersonByEmail(session.email);

  // Apply a pending referral once, on an attendee's first authenticated load.
  if (!isOrganizer && person) {
    const refCode = await readReferral();
    if (refCode) {
      await applyReferral(person, refCode);
      await clearReferral();
    }
  }

  return (
    <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-16">
      <header className="flex items-center justify-between gap-4">
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
      </header>

      {created ? (
        <p className="mt-6 rounded-lg bg-good/10 px-4 py-3 text-sm text-good">
          Your Bash was created and sent to Hack Club staff for approval. Share
          your link below to start bringing people in.
        </p>
      ) : null}

      {isOrganizer ? (
        <OrganizerView
          organizerId={session.personId}
          referralCode={person?.fields.referral_code}
        />
      ) : (
        <AttendeeView email={session.email} />
      )}
    </main>
  );
}

async function OrganizerView({
  organizerId,
  referralCode,
}: {
  organizerId: string;
  referralCode?: string;
}) {
  const [meetups, stats] = await Promise.all([
    getMeetupsByOrganizer(organizerId),
    getOrganizerStats(organizerId),
  ]);

  const origin = process.env.APP_ORIGIN || "https://bash.hackclub.com";
  const link = referralCode ? `${origin}/j/${referralCode}` : null;

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* Referral link */}
      <section className="rounded-xl border border-line bg-paper-2 p-6">
        <h2 className="font-display text-xl font-semibold">Your referral link</h2>
        <p className="mt-1 text-sm text-ink-soft">
          You earn {money(PAYOUT_PER_SIGNUP)} toward food for every real signup
          who joins through this link.
        </p>
        <div className="mt-4">
          {link ? (
            <ReferralLink link={link} />
          ) : (
            <p className="text-sm text-ink-soft">
              Your link is being set up — refresh in a moment.
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Food balance" value={money(stats.foodBalance)} accent />
        <Stat
          label="Cleared signups"
          value={String(stats.clearedSignups)}
          sub={
            stats.pendingSignups
              ? `${stats.pendingSignups} awaiting review`
              : undefined
          }
        />
        <Stat
          label="Sites submitted"
          value={
            stats.clearedSignups
              ? `${stats.approvedSubmissions} / ${stats.clearedSignups}`
              : String(stats.approvedSubmissions)
          }
          sub="approved builds (goal)"
        />
      </section>

      {/* Meetups */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your Bashes</h2>
          <Link
            href="/meetup/new"
            className="rounded-full bg-syrup px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-cream-soft transition hover:-translate-y-0.5"
          >
            + New Bash
          </Link>
        </div>

        {meetups.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line px-5 py-8 text-center text-ink-soft">
            No Bashes yet. Create one to get it on the map.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {meetups.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-line bg-card px-5 py-4"
              >
                <div>
                  <p className="font-semibold">{m.fields.name}</p>
                  <p className="text-sm text-ink-soft">
                    {[m.fields.venue, m.fields.city, m.fields.date]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <StatusPill status={m.fields.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AttendeeView({ email }: { email: string }) {
  return (
    <div className="mt-8 rounded-xl border border-line bg-paper-2 p-6">
      <p className="text-ink-soft">
        You&apos;re signed in as{" "}
        <span className="font-mono text-sm text-ink">{email}</span>. Finding a
        Bash on the map, RSVP, and submitting your site land in the next build
        phase.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-3xl font-semibold tabular-nums ${
          accent ? "text-accent" : "text-ink"
        }`}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-ink-soft">{sub}</p> : null}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-good/12 text-good",
    pending: "bg-warn/15 text-warn",
    rejected: "bg-bad/12 text-bad",
    cancelled: "bg-ink-soft/12 text-ink-soft",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide ${
        styles[status] ?? "bg-ink-soft/12 text-ink-soft"
      }`}
    >
      {status}
    </span>
  );
}
