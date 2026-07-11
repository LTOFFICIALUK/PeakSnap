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
    high: Math.max(open, close) * 1.004,
    low: Math.min(open, close) * 0.996,
    close,
    volume,
  });
};

/** Deterministic marketing chart — mature chop → pump → freeze → dump */
export const buildHeroDemoCandles = (): Candle[] => {
  const candles: Candle[] = [];
  const start = 1_731_000_000;
  const floor = 28_000;
  const ath = 52_000;
  let t = 0;
  let mcap = floor * 0.82;

  for (let i = 0; i < 8; i++) {
    const open = mcap;
    mcap = i < 4 ? floor * (1.06 + i * 0.01) : floor * (0.94 - i * 0.005);
    pushCandle(candles, start + t++ * 60, open, mcap, 2_800);
  }

  for (let i = 0; i < 40; i++) {
    const open = mcap;
    const wave = Math.sin(i / 5) * 0.05 + Math.sin(i / 12) * 0.028;
    mcap = floor * (1 + wave - i * 0.0018);
    pushCandle(candles, start + t++ * 60, open, mcap, 1_400);
  }

  const coilFloor = mcap;
  for (let i = 0; i < 10; i++) {
    const open = mcap;
    mcap = coilFloor * (1 + Math.sin(i / 2) * 0.012);
    pushCandle(candles, start + t++ * 60, open, mcap, 1_100);
  }

  const pumpStart = mcap;
  for (let i = 0; i < 18; i++) {
    const open = mcap;
    mcap += (ath - pumpStart) / (18 - i || 1) * 0.82;
    pushCandle(candles, start + t++ * 60, open, mcap, 3_200);
  }

  for (let i = 0; i < 4; i++) {
    const open = mcap;
    mcap = ath * (1 + i * 0.002);
    pushCandle(candles, start + t++ * 60, open, mcap, 2_400);
  }

  for (let i = 0; i < 14; i++) {
    const open = mcap;
    mcap -= (ath - 24_000) / (14 - i || 1) * 0.75;
    pushCandle(candles, start + t++ * 60, open, mcap, 2_600);
  }

  return candles;
};

export const getHeroChartSlices = () => {
  const candles = buildHeroDemoCandles();
  const freezeIndex = candles.length - 15;
  const freezeTimestamp = candles[freezeIndex].time;

  return {
    freezeIndex,
    freezeTimestamp,
    visible: candles.slice(0, freezeIndex + 1),
    hidden: candles.slice(freezeIndex + 1),
  };
};
