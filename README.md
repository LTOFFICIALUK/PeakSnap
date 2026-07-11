# PeakSnap

Solana memecoin reversal drill. Freeze before the top → guess exit or hold → replay.

Runs on your PC. Charts are fetched once and stored — users read from your DB.

## Quick start

```bash
cd reversal-snap
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Open **http://localhost:3001/drill** — today's deck builds automatically from live APIs.

## Pages

| Route | What |
|-------|------|
| `/` | Landing page |
| `/drill` | Daily reversal drill (the product) |
| `/how-it-works` | Product walkthrough |
| `/pricing` | Tiers + token access |

## MVP flow

1. Nightly (or manual) deck build stores candle data in SQLite
2. User swipes through cards — chart frozen at reversal point
3. User picks **Exit** or **Hold**
4. Chart replays forward
5. Score tracked per browser session

## Build today's deck (real tokens)

Pulls **today's pump.fun launches** via:

1. **PumpPortal** WebSocket (`subscribeNewToken`) — free, live
2. **pump.fun API** (`frontend-api-v3.pump.fun/coins`) — today's created coins
3. **DexScreener** — graduated pumpswap pairs as fallback

```bash
npm run deck:live
```

Preview what will be found:

```bash
npm run deck:test
```

Or via API:

```bash
curl -X POST http://localhost:3001/api/admin/build-deck \
  -H "x-admin-secret: change-me-before-building-decks"
```

**Demo seed** (`npm run db:seed`) uses simulated charts — use `deck:live` for real today's memecoins.

## Scale later

- Swap SQLite → Postgres (one env change)
- Add token gating (Helius wallet balance check)
- Add spaced repetition on missed patterns
- Cron on your PC: `node scripts/build-deck.mjs` daily

## Stack

Next.js 16 · Prisma · SQLite · Lightweight Charts · Tailwind 4
