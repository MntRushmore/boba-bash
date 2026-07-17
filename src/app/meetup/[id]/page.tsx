import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeetup } from "@/lib/meetups";
import { getSession } from "@/lib/auth";
import { getSignup } from "@/lib/signups";
import HdShell from "../../HdShell";
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
    <HdShell back={{ href: "/map", label: "all Bashes" }} width={620}>
      <div className="hd-panel sk card">
        <p className="hd-eyebrow">boba bash</p>
        <h1 className="hd-title">{f.name}</h1>

        <dl className="hd-dl" style={{ marginTop: 14 }}>
          {f.venue ? (
            <div className="hd-dl-row">
              <dt>venue</dt>
              <dd>{f.venue}</dd>
            </div>
          ) : null}
          {f.city ? (
            <div className="hd-dl-row">
              <dt>city</dt>
              <dd>{f.city}</dd>
            </div>
          ) : null}
          {f.date ? (
            <div className="hd-dl-row">
              <dt>date</dt>
              <dd>{f.date}</dd>
            </div>
          ) : null}
        </dl>

        <div style={{ marginTop: 22 }}>
          {existingSignup ? (
            <p className="hd-alert good">
              You&apos;re signed up — see you there! Head to your{" "}
              <Link href="/dashboard">dashboard</Link> to submit your site.
            </p>
          ) : session ? (
            <RsvpButton meetupId={id} />
          ) : (
            <a
              href={`/signin?next=/meetup/${id}`}
              className="hd-bigbtn primary sk marker"
            >
              sign in to RSVP ▸
            </a>
          )}
        </div>
      </div>
    </HdShell>
  );
}
