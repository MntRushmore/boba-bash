import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import HdShell from "../../HdShell";
import MeetupForm from "./MeetupForm";

export const dynamic = "force-dynamic";

export default async function NewMeetup() {
  const session = await getSession();
  if (!session) redirect("/signin");
  if (session.role !== "organizer") redirect("/dashboard");

  return (
    <HdShell back={{ href: "/dashboard", label: "dashboard" }} width={620}>
      <div className="hd-panel sk card">
        <p className="hd-eyebrow">new Bash</p>
        <h1 className="hd-title">put your meetup on the map</h1>
        <p className="hd-lede" style={{ marginTop: 8 }}>
          Pick a café, set a date, and share the referral link with your friends.
          You earn toward the food for every real signup you bring in.
        </p>

        <MeetupForm />
      </div>
    </HdShell>
  );
}
