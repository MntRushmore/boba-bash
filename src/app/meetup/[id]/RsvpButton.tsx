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
      className="rounded-full bg-syrup px-7 py-3 font-mono text-sm font-semibold text-cream-soft transition hover:-translate-y-0.5 disabled:opacity-60"
    >
      {pending ? "Saving your spot…" : "RSVP to this Bash"}
    </button>
  );
}
