export const SITE = {
  name: "PeakSnap",
  tagline: "Freeze before the top. Replay the dump.",
  description:
    "Daily Solana memecoin reversal drills. Train your exit reflex on real charts — frozen one candle before the top.",
  drillHref: "/drill",
  tokenSymbol: "$PEAK",
} as const;

export const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const STEPS = [
  {
    step: "01",
    title: "Today's deck drops",
    body: "We pull real Solana movers, detect reversal zones, and cache the charts overnight. One fetch — unlimited users.",
  },
  {
    step: "02",
    title: "Chart freezes at the top",
    body: "You see the pump exactly as it looked one candle before the reversal. No hindsight. No spoilers.",
  },
  {
    step: "03",
    title: "Exit or hold — then replay",
    body: "Make the call, watch what happened next, and build pattern memory through daily repetition.",
  },
] as const;

export const FEATURES = [
  {
    title: "Real memecoin charts",
    body: "Not textbook TA on BTC. Actual Solana pumps from today's market — curated and cached.",
  },
  {
    title: "Freeze-and-replay engine",
    body: "Charts stop at the reversal candidate. You replay forward only after you commit to a decision.",
  },
  {
    title: "Pattern tagging",
    body: "Volume cliffs, double tops, sharp rejects — each card labels the setup so you learn names, not vibes.",
  },
  {
    title: "Spaced repetition ready",
    body: "Track accuracy and streaks. Missed patterns resurface so you drill what you get wrong.",
  },
  {
    title: "Token-gated access",
    body: "Hold $PEAK to unlock full decks, unlimited replays, and pro pattern gym tiers.",
  },
  {
    title: "Runs on your infra",
    body: "SQLite today, Postgres tomorrow. Charts stored once — API costs scale with content, not users.",
  },
] as const;

export const PRICING_TIERS = [
  {
    name: "Scout",
    price: "Free",
    tokens: "0",
    highlight: false,
    features: [
      "3 cards per day",
      "Yesterday's deck",
      "Basic accuracy score",
      "Chart replay on each card",
    ],
    cta: "Start drilling",
    ctaHref: "/drill",
  },
  {
    name: "Trader",
    price: "Hold",
    tokens: "10,000",
    highlight: true,
    features: [
      "Full daily deck (10+ cards)",
      "Same-day Solana movers",
      "Unlimited replays",
      "Streak + accuracy tracking",
    ],
    cta: "Get access",
    ctaHref: "/pricing#access",
  },
  {
    name: "Pro",
    price: "Hold",
    tokens: "100,000",
    highlight: false,
    features: [
      "Everything in Trader",
      "Pattern gym (missed setups)",
      "Priority deck refresh",
      "Early feature access",
    ],
    cta: "Go pro",
    ctaHref: "/pricing#access",
  },
] as const;

export const FAQ = [
  {
    q: "Is this financial advice?",
    a: "No. PeakSnap is an educational simulation for pattern recognition. Past chart behaviour does not predict future results.",
  },
  {
    q: "Where does the chart data come from?",
    a: "We aggregate Solana pair data from public market APIs, pin the highest-liquidity pool per token, and store candles in our database.",
  },
  {
    q: "Why freeze before the top?",
    a: "Hindsight makes everyone a genius. Freezing the chart forces you to decide under uncertainty — the same pressure as live trading.",
  },
  {
    q: "Do I need the token to try it?",
    a: "No. Scout tier is free with 3 cards per day. Hold $PEAK when you're ready for the full daily deck.",
  },
  {
    q: "When does the token launch?",
    a: "Access tiers are built and ready. Token launch timing will be announced — product works today on the free tier.",
  },
] as const;
