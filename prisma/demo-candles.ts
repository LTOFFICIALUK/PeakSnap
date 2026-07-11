import type { Candle } from "../src/lib/reversal";

type ScenarioKind = "dump" | "shakeout" | "continuation" | "bull_flag";

export type BuiltScenario = {
  candles: Candle[];
  freezeTimestamp: number;
  patternTag: string;
  peakGainPct: number;
  dropAfterPct: number;
  gainAfterPct: number;
  correctChoice: "EXIT" | "HOLD";
};

const pushCandle = (
  candles: Candle[],
  time: number,
  open: number,
  close: number,
  volume: number,
) => {
  const high = Math.max(open, close) * (1 + Math.random() * 0.006);
  const low = Math.min(open, close) * (1 - Math.random() * 0.006);
  candles.push({ time, open, high, low, close, volume });
};

const makePump = (
  candles: Candle[],
  startTime: number,
  base: number,
  pumpPct: number,
  count: number,
) => {
  let price = base;
  for (let i = 0; i < count; i++) {
    const step = (base * (pumpPct / 100)) / count;
    const open = price;
    const close = price + step * (0.85 + Math.random() * 0.3);
    pushCandle(candles, startTime + i * 60, open, close, 5000 + Math.random() * 6000);
    price = close;
  }
  return price;
};

const measureOutcome = (
  candles: Candle[],
  freezeIdx: number,
): Pick<BuiltScenario, "peakGainPct" | "dropAfterPct" | "gainAfterPct"> => {
  const freeze = candles[freezeIdx];
  const pumpLow = Math.min(...candles.slice(0, freezeIdx + 1).map((c) => c.low));
  const after = candles.slice(freezeIdx + 1, freezeIdx + 16);
  const lowestAfter = Math.min(...after.map((c) => c.low));
  const finalClose = after[after.length - 1]?.close ?? freeze.close;

  const peakGainPct = Math.round(((freeze.high - pumpLow) / pumpLow) * 1000) / 10;
  const dropAfterPct = Math.round(((freeze.high - lowestAfter) / freeze.high) * 1000) / 10;
  const gainAfterPct = Math.round(((finalClose - freeze.close) / freeze.close) * 1000) / 10;

  return {
    peakGainPct,
    dropAfterPct,
    gainAfterPct,
  };
};

export const buildScenario = (kind: ScenarioKind, index: number): BuiltScenario => {
  const candles: Candle[] = [];
  const base = 0.00008 + index * 0.000015;
  const start = Math.floor(Date.now() / 1000) - 100 * 60;
  const pumpCount = 16 + index;
  const peak = makePump(candles, start, base, 35 + index * 8, pumpCount);
  const afterIdx = pumpCount;

  let patternTag = "momentum_fade";
  let correctChoice: "EXIT" | "HOLD" = "EXIT";
  let freezeIdx = pumpCount + 2;

  if (kind === "dump") {
    patternTag = "volume_cliff";
    correctChoice = "EXIT";
    freezeIdx = pumpCount + 1;
    makeDump(candles, start, afterIdx, peak, 30 + index * 2, 22);
  } else if (kind === "shakeout") {
    patternTag = "shakeout";
    correctChoice = "HOLD";
    freezeIdx = pumpCount + 3;
    makeShakeout(candles, start, afterIdx, peak);
  } else if (kind === "continuation") {
    patternTag = "breakout";
    correctChoice = "HOLD";
    freezeIdx = pumpCount + 6;
    makeContinuation(candles, start, afterIdx, peak);
  } else {
    patternTag = "bull_flag";
    correctChoice = "HOLD";
    freezeIdx = pumpCount + 8;
    makeBullFlag(candles, start, afterIdx, peak);
  }

  const stats = measureOutcome(candles, freezeIdx);

  return {
    candles,
    freezeTimestamp: candles[freezeIdx].time,
    patternTag,
    correctChoice,
    peakGainPct: stats.peakGainPct,
    dropAfterPct: stats.dropAfterPct,
    gainAfterPct: stats.gainAfterPct,
  };
};

