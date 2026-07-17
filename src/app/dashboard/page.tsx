import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getPersonByEmail, applyReferral } from "@/lib/people";
import { readReferral, clearReferral } from "@/lib/referral";
import { getMeetupsByOrganizer, getMeetup } from "@/lib/meetups";
import { getOrganizerStats } from "@/lib/stats";
import { getSignupsByPerson } from "@/lib/signups";
import { getSubmission } from "@/lib/submissions";
import { PAYOUT_PER_SIGNUP } from "@/lib/schema";
import type { SubmissionStatus } from "@/lib/schema";
import ReferralCard from "./ReferralCard";
import {
  DoodleDefs,
  HackFlag,
  GlobeIcon,
  TrophyIcon,
  CheckBox,
  LockIcon,
  PeopleIcon,
  CupStat,
  ScribbleGlobe,
} from "./doodles";

export const dynamic = "force-dynamic";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
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

  const firstName = session.name ? session.name.split(" ")[0] : "";
  const initial = (firstName || session.email)[0]?.toUpperCase() ?? "?";

  return (
    <div className="hd hd-stage">
      <DoodleDefs />
      <div className="hd-frame">
        <div className="hd-board">
          {isOrganizer ? (
            <OrganizerBoard
              organizerId={session.personId}
              referralCode={person?.fields.referral_code}
              firstName={firstName}
              initial={initial}
              justCreated={created === "1" || created === "true"}
            />
          ) : (
            <AttendeeBoard
              personId={session.personId}
              email={session.email}
              initial={initial}
            />
          )}

          {/* paper grain over everything */}
          <svg className="hd-grain" width="100%" height="100%" aria-hidden>
            <rect width="100%" height="100%" filter="url(#paper)" />
          </svg>
        </div>
      </div>
      <div className="hd-tray" />
    </div>
  );
}

/* ============================================================
   ORGANIZER
   ============================================================ */

async function OrganizerBoard({
  organizerId,
  referralCode,
  firstName,
  initial,
  justCreated,
}: {
  organizerId: string;
  referralCode?: string;
  firstName: string;
  initial: string;
  justCreated: boolean;
}) {
  const [meetups, stats] = await Promise.all([
    getMeetupsByOrganizer(organizerId),
    getOrganizerStats(organizerId),
  ]);

  const origin = process.env.APP_ORIGIN || "https://bash.hackclub.com";
  const link = referralCode ? `${origin}/j/${referralCode}` : "";
  const primaryBash = meetups[0];

  // Monotonic milestone checklist — the "road to free boba" for organizers.
  const steps = buildSteps(
    [
      "create your Bash",
      "get staff approval",
      "share your link",
      "clear 5 signups",
      "collect the food $$",
      "host the Bash",
    ],
    [
      meetups.length > 0,
      stats.approvedMeetupCount > 0,
      stats.clearedSignups + stats.pendingSignups > 0,
      stats.clearedSignups >= 5,
      stats.foodBalance > 0,
      false,
    ],
  );

  return (
    <div className="hd-ui">
      <TopBar
        initial={initial}
        chip={{ value: money(stats.foodBalance), label: "food balance" }}
        primaryAction={{ href: "/meetup/new", label: "new Bash" }}
      />

      <div className="hd-bodyrow">
        <Milestones
          heading="YOUR BASHES"
          items={
            meetups.length
              ? meetups.map((m, i) => ({
                  name: m.fields.name,
                  active: i === 0,
                  dim: m.fields.status !== "approved",
                }))
              : [{ name: "no Bashes yet", dim: true }]
          }
          steps={steps}
        />

        <div className="hd-mainarea">
          <div className="hd-statsrow">
            <StatCard
              tilt="tilt-l"
              icon={<PeopleIcon size={34} />}
              label="cleared signups"
              big={`${stats.clearedSignups}`}
              sub={
                stats.pendingSignups
                  ? `${stats.pendingSignups} awaiting review`
                  : "all reviewed ✓"
              }
              subUp={stats.pendingSignups === 0 && stats.clearedSignups > 0}
            />
            <StatCard
              round
              icon={<CupStat size={34} />}
              label="food balance"
              big={<span className="hl">{money(stats.foodBalance)}</span>}
              sub={`${money(PAYOUT_PER_SIGNUP)} per cleared signup`}
            />
            <StatCard
              tilt="tilt-r"
              icon={<TrophyIcon size={34} />}
              label="sites submitted"
              big={
                stats.clearedSignups
                  ? `${stats.approvedSubmissions} / ${stats.clearedSignups}`
                  : `${stats.approvedSubmissions}`
              }
              sub="approved builds (goal)"
            />
          </div>

          <div className="hd-workrow">
            {link ? (
              <ReferralCard link={link} firstName={firstName} />
            ) : (
              <SettingUpCard firstName={firstName} />
            )}
            <PreviewPanel
              countries={87}
              cups={12409}
              nextDrop={primaryBash?.fields.city}
              status={
                stats.approvedMeetupCount > 0 ? "approved ✓" : "pending review"
              }
              statusOk={stats.approvedMeetupCount > 0}
            />
          </div>
        </div>
      </div>

      <Stickies
        notes={[
          justCreated
            ? { tone: "teal", text: "sent to staff\nfor approval!", rotate: 3.4 }
            : { tone: "teal", text: "share your\nLINK today!!", rotate: 3.4 },
          { tone: "milk", text: "boba o'clock\n= 3pm sharp", rotate: -3 },
          { tone: "lav", text: "invite your\nwhole class!", rotate: -2.6 },
        ]}
      />
    </div>
  );
}

