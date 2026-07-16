# Boba Bash

The platform for [Boba Bash](https://bash.hackclub.com) — an in-person event (September 2026, Hack Club × Boba Drops) where teens worldwide run boba meetups at local cafés, earn toward the food for every real signup they bring in, and build websites together on the day.

Modeled on Hack Club's [High Seas / Mystic Tavern](https://github.com/hackclub/high-seas).

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Airtable** as the datastore, via the `middleman.hackclub.com` proxy
- **Slack OpenID** sign-in with signed-cookie sessions (ported from high-seas)
- Hosted on **Vercel**, `bash.hackclub.com`
- Package manager: **Bun**

## Getting started

```bash
bun install
cp .env.example .env.local   # fill in the values
bun run dev
```

Open http://localhost:3000.

## How it works

- **Organizers** put a meetup on the live map, share a referral link
  (`/j/<code>`), and earn **$8.50 per fraud-cleared signup** toward food — paid
  in advance, reconciled after. Money is for the café/food bill.
- **Attendees** pick a Bash off the map, RSVP with Slack, show up, and submit
  the site they build. Staff-approved submissions are how Hack Club recovers
  its cost — a separate metric that never changes the organizer's payout.
- **Staff** approve meetups and submissions, and clear signup fraud, directly
  in Airtable.

## Data model (Airtable)

`people` · `meetups` · `signups` · `submissions` · `payouts` — see
[`src/lib/schema.ts`](src/lib/schema.ts) for the typed field shapes.

## Project layout

```
src/
  app/
    api/login/            Slack OAuth kickoff
    api/slack_redirect/   Slack OAuth callback → session
    j/[code]/             referral link entry point
    signin/               sign-in screen
    dashboard/            role-routed dashboard (WIP)
    signout/              clears the session
  lib/
    airtable.ts           middleman proxy client
    schema.ts             typed table fields
    people.ts             Person lookups, creation, referral attribution
    auth.ts               signed-cookie Slack session
    referral.ts           referral cookie + link helpers
```
