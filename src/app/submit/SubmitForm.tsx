"use client";

import { useActionState } from "react";
import { submitSiteAction, type SubmitState } from "./actions";

const initial: SubmitState = {};

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
    <form action={formAction} className="hd-form" style={{ marginTop: 18 }}>
      {state.error ? <p className="hd-alert bad">{state.error}</p> : null}

      <div className="hd-field">
        <label htmlFor="meetup_id" className="hd-label">
          which Bash?
        </label>
        <select
          id="meetup_id"
          name="meetup_id"
          required
          defaultValue={meetups.length === 1 ? meetups[0].id : ""}
          className="hd-select sk thin soft"
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

      <div className="hd-field">
        <label htmlFor="repo_url" className="hd-label">
          GitHub repo
        </label>
        <input
          id="repo_url"
          name="repo_url"
          type="url"
          placeholder="https://github.com/you/my-site"
          className="hd-input sk thin soft"
        />
      </div>

      <div className="hd-field">
        <label htmlFor="live_url" className="hd-label">
          live site
        </label>
        <input
          id="live_url"
          name="live_url"
          type="url"
          placeholder="https://you.github.io/my-site"
          className="hd-input sk thin soft"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="hd-bigbtn primary sk marker"
      >
        {pending ? "submitting…" : "submit my site ▸"}
      </button>

      <p className="hd-cardnote" style={{ margin: 0 }}>
        Hack Club staff review submissions against the{" "}
        <a
          href="https://boba.hackclub.com/requirements.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Boba Drops requirements
        </a>
        .
      </p>
    </form>
  );
}