/* ============================================================
   ATTENDEE
   ============================================================ */

async function AttendeeBoard({
  personId,
  email,
  initial,
}: {
  personId: string;
  email: string;
  initial: string;
}) {
  const signups = await getSignupsByPerson(personId);

  const cards = (
    await Promise.all(
      signups.map(async (s) => {
        const meetupId = s.fields.meetup?.[0];
        if (!meetupId) return null;
        const [meetup, submission] = await Promise.all([
          getMeetup(meetupId),
          getSubmission(personId, meetupId),
        ]);
        if (!meetup) return null;
        return {
          meetupId,
          name: meetup.fields.name,
          city: meetup.fields.city,
          detail: [meetup.fields.venue, meetup.fields.city, meetup.fields.date]
            .filter(Boolean)
            .join(" · "),
          submissionStatus: (submission?.fields.status ??
            null) as SubmissionStatus | null,
        };
      }),
    )
  ).filter((c) => c !== null);

  const primary = cards[0];
  const hasSubmitted = cards.some((c) => c.submissionStatus);
  const isApproved = cards.some((c) => c.submissionStatus === "approved");

  const steps = buildSteps(
    [
      "RSVP to your bash",
      "build your site",
      "submit for review",
      "get verified",
      "claim your cup",
      "sip, worldwide",
    ],
    [cards.length > 0, hasSubmitted, hasSubmitted, isApproved, false, false],
  );

  return (
    <div className="hd-ui">
      <TopBar
        initial={initial}
        chip={{ value: `${cards.length}`, label: "bashes" }}
        primaryAction={{ href: "/map", label: "find a Bash" }}
      />

      <div className="hd-bodyrow">
        <Milestones
          heading="YOUR BASHES"
          items={
            cards.length
              ? cards.map((c, i) => ({ name: c.name, active: i === 0 }))
              : [{ name: "no RSVPs yet", dim: true }]
          }
          steps={steps}
        />

        <div className="hd-mainarea">
          <div className="hd-statsrow">
            <StatCard
              tilt="tilt-l"
              icon={<PeopleIcon size={34} />}
              label="your rsvps"
              big={`${cards.length} bash${cards.length === 1 ? "" : "es"}`}
              sub={cards.length ? "you're on the list ✓" : "find one on the map"}
              subUp={cards.length > 0}
            />
            <StatCard
              round
              icon={<CupStat size={34} />}
              label="your bash"
              big={
                primary ? (
                  <span className="hl">{primary.name}</span>
                ) : (
                  "— none yet —"
                )
              }
              sub={primary?.detail || "RSVP to get started"}
            />
            <StatCard
              tilt="tilt-r"
              icon={<GlobeIcon size={34} />}
              label="worldwide"
              big="87 countries"
              sub="↑ 12,409 cups poured"
              subUp
            />
          </div>

          <div className="hd-workrow">
            <SubmissionCard
              bashName={primary?.name}
              hasSubmitted={hasSubmitted}
              isApproved={isApproved}
              email={email}
            />
            <PreviewPanel
              countries={87}
              cups={12409}
              nextDrop={primary?.city}
              status={
                isApproved
                  ? "verified ✓"
                  : hasSubmitted
                    ? "in review"
                    : "not submitted"
              }
              statusOk={isApproved}
            />
          </div>
        </div>
      </div>

      <Stickies
        notes={[
          { tone: "teal", text: "don't forget:\nSUBMIT by\nSUNDAY!!", rotate: 3.4 },
          { tone: "milk", text: "boba o'clock\n= 3pm sharp", rotate: -3 },
          {
            tone: "lav",
            text: hasSubmitted ? "nice work!\nsit tight :)" : "build your\nsite!!",
            rotate: -2.6,
          },
        ]}
      />
    </div>
  );
}

