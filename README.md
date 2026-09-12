# Hexagram

Your WHOOP biometrics cast a daily I Ching hexagram. Six metrics, compared
against your own 30-day rolling baseline, become the six lines of the reading.
No coins, no yarrow stalks — the body's own state is the divination input.

## How a reading is cast

| Line | Metric | Yang when |
| --- | --- | --- |
| 1 (bottom) | Sleep performance % | above your baseline |
| 2 | Sleep consistency % | above your baseline |
| 3 | HRV (ms) | above your baseline |
| 4 | Resting heart rate (bpm) | **below** your baseline (lower is favorable) |
| 5 | Recovery score % | above your baseline |
| 6 (top) | Previous day's strain | above your baseline |

For each metric `z = (today − mean₃₀) / sd₃₀`. `z > 0` → yang, `z < 0` → yin
(inverted for resting heart rate). `|z| > 1.5` marks the line as *changing*;
flipping changing lines yields the transformed hexagram. Lines map to the
King Wen sequence via a static 64-entry lookup (`src/lib/hexagram/data.ts`).
Readings are flagged as unstable until ~14 days of data exist.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Prisma + SQLite · Vitest

## Setup

```bash
cp .env.example .env         # fill in WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET / SESSION_SECRET
npm install                   # runs prisma generate
npx prisma migrate dev        # creates prisma/dev.db
npm run dev
```

Register an app at <https://developer.whoop.com> with redirect URI
`http://localhost:3000/api/auth/whoop/callback` and scopes
`offline read:profile read:recovery read:sleep read:cycles read:workout`.

### Webhooks

Point the WHOOP webhook at `POST /api/webhooks/whoop` (use a tunnel locally).
Set `WHOOP_WEBHOOK_SECRET` to your client secret; signatures are verified
(`HMAC-SHA256(timestamp + body)`). `recovery.updated` / `sleep.updated` events
re-sync the user and regenerate their reading, so no polling is needed.
`POST /api/readings/sync` is a manual fallback.

### CLI: cast one day from your own data

```bash
npm run cast                  # latest day; runs a one-off local OAuth flow if no user exists
npm run cast -- 2026-09-10    # a specific date
```

### Demo without WHOOP credentials

```bash
npm run seed:demo             # 36 days of synthetic data
open http://localhost:3000/api/dev/login   # dev-only login as the demo user
```

`/upgrade` has a dev-only tier toggle (disabled in production) until billing is
wired up.

## Scripts

`npm run lint` · `npm run typecheck` · `npm test` · `npm run build`
