"use client";

import { useActionState } from "react";
import { createMeetupAction, type MeetupFormState } from "./actions";

const initial: MeetupFormState = {};

export default function MeetupForm() {
  const [state, formAction, pending] = useActionState(
    createMeetupAction,
    initial,
  );

  return (
    <form action={formAction} className="hd-form" style={{ marginTop: 18 }}>
      {state.error ? <p className="hd-alert bad">{state.error}</p> : null}

      <div className="hd-field">
        <label htmlFor="name" className="hd-label">
          Bash name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Downtown Boba Bash"
          className="hd-input sk thin soft"
        />
      </div>

      <div className="hd-grid2">
        <div className="hd-field">
          <label htmlFor="city" className="hd-label">
            city
          </label>
          <input
            id="city"
            name="city"
            required
            placeholder="San Jose, CA"
            className="hd-input sk thin soft"
          />
        </div>
        <div className="hd-field">
          <label htmlFor="venue" className="hd-label">
            café / venue
          </label>
          <input
            id="venue"
            name="venue"
            placeholder="Tea Top on 2nd St"
            className="hd-input sk thin soft"
          />
        </div>
      </div>

      <div className="hd-grid2">
        <div className="hd-field">
          <label htmlFor="date" className="hd-label">
            date
          </label>
          <input id="date" name="date" type="date" className="hd-input sk thin soft" />
        </div>
        <div className="hd-field">
          <label htmlFor="capacity" className="hd-label">
            capacity (optional)
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="0"
            placeholder="20"
            className="hd-input sk thin soft"
          />
        </div>
      </div>

      <div className="hd-field">
        <label htmlFor="slack_channel" className="hd-label">
          Slack channel (optional)
        </label>
        <input
          id="slack_channel"
          name="slack_channel"
          placeholder="#boba-bash-sanjose"
          className="hd-input sk thin soft"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="hd-bigbtn primary sk marker"
      >
        {pending ? "creating…" : "create Bash ▸"}
      </button>

      <p className="hd-cardnote" style={{ margin: 0 }}>
        New Bashes are reviewed by Hack Club staff before they go live on the
        map. You&apos;ll still get your referral link right away.
      </p>
    </form>
  );
}