const makeDump = (
  candles: Candle[],
  startTime: number,
  startIdx: number,
  peak: number,
  dropPct: number,
  count: number,
) => {
  let price = peak;
  for (let i = 0; i < count; i++) {
    const step = (peak * (dropPct / 100)) / count;
    const open = price;
    const close = price - step * (0.75 + Math.random() * 0.4);
    pushCandle(candles, startTime + (startIdx + i) * 60, open, close, 3000 + Math.random() * 4000);
    price = close;
  }
};

const makeShakeout = (candles: Candle[], startTime: number, startIdx: number, peak: number) => {
  let price = peak;
  for (let i = 0; i < 4; i++) {
    const open = price;
    const close = price * (0.97 - Math.random() * 0.02);
    pushCandle(candles, startTime + (startIdx + i) * 60, open, close, 2200 + Math.random() * 1500);
    price = close;
  }
  for (let i = 0; i < 18; i++) {
    const open = price;
    const close = price * (1.012 + Math.random() * 0.008);
    pushCandle(candles, startTime + (startIdx + 4 + i) * 60, open, close, 4500 + Math.random() * 5000);
    price = close;
  }
};

const makeContinuation = (candles: Candle[], startTime: number, startIdx: number, peak: number) => {
  let price = peak;
  for (let i = 0; i < 8; i++) {
    const drift = (Math.random() - 0.5) * 0.008;
    const open = price;
    const close = price * (1 + drift);
    pushCandle(candles, startTime + (startIdx + i) * 60, open, close, 1800 + Math.random() * 1200);
    price = close;
  }
  for (let i = 0; i < 16; i++) {
    const open = price;
    const close = price * (1.015 + Math.random() * 0.01);
    pushCandle(candles, startTime + (startIdx + 8 + i) * 60, open, close, 5500 + Math.random() * 6000);
    price = close;
  }
};

const makeBullFlag = (candles: Candle[], startTime: number, startIdx: number, peak: number) => {
  let price = peak;
  for (let i = 0; i < 10; i++) {
    const open = price;
    const close = price * (0.996 - Math.random() * 0.003);
    pushCandle(candles, startTime + (startIdx + i) * 60, open, close, 1500 + Math.random() * 800);
    price = close;
  }
  for (let i = 0; i < 14; i++) {
    const open = price;
    const close = price * (1.01 + Math.random() * 0.007);
    pushCandle(candles, startTime + (startIdx + 10 + i) * 60, open, close, 4200 + Math.random() * 4500);
    price = close;
  }
};

/** Real Solana tokens — charts simulated, names are real */
export const demoCards = [
  {
    tokenMint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    tokenSymbol: "WIF",
    tokenName: "dogwifhat",
    scenario: "shakeout" as ScenarioKind,
  },
  {
    tokenMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    tokenSymbol: "BONK",
    tokenName: "Bonk",
    scenario: "bull_flag" as ScenarioKind,
  },
  {
    tokenMint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    tokenSymbol: "POPCAT",
    tokenName: "Popcat",
    scenario: "continuation" as ScenarioKind,
  },
  {
    tokenMint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
    tokenSymbol: "MEW",
    tokenName: "cat in a dogs world",
    scenario: "shakeout" as ScenarioKind,
  },
  {
    tokenMint: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
    tokenSymbol: "BOME",
    tokenName: "BOOK OF MEME",
    scenario: "dump" as ScenarioKind,
  },
  {
    tokenMint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    tokenSymbol: "PNUT",
    tokenName: "Peanut the Squirrel",
    scenario: "continuation" as ScenarioKind,
  },
  {
    tokenMint: "CzLSujWBLFsSjncfkh59rHqvbyoMZ6u8Xpx8Fnt4mB1",
    tokenSymbol: "CHILLGUY",
    tokenName: "Just a chill guy",
    scenario: "bull_flag" as ScenarioKind,
  },
  {
    tokenMint: "HeLp6NuQkmYB4pYWo2zYsCG5dUT6x6z9Eq56c1DU8zG",
    tokenSymbol: "AI16Z",
    tokenName: "ai16z",
    scenario: "dump" as ScenarioKind,
  },
];
