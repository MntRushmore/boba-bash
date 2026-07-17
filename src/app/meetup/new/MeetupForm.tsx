"use client";

import { useActionState } from "react";
import { createMeetupAction, type MeetupFormState } from "./actions";

const initial: MeetupFormState = {};

const fieldClass =
  "mt-1 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink outline-none focus:border-accent";
const labelClass =
  "block font-mono text-xs uppercase tracking-[0.12em] text-ink-soft";

export default function MeetupForm() {
  const [state, formAction, pending] = useActionState(
    createMeetupAction,
    initial,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {state.error ? (
        <p className="rounded-lg bg-bad/10 px-4 py-2 text-sm text-bad">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className={labelClass}>
          Bash name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Downtown Boba Bash"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <input
            id="city"
            name="city"
            required
            placeholder="San Jose, CA"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="venue" className={labelClass}>
            Café / venue
          </label>
          <input
            id="venue"
            name="venue"
            placeholder="Tea Top on 2nd St"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="capacity" className={labelClass}>
            Capacity (optional)
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="0"
            placeholder="20"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="slack_channel" className={labelClass}>
          Slack channel (optional)
        </label>
        <input
          id="slack_channel"
          name="slack_channel"
          placeholder="#boba-bash-sanjose"
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-syrup px-6 py-3 font-mono text-sm font-semibold text-cream-soft transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? "Creating…" : "Create Bash"}
      </button>

      <p className="text-sm text-ink-soft">
        New Bashes are reviewed by Hack Club staff before they go live on the
        map. You&apos;ll still get your referral link right away.
      </p>
    </form>
  );
}
