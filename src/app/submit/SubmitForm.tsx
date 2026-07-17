"use client";

import { useActionState } from "react";
import { submitSiteAction, type SubmitState } from "./actions";

const initial: SubmitState = {};

const fieldClass =
  "mt-1 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink outline-none focus:border-accent";
const labelClass =
  "block font-mono text-xs uppercase tracking-[0.12em] text-ink-soft";

export default function SubmitForm({
  meetups,
}: {
  meetups: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    submitSiteAction,
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
        <label htmlFor="meetup_id" className={labelClass}>
          Which Bash?
        </label>
        <select
          id="meetup_id"
          name="meetup_id"
          required
          defaultValue={meetups.length === 1 ? meetups[0].id : ""}
          className={fieldClass}
        >
          <option value="" disabled>
            Choose your Bash…
          </option>
          {meetups.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="repo_url" className={labelClass}>
          GitHub repo
        </label>
        <input
          id="repo_url"
          name="repo_url"
          type="url"
          placeholder="https://github.com/you/my-site"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="live_url" className={labelClass}>
          Live site
        </label>
        <input
          id="live_url"
          name="live_url"
          type="url"
          placeholder="https://you.github.io/my-site"
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-syrup px-6 py-3 font-mono text-sm font-semibold text-cream-soft transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit my site"}
      </button>

      <p className="text-sm text-ink-soft">
        Hack Club staff review submissions against the{" "}
        <a
          href="https://boba.hackclub.com/requirements.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Boba Drops requirements
        </a>
        .
      </p>
    </form>
  );
}