/* ============================================================
   SHARED UI PIECES
   ============================================================ */

function TopBar({
  initial,
  chip,
  primaryAction,
}: {
  initial: string;
  chip: { value: string; label: string };
  primaryAction: { href: string; label: string };
}) {
  return (
    <div className="hd-topbar">
      <div className="hd-brand">
        <HackFlag size={48} />
        <h1>
          BOBA <span>BASH</span>
        </h1>
      </div>

      <nav className="hd-nav" aria-label="Sections">
        <Link href="/map" className="hd-navlink sk thin soft">
          map
        </Link>
        <Link href="/submit" className="hd-navlink sk thin soft r2">
          submit
        </Link>
      </nav>

      <div className="hd-topright">
        <span className="hd-chip sk thin r2">
          <b>{chip.value}</b>
          <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>
            {chip.label}
          </span>
        </span>
        <Link href={primaryAction.href} className="hd-cta sk marker">
          {primaryAction.label} ▸
        </Link>
        <a href="/signout" className="hd-avatar tilt-r" title="account / sign out">
          {initial}
        </a>
      </div>
    </div>
  );
}

type MilestoneItem = { name: string; active?: boolean; dim?: boolean };
type Step = { label: string; done?: boolean; now?: boolean; locked?: boolean };

function Milestones({
  heading,
  items,
  steps,
}: {
  heading: string;
  items: MilestoneItem[];
  steps: Step[];
}) {
  return (
    <aside className="hd-explorer sk card tilt-s">
      <div className="hd-xp-h">{heading}</div>
      <Scribble width={110} />
      <div className="hd-bashlist">
        {items.map((it, i) => (
          <div key={i} className={`bash-row ${it.dim && !it.active ? "dim" : ""}`}>
            <CupStat size={17} />
            {it.active ? (
              <span className="active-file" title={it.name}>
                {truncate(it.name, 18)}
              </span>
            ) : (
              <span title={it.name}>{truncate(it.name, 20)}</span>
            )}
          </div>
        ))}
      </div>

      <div className="hd-sect">
        <div className="hd-xp-h">ROAD TO FREE BOBA</div>
        <Scribble width={150} />
        <div className="hd-weeks">
          {steps.map((s, i) => (
            <div key={i} className="week-row">
              <CheckBox checked={s.done} />
              <span
                className={
                  s.done ? "done" : s.now ? "now" : s.locked ? "locked" : undefined
                }
              >
                {s.label}
              </span>
              {s.locked ? <LockIcon /> : null}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function StatCard({
  icon,
  label,
  big,
  sub,
  subUp,
  tilt,
  round,
}: {
  icon: React.ReactNode;
  label: string;
  big: React.ReactNode;
  sub?: string;
  subUp?: boolean;
  tilt?: string;
  round?: boolean;
}) {
  return (
    <div className={`hd-stat sk card ${round ? "r2" : ""} ${tilt ?? ""}`}>
      <span className="ic">{icon}</span>
      <div>
        <div className="lbl">{label}</div>
        <div className="big">{big}</div>
        {sub ? <div className={`stat-sub ${subUp ? "up" : ""}`}>{sub}</div> : null}
      </div>
    </div>
  );
}

function PreviewPanel({
  countries,
  cups,
  nextDrop,
  status,
  statusOk,
}: {
  countries: number;
  cups: number;
  nextDrop?: string;
  status: string;
  statusOk?: boolean;
}) {
  return (
    <div className="hd-preview sk card r2">
      <div className="hd-panel-h light">boba radar · worldwide</div>
      <div className="hd-pv-body">
        <ScribbleGlobe nextDrop={nextDrop} />
      </div>
      <div className="hd-readouts">
        <span className="hd-chiplet sk thin soft">
          <b>{countries}</b> countries
        </span>
        <span className="hd-chiplet sk thin soft r2">
          <b>{cups.toLocaleString()}</b> cups
        </span>
        <span
          className="hd-chiplet sk thin soft r2"
          style={{ color: statusOk ? "var(--green)" : "var(--ink-soft)" }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function SubmissionCard({
  bashName,
  hasSubmitted,
  isApproved,
  email,
}: {
  bashName?: string;
  hasSubmitted: boolean;
  isApproved: boolean;
  email: string;
}) {
  const state = isApproved
    ? { label: "verified ✓", tone: "good", note: "your cup is on the way — sip worldwide!" }
    : hasSubmitted
      ? { label: "in review", tone: "warn", note: "we're checking your build. hang tight!" }
      : { label: "not submitted", tone: "soft", note: "build your site, then ship it here." };

  return (
    <div className="hd-cardpanel sk card tilt-s">
      <div className="hd-panel-h light">
        your build
        <span className={`hd-statustag ${state.tone}`}>{state.label}</span>
      </div>
      <div className="hd-cardbody">
        <div className="hd-cardbash">
          {bashName ? (
            <span className="hl">{bashName}</span>
          ) : (
            "find a Bash on the map"
          )}
        </div>
        <p className="hd-cardnote">{state.note}</p>
        <Link href="/submit" className="hd-bigbtn sk marker">
          {isApproved
            ? "view submission ▸"
            : hasSubmitted
              ? "update your site ▸"
              : "submit your site ▸"}
        </Link>
        <p className="hd-signedin">
          signed in as <span>{email}</span>
        </p>
      </div>
    </div>
  );
}

function SettingUpCard({ firstName }: { firstName: string }) {
  return (
    <div className="hd-cardpanel sk card tilt-s">
      <div className="hd-panel-h light">your referral link</div>
      <div className="hd-cardbody">
        <p className="hd-cardnote">
          brewing your link, {firstName || "friend"}… refresh in a moment to grab
          it.
        </p>
      </div>
    </div>
  );
}

function Stickies({
  notes,
}: {
  notes: { tone: "teal" | "milk" | "lav"; text: string; rotate: number }[];
}) {
  return (
    <div className="hd-stickies" aria-hidden>
      {notes.map((n, i) => (
        <div
          key={i}
          className={`hd-sticky ${n.tone}`}
          style={{ transform: `rotate(${n.rotate}deg)`, whiteSpace: "pre-line" }}
        >
          <div className="hd-tape" />
          {n.text}
        </div>
      ))}
    </div>
  );
}

/* small helpers */

function Scribble({ width }: { width: number }) {
  return (
    <svg
      className="doodle hd-underscribble"
      width={width}
      height="7"
      viewBox={`0 0 ${width} 7`}
      aria-hidden
    >
      <path
        d={`M2 4 C${width * 0.25} 1 ${width * 0.5} 6 ${width - 2} 3`}
        style={{ strokeWidth: 2.4 }}
      />
    </svg>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/**
 * Turn a list of labels + per-step completion flags into monotonic milestone
 * steps: everything up to the first incomplete stage is "done", that stage is
 * "now", and everything after it is "locked" — no checked box ever sits below
 * an unchecked one.
 */
function buildSteps(labels: string[], done: boolean[]): Step[] {
  const firstOpen = done.findIndex((d) => !d);
  return labels.map((label, i) => {
    if (firstOpen === -1 || i < firstOpen) return { label, done: true };
    if (i === firstOpen) return { label, now: true };
    return { label, locked: true };
  });
}
