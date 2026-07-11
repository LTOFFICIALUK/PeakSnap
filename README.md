# PeakSnap

Solana memecoin reversal drill. Freeze before the top → guess exit or hold → replay.

**Production:** Vercel serves the app · Neon Postgres stores decks · your PC builds today's deck.

## Quick start (local)

```bash
npm install
cp .env.example .env
# Fill DATABASE_URL, DIRECT_URL, ADMIN_SECRET (see Production setup)
npx prisma migrate deploy
npm run dev
```

Open **http://localhost:3001/drill** — auto-builds today's deck from live APIs on your PC.

## Production setup

### 1. Neon Postgres (free)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy both connection strings:
   - **Pooled** → `DATABASE_URL` (hostname contains `-pooler`)
   - **Direct** → `DIRECT_URL` (no pooler)

### 2. Vercel env vars

In **Vercel → PeakSnap → Settings → Environment Variables**:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `ADMIN_SECRET` | `openssl rand -hex 32` |
| `BIRDEYE_API_KEY` | *(optional)* |

Vercel runs `prisma migrate deploy` on each deploy (see `vercel.json`).

### 3. Local PC `.env` (same DB)

Use the **same** `DATABASE_URL`, `DIRECT_URL`, and `ADMIN_SECRET` as Vercel.

```bash
npm run deck:live
```

This pulls today's pump.fun launches and writes cards into Neon. Vercel users read from that DB.

**Daily cron on your Mac** (optional):

```bash
# crontab -e
0 6 * * * cd /path/to/PeakSnap && npm run deck:live >> ~/peaksnap-deck.log 2>&1
```

Or trigger remotely:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/admin/build-deck \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

> Note: `/api/admin/build-deck` on Vercel may timeout (PumpPortal WebSocket). Prefer `npm run deck:live` from your PC.

## Pages

| Route | What |
|-------|------|
| `/` | Landing page |
| `/drill` | Daily reversal drill |
| `/how-it-works` | Product walkthrough |
| `/pricing` | Tiers + token access |

## Architecture

| Where | Role |
|-------|------|
| **Vercel** | Next.js app, API routes, serves drills from Postgres |
| **Neon** | Shared Postgres — decks, cards, guesses |
| **Your PC** | `npm run deck:live` — fetches live tokens, builds deck |

Vercel does **not** auto-build decks (WebSocket + long API calls). Your PC is the deck builder.

## Build today's deck

Sources:

1. **PumpPortal** WebSocket — live launches
2. **pump.fun API** — today's created coins
3. **DexScreener** — graduated pumpswap pairs

```bash
npm run deck:live      # build + save to DB
npm run deck:test      # preview token discovery
```

**Demo seed** (`npm run db:seed`) — offline simulated charts only.

## Stack

Next.js 16 · Prisma · PostgreSQL (Neon) · Lightweight Charts · Tailwind 4
