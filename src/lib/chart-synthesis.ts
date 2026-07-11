import type { Candle } from "./reversal";

type MatureChartInput = {
  startSec: number;
  totalMinutes: number;
  floorMcap: number;
  athMcap: number;
  currentMcap: number;
  dumping: boolean;
  baseVolume: number;
};

const pushCandle = (
  candles: Candle[],
  time: number,
  open: number,
  close: number,
  volume: number,
) => {
  candles.push({
    time,
    open,
    high: Math.max(open, close) * (1.003 + Math.random() * 0.004),
    low: Math.min(open, close) * (0.997 - Math.random() * 0.003),
    close,
    volume,
  });
};

/** Launch pop → chop/bleed → coil → pump → top → aftermath (matches mature axiom-style charts) */
export const buildMatureChartCandles = ({
  startSec,
  totalMinutes,
  floorMcap,
  athMcap,
  currentMcap,
  dumping,
  baseVolume,
}: MatureChartInput): Candle[] => {
  const candles: Candle[] = [];
  const minutes = Math.max(60, totalMinutes);

  const launchPhase = Math.max(8, Math.floor(minutes * 0.07));
  const chopPhase = Math.floor(minutes * 0.42);
  const coilPhase = Math.floor(minutes * 0.1);
  const pumpPhase = Math.floor(minutes * 0.2);
  const topPhase = 4;
  const restPhase = Math.max(
    12,
    minutes - launchPhase - chopPhase - coilPhase - pumpPhase - topPhase,
  );

  let mcap = floorMcap * 0.82;
  let t = 0;

  for (let i = 0; i < launchPhase; i++) {
    const open = mcap;
    const spike = i < launchPhase / 2;
    mcap = spike
      ? floorMcap * (1.08 + Math.random() * 0.12)
      : floorMcap * (0.9 + Math.random() * 0.08);
    pushCandle(candles, startSec + t * 60, open, mcap, baseVolume * (1.2 + Math.random()));
    t += 1;
  }

  let chopAnchor = floorMcap * 0.95;
  for (let i = 0; i < chopPhase; i++) {
    const open = mcap;
    const wave =
      Math.sin(i / 5) * 0.045 +
      Math.sin(i / 13) * 0.025 +
      (Math.random() - 0.5) * 0.02;
    const bleed = (i / chopPhase) * 0.08;
    mcap = chopAnchor * (1 + wave - bleed);
    pushCandle(candles, startSec + t * 60, open, mcap, baseVolume * (0.6 + Math.random() * 0.5));
    t += 1;
  }

  const coilFloor = mcap;
  for (let i = 0; i < coilPhase; i++) {
    const open = mcap;
    mcap = coilFloor * (1 + (Math.random() - 0.45) * 0.025);
    pushCandle(candles, startSec + t * 60, open, mcap, baseVolume * (0.5 + Math.random() * 0.3));
    t += 1;
  }

  const pumpStart = mcap;
  for (let i = 0; i < pumpPhase; i++) {
    const open = mcap;
    mcap += (athMcap - pumpStart) / (pumpPhase - i || 1) * (0.75 + Math.random() * 0.35);
    pushCandle(candles, startSec + t * 60, open, mcap, baseVolume * (1.4 + Math.random() * 1.2));
    t += 1;
  }

  for (let i = 0; i < topPhase; i++) {
    const open = mcap;
    mcap = athMcap * (1 + Math.random() * 0.008);
    pushCandle(candles, startSec + t * 60, open, mcap, baseVolume * (0.8 + Math.random() * 0.4));
    t += 1;
  }

  for (let i = 0; i < restPhase; i++) {
    const open = mcap;
    if (dumping) {
      mcap -= (athMcap - currentMcap) / (restPhase - i || 1) * (0.65 + Math.random() * 0.45);
    } else {
      mcap += (currentMcap - mcap) / (restPhase - i || 1) * (0.55 + Math.random() * 0.4);
    }
    pushCandle(candles, startSec + t * 60, open, mcap, baseVolume * (0.7 + Math.random() * 0.6));
    t += 1;
  }

  return candles;
};
