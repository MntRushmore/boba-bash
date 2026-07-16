# Boba Bash

The platform for [Boba Bash](https://bash.hackclub.com) — an in-person event (September 2026, Hack Club × Boba Drops) where teens worldwide run boba meetups at local cafés, earn toward the food for every real signup they bring in, and build websites together on the day.

Modeled on Hack Club's [High Seas / Mystic Tavern](https://github.com/hackclub/high-seas).

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Airtable** as the datastore, via the `middleman.hackclub.com` proxy
- **Split auth** — organizers sign in with [Hack Club Auth](https://auth.hackclub.com) (OIDC); attendees use our own email magic link (via [Resend](https://resend.com)). Both land in the same signed-cookie session.
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

- **Organizers** sign in with Hack Club Auth, put a meetup on the live map,
  share a referral link (`/j/<code>`), and earn **$8.50 per fraud-cleared
  signup** toward food — paid in advance, reconciled after. Money is for the
  café/food bill.
- **Attendees** pick a Bash off the map, sign in with an email magic link,
  show up, and submit the site they build. Staff-approved submissions are how
  Hack Club recovers its cost — a separate metric that never changes the
  organizer's payout.
- **Staff** approve meetups and submissions, and clear signup fraud, directly
  in Airtable.

## Project layout

```
src/
  app/
    api/login/              organizer → Hack Club Auth (OIDC) kickoff
    api/auth/callback/      Hack Club Auth callback → session
    api/attendee/request/   attendee → send magic link (Resend)
    api/attendee/verify/    attendee → consume magic link → session
    j/[code]/               referral link entry point
    signin/                 sign-in screen (both paths)
    dashboard/              role-routed dashboard (WIP)
    signout/                clears the session
  lib/
    airtable.ts             middleman proxy client
    schema.ts               typed table fields
    people.ts               Person lookups, upserts, referral attribution
    auth.ts                 signed-cookie session (shared by both paths)
    hcauth.ts               Hack Club Auth OIDC helpers
    magiclink.ts            attendee magic-link tokens + Resend sender
    referral.ts             referral cookie + link helpers
```

## Deploying (Vercel)

Hosted on Vercel (`bash.hackclub.com`). Import the repo into the Hack Club
Vercel team — Next.js + Bun are auto-detected (see `vercel.json`). Then set
these environment variables in **Settings → Environment Variables** (values
from `.env.example`):

```
AUTH_SECRET            # openssl rand -hex 32
HCAUTH_CLIENT_ID       # auth.hackclub.com/developer_apps
HCAUTH_CLIENT_SECRET
RESEND_API_KEY         # resend.com (verified sending domain)
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
```

HC Auth redirect URIs to register (exact, no trailing slash):
`https://bash.hackclub.com/api/auth/callback` and
`http://localhost:3000/api/auth/callback`.

## Airtable tables

`people` · `meetups` · `signups` · `submissions` · `payouts` · `magic_links` —
see [`src/lib/schema.ts`](src/lib/schema.ts) for the typed field shapes.
