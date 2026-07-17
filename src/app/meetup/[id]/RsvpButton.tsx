"use client";

import { useTransition } from "react";
import { rsvpAction } from "./actions";

export default function RsvpButton({ meetupId }: { meetupId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => rsvpAction(meetupId))}
      className="hd-bigbtn primary sk marker"
    >
      {pending ? "saving your spot…" : "RSVP to this Bash ▸"}
    </button>
  );
}
