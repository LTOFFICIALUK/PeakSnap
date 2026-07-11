import type { Candle } from "./reversal";

const pushCandle = (
  candles: Candle[],
  time: number,
  open: number,
  close: number,
  volume = 2_000,
) => {
  candles.push({
    time,
    open,
    high: Math.max(open, close) * 1.0035,
    low: Math.min(open, close) * 0.9965,
    close,
    volume,
  });
};

/** Bull-flag style demo — flat chop, tight flag, modest push (matches drill cards) */
export const buildHeroDemoCandles = (): Candle[] => {
  const candles: Candle[] = [];
  const start = 1_731_100_000;
  const base = 30_000;
  const peak = 42_500;
  let t = 0;
  let mcap = 26_500;

  // Early session pop then fade
  for (let i = 0; i < 10; i++) {
    const open = mcap;
    mcap = i < 5 ? 27_800 + i * 420 : 31_500 - (i - 5) * 380;
    pushCandle(candles, start + t++ * 60, open, mcap, 2_200);
  }

  // Long sideways chop — the bulk of the chart
  for (let i = 0; i < 48; i++) {
    const open = mcap;
    const wave =
      Math.sin(i / 4.5) * 0.038 +
      Math.sin(i / 11) * 0.022 +
      Math.sin(i / 19) * 0.014;
    mcap = base * (0.92 + wave);
    pushCandle(candles, start + t++ * 60, open, mcap, 1_100 + (i % 3) * 120);
  }

  // Tight bull flag — shallow drift down
  for (let i = 0; i < 12; i++) {
    const open = mcap;
    mcap = 33_800 - i * 95 + Math.sin(i / 2) * 180;
    pushCandle(candles, start + t++ * 60, open, mcap, 900);
  }

  // Breakout leg — steady, not vertical
  for (let i = 0; i < 14; i++) {
    const open = mcap;
    mcap += (peak - 32_500) / 14 * (0.75 + (i % 2) * 0.12);
    pushCandle(candles, start + t++ * 60, open, mcap, 2_400 + i * 80);
  }

  // Top wick cluster
  for (let i = 0; i < 3; i++) {
    const open = mcap;
    mcap = peak * (1 + i * 0.0015);
    pushCandle(candles, start + t++ * 60, open, mcap, 1_800);
  }

  // Hidden replay candles (not shown in hero)
  for (let i = 0; i < 10; i++) {
    const open = mcap;
    mcap = Math.max(31_000, mcap - 680);
    pushCandle(candles, start + t++ * 60, open, mcap, 2_100);
  }

  return candles;
};

export const getHeroChartSlices = () => {
  const candles = buildHeroDemoCandles();

  let athIndex = 0;
  let athHigh = 0;
  for (let i = 0; i < candles.length; i++) {
    if (candles[i].high > athHigh) {
      athHigh = candles[i].high;
      athIndex = i;
    }
  }

  const freezeIdx = Math.max(0, athIndex - 1);
  const freezeTimestamp = candles[freezeIdx].time;

  return {
    freezeIndex: freezeIdx,
    freezeTimestamp,
    visible: candles.slice(0, freezeIdx + 1),
    hidden: candles.slice(freezeIdx + 1),
  };
};
