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
import ChalkEditor from "./ChalkEditor";
import {
  DoodleDefs,
  HackFlag,
  FilesIcon,
  GlobeIcon,
  CupIcon,
  TrophyIcon,
  GalleryIcon,
  SettingsIcon,
  ShareIcon,
  BellIcon,
  LogoutIcon,
  PlayIcon,
  SearchIcon,
  CaretDown,
  CaretRight,
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
              firstName={firstName}
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

  // Milestone checklist — the "road to free boba" for organizers.
  // Monotonic: each stage completes only once the prior one has, so a later
  // step never shows checked while an earlier one is still open.
  const done = [
    meetups.length > 0,
    stats.approvedMeetupCount > 0,
    stats.clearedSignups + stats.pendingSignups > 0,
    stats.clearedSignups >= 5,
    stats.foodBalance > 0,
    false, // host the Bash — always the finish line
  ];
  const steps = buildSteps(
    [
      "create your Bash",
      "get staff approval",
      "share your link",
      "clear 5 signups",
      "collect the food $$",
      "host the Bash",
    ],
    done,
  );

  return (
    <div className="hd-ui">
      <TopBar
        initial={initial}
        activeTab="dashboard.tsx"
        chip={{ value: money(stats.foodBalance), label: "food balance" }}
      />

      <div className="hd-bodyrow">
        <Explorer
          heading="YOUR BASHES"
          treeItems={
            meetups.length
              ? meetups.map((m, i) => ({
                  name: m.fields.name,
                  active: i === 0,
                  dim: m.fields.status !== "approved",
                }))
              : [{ name: "no bashes yet", dim: true }]
          }
          steps={steps}
          stepsHeading="ROAD TO FREE BOBA"
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
              big={
                <span className="hl">{money(stats.foodBalance)}</span>
              }
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
              <ChalkEditor link={link} firstName={firstName} />
            ) : (
              <SettingUpEditor firstName={firstName} />
            )}
            <PreviewPanel
              countries={87}
              cups={12409}
              nextDrop={primaryBash?.fields.city}
              status={stats.approvedMeetupCount > 0 ? "approved ✓" : "pending review"}
              statusOk={stats.approvedMeetupCount > 0}
            />
          </div>

          <Terminal
            lines={[
              { prompt: "boba", cmd: "bun run stats" },
              {
                text: `signups cleared: ${stats.clearedSignups} · pending: ${stats.pendingSignups}`,
                tone: "dim",
              },
              {
                text: `food balance advanced → ${money(stats.foodBalance)}`,
                tone: "ok",
              },
              stats.approvedMeetupCount > 0
                ? {
                    text: `✓ ${stats.approvedMeetupCount} bash${stats.approvedMeetupCount > 1 ? "es" : ""} approved & on the map`,
                    tone: "ok",
                  }
                : {
                    text: "⚠ waiting on staff approval — check back soon",
                    tone: "warn",
                  },
              { prompt: "boba", cmd: "", cursor: true },
            ]}
          />

          <StatusBar
            branch="main*"
            items={[
              { text: `signups: ${stats.clearedSignups} cleared`, tone: "good" },
              { text: `balance: ${money(stats.foodBalance)}` },
              {
                text: `● ${stats.approvedMeetupCount} bash live`,
                tone: "red",
                right: true,
              },
            ]}
          />
        </div>

        <UtilRail
          notifications={stats.pendingSignups}
          shareHref={link || undefined}
        />
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
  firstName,
  initial,
}: {
  personId: string;
  email: string;
  firstName: string;
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
          date: meetup.fields.date,
          detail: [meetup.fields.venue, meetup.fields.city, meetup.fields.date]
            .filter(Boolean)
            .join(" · "),
          submissionStatus: (submission?.fields.status ?? null) as SubmissionStatus | null,
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
        activeTab="my_bash.tsx"
        chip={{ value: `${cards.length}`, label: "bashes" }}
      />

      <div className="hd-bodyrow">
        <Explorer
          heading="YOUR BASHES"
          treeItems={
            cards.length
              ? cards.map((c, i) => ({
                  name: c.name,
                  active: i === 0,
                  dim: false,
                }))
              : [{ name: "no RSVPs yet", dim: true }]
          }
          steps={steps}
          stepsHeading="ROAD TO FREE BOBA"
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
            <AttendeeEditor
              firstName={firstName}
              bashName={primary?.name}
              hasSubmitted={hasSubmitted}
              isApproved={isApproved}
            />
            <PreviewPanel
              countries={87}
              cups={12409}
              nextDrop={primary?.city}
              status={
                isApproved ? "verified ✓" : hasSubmitted ? "in review" : "not submitted"
              }
              statusOk={isApproved}
            />
          </div>

          <Terminal
            lines={[
              { prompt: "my-boba-shop", cmd: "bun run build" },
              primary
                ? { text: `▸ RSVP'd to ${primary.name}`, tone: "dim" }
                : { text: "▸ no bash yet — find one on the map", tone: "dim" },
              hasSubmitted
                ? { text: "✓ site submitted → review queue", tone: "ok" }
                : { text: "⚠ no site submitted yet — build & ship it!", tone: "warn" },
              isApproved
                ? { text: "✓ verified! claim your cup", tone: "ok" }
                : { text: "info: verification unlocks your free boba", tone: "info" },
              { prompt: "my-boba-shop", cmd: "", cursor: true },
            ]}
          />

          <StatusBar
            branch="main*"
            items={[
              { text: `signed in as ${email}` },
              {
                text: isApproved
                  ? "verified ✓"
                  : hasSubmitted
                    ? "in review"
                    : "not submitted",
                tone: isApproved ? "good" : undefined,
              },
              { text: "● live map: 87 bashes", tone: "red", right: true },
            ]}
          />
        </div>

        <UtilRail notifications={hasSubmitted && !isApproved ? 1 : 0} />
      </div>

      <Stickies
        notes={[
          { tone: "teal", text: "don't forget:\nSUBMIT by\nSUNDAY!!", rotate: 3.4 },
          { tone: "milk", text: "boba o'clock\n= 3pm sharp", rotate: -3 },
          { tone: "lav", text: hasSubmitted ? "nice work!\nsit tight :)" : "build your\nsite!!", rotate: -2.6 },
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
  activeTab,
  chip,
}: {
  initial: string;
  activeTab: string;
  chip: { value: string; label: string };
}) {
  return (
    <div className="hd-topbar">
      <div className="hd-lights" aria-hidden>
        {["#c9402f", "#c9992f", "#3d9e4d"].map((c) => (
          <svg key={c} className="doodle hd-light" viewBox="0 0 15 15">
            <circle cx="7.5" cy="7.5" r="6" style={{ stroke: c }} />
            <path d="M4 8c1-2 3-3 5-3" style={{ stroke: c, strokeWidth: 1.4 }} />
          </svg>
        ))}
      </div>

      <div className="hd-brand">
        <HackFlag size={48} />
        <h1>
          BOBA <span>BASH</span>
        </h1>
      </div>

      <nav className="hd-tabs" aria-label="Sections">
        <span className="hd-tab active sk">{activeTab}</span>
        <Link href="/map" className="hd-tab sk thin soft r2">
          worldmap.tsx
        </Link>
        <Link href="/submit" className="hd-tab sk thin soft">
          submit.md
        </Link>
      </nav>

      <div className="hd-topright">
        <span className="hd-chip sk thin r2">
          <SearchIcon />
          <b>{chip.value}</b>
          <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>
            {chip.label}
          </span>
        </span>
        <span className="hd-avatar tilt-r">{initial}</span>
      </div>
    </div>
  );
}

type TreeItem = { name: string; active?: boolean; dim?: boolean };
type Step = { label: string; done?: boolean; now?: boolean; locked?: boolean };

function Explorer({
  heading,
  treeItems,
  steps,
  stepsHeading,
}: {
  heading: string;
  treeItems: TreeItem[];
  steps: Step[];
  stepsHeading: string;
}) {
  return (
    <aside className="hd-explorer sk card tilt-s">
      <div className="hd-xp-h">EXPLORER</div>
      <Scribble width={90} />

      <div className="hd-tree">
        <div className="tree-row">
          <CaretDown />
          <b>{heading.toLowerCase().replace(/ /g, "-")}</b>
        </div>
        {treeItems.map((it, i) => (
          <div
            key={i}
            className={`tree-row ind1 ${it.dim && !it.active ? "dim" : ""}`}
          >
            {it.active ? (
              <span className="active-file" title={it.name}>
                {truncate(it.name, 20)}
              </span>
            ) : (
              <span title={it.name}>{truncate(it.name, 22)}</span>
            )}
          </div>
        ))}
        <div className="tree-row ind1 dim">
          <CaretRight />
          flavors/
        </div>
        <div className="tree-row ind1 dim">README.md</div>
      </div>

      <div className="hd-sect">
        <div className="hd-xp-h">{stepsHeading}</div>
        <Scribble width={140} />
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
      <div className="hd-panel-h">
        boba radar · worldwide
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span className="hd-pv-btn run sk thin">
            <svg className="doodle" width="13" height="13" viewBox="0 0 14 14" aria-hidden>
              <path d="M4 2 L12 7 L4 12 Z" style={{ stroke: "#1d5a28" }} />
            </svg>
          </span>
          <span className="hd-pv-btn sk thin soft r2">
            <svg className="doodle" width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <path d="M13 8 A5.2 5.2 0 1 1 9.5 3.1 M9.5 3.1 L9.5 0.8 M9.5 3.1 L11.8 3.6" />
            </svg>
          </span>
        </span>
      </div>
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

type TermLine =
  | { prompt: string; cmd: string; cursor?: boolean }
  | { text: string; tone?: "ok" | "warn" | "info" | "dim" };

function Terminal({ lines }: { lines: TermLine[] }) {
  return (
    <div className="hd-terminal sk dark" style={{ minHeight: 176 }}>
      <div className="hd-term-tabs">
        <span className="on">TERMINAL</span>
        <span>OUTPUT</span>
        <span>LIVE MAP</span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-pangolin)",
            fontSize: 12,
            color: "var(--chalk-dim)",
          }}
        >
          bash · boba
        </span>
      </div>
      <div className="hd-term-body">
        {lines.map((l, i) => (
          <div key={i}>
            {"prompt" in l ? (
              <>
                <span className="p">➜ {l.prompt}</span> <span className="dim">$</span>{" "}
                {l.cmd}
                {l.cursor ? <span className="hd-cursor" /> : null}
              </>
            ) : (
              <span className={l.tone ?? ""}>{l.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBar({
  branch,
  items,
}: {
  branch: string;
  items: { text: string; tone?: "good" | "red"; right?: boolean }[];
}) {
  return (
    <div className="hd-statusbar">
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg className="doodle" width="13" height="14" viewBox="0 0 14 15" aria-hidden>
          <circle cx="4" cy="3.5" r="2.2" />
          <circle cx="4" cy="11.5" r="2.2" />
          <circle cx="11" cy="5.5" r="2.2" />
          <path d="M4 5.7 L4 9.3 M10 7.5 C8.5 9.5 6.5 10 5.8 10.4" />
        </svg>
        <b className="marker" style={{ fontSize: 12.5 }}>
          {branch}
        </b>
      </span>
      {items.map((it, i) => (
        <span
          key={i}
          style={{
            marginLeft: it.right ? "auto" : undefined,
            color:
              it.tone === "good"
                ? "var(--green)"
                : it.tone === "red"
                  ? "var(--red)"
                  : undefined,
          }}
        >
          {it.text}
        </span>
      ))}
    </div>
  );
}

function UtilRail({
  notifications = 0,
  shareHref,
}: {
  notifications?: number;
  shareHref?: string;
}) {
  return (
    <aside className="hd-utilrail" aria-label="Tools">
      <Link href="/map" className="hd-util-btn play" title="live map">
        <PlayIcon size={24} title="live map" />
      </Link>
      <Link href="/submit" className="hd-util-btn" title="submit site">
        <GalleryIcon size={24} title="submit site" />
      </Link>
      <span className="hd-util-btn" title="notifications">
        <BellIcon size={24} title="notifications" />
        {notifications > 0 ? <span className="hd-badge">{notifications}</span> : null}
      </span>
      {shareHref ? (
        <a
          className="hd-util-btn"
          href={`https://slack.com/share?url=${encodeURIComponent(shareHref)}`}
          target="_blank"
          rel="noreferrer"
          title="share"
        >
          <ShareIcon size={24} title="share" />
        </a>
      ) : (
        <span className="hd-util-btn" title="files">
          <FilesIcon size={24} title="files" />
        </span>
      )}
      <span className="hd-util-btn" title="settings">
        <SettingsIcon size={24} title="settings" />
      </span>
      <div style={{ flex: 1 }} />
      <a href="/signout" className="hd-util-btn" title="sign out">
        <LogoutIcon size={24} title="sign out" />
      </a>
    </aside>
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

function SettingUpEditor({ firstName }: { firstName: string }) {
  return (
    <div className="hd-editor sk dark tilt-s">
      <div className="hd-panel-h" style={{ color: "var(--c-blue)" }}>
        referral_link.js
      </div>
      <div className="hd-term-body" style={{ minHeight: 200 }}>
        <div>
          <span className="p">➜ boba</span> <span className="dim">$</span> setup
          referral
        </div>
        <div className="info">⚡ minting your link, {firstName || "friend"}…</div>
        <div className="dim">▸ refresh in a moment to grab it</div>
      </div>
    </div>
  );
}

function AttendeeEditor({
  firstName,
  bashName,
  hasSubmitted,
  isApproved,
}: {
  firstName: string;
  bashName?: string;
  hasSubmitted: boolean;
  isApproved: boolean;
}) {
  return (
    <div className="hd-editor sk dark tilt-s">
      <div className="hd-panel-h">
        <svg className="doodle" width="15" height="15" viewBox="0 0 16 16" aria-hidden>
          <path d="M5 3 L11 8 L5 13" style={{ stroke: "var(--c-blue)" }} />
        </svg>
        boba_shop.html
        <span
          style={{
            marginLeft: "auto",
            color: "var(--chalk-dim)",
            fontFamily: "var(--font-pangolin)",
            fontSize: 12,
          }}
        >
          {isApproved ? "verified ✓" : hasSubmitted ? "in review" : "draft"}
        </span>
      </div>
      <div className="hd-code">
        <div className="hd-lns">{"1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11"}</div>
        <div className="hd-codelines">
          <span className="cm">{`// boba_shop.html — one site, one cup, worldwide`}</span>
          {"\n"}
          <span className="kw">const</span> builder ={" "}
          <span className="str">&quot;{firstName || "you"}&quot;</span>;{"\n"}
          <span className="kw">const</span> bash ={" "}
          <span className="str">&quot;{bashName || "find one on the map"}&quot;</span>;
          {"\n\n"}
          <span className="kw">function</span> <span className="fn">ship</span>() {"{"}
          {"\n"}
          <span className={hasSubmitted ? "hl-line" : ""}>
            {"  "}
            <span className="kw">return</span>{" "}
            {hasSubmitted ? (
              <span className="ok">SUBMITTED</span>
            ) : (
              <span className="op">TODO</span>
            )}
            ; <span className="cm">{hasSubmitted ? "// nice!" : "// build me!"}</span>
          </span>
          {"\n"}
          {"}"}
          {"\n\n"}
          <span className="fn">ship</span>(); <span className="cm">{`// then claim your free boba`}</span>
        </div>
      </div>
      <div style={{ padding: "8px 16px 12px" }}>
        <Link
          href="/submit"
          className="marker"
          style={{
            display: "inline-block",
            background: isApproved ? "var(--c-green)" : "rgba(255,255,255,.08)",
            color: isApproved ? "#1d5a28" : "var(--chalk)",
            border: "1.6px solid rgba(233,231,222,.35)",
            borderRadius: "8px 14px 10px 12px",
            padding: "6px 16px",
            fontSize: 13.5,
            textDecoration: "none",
          }}
        >
          {isApproved ? "verified ✓" : hasSubmitted ? "view submission ▸" : "submit your site ▸"}
        </Link>
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/**
 * Turn a list of labels + per-step completion flags into monotonic milestone
 * steps: everything up to the first incomplete stage is "done", that stage is
 * "now", and everything after it is "locked". This keeps the checklist honest —
 * no checked box ever sits below an unchecked one.
 */
function buildSteps(labels: string[], done: boolean[]): Step[] {
  const firstOpen = done.findIndex((d) => !d);
  return labels.map((label, i) => {
    if (firstOpen === -1 || i < firstOpen) return { label, done: true };
    if (i === firstOpen) return { label, now: true };
    return { label, locked: true };
  });
}
