export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Scenario = {
  freezeTimestamp: number;
  patternTag: string;
  peakGainPct: number;
  dropAfterPct: number;
  gainAfterPct: number;
  correctChoice: "EXIT" | "HOLD";
};

const PUMP_LOOKBACK = 15;
const REPLAY_WINDOW = 12;
const MIN_PUMP_PCT = 15;
const EXIT_DROP_PCT = 14;
const HOLD_GAIN_PCT = 6;
const MIN_PRE_FREEZE_CANDLES = 35;

/** Reject straight-from-launch pumps; need chop/bleed before the final leg up */
export const hasMaturePriceAction = (candles: Candle[], peakIndex: number): boolean => {
  if (peakIndex < MIN_PRE_FREEZE_CANDLES) {
    return false;
  }

  const pre = candles.slice(0, peakIndex + 1);
  const midStart = Math.floor(pre.length * 0.18);
  const midEnd = Math.floor(pre.length * 0.62);
  const mid = pre.slice(midStart, midEnd);

  if (mid.length < 12) {
    return false;
  }

  const midHigh = Math.max(...mid.map((c) => c.high));
  const midLow = Math.min(...mid.map((c) => c.low));
  const midAvg = mid.reduce((sum, c) => sum + c.close, 0) / mid.length;
  const chopPct = ((midHigh - midLow) / midAvg) * 100;

  if (chopPct < 6) {
    return false;
  }

  const fullHigh = Math.max(...pre.map((c) => c.high));
  const fullLow = Math.min(...pre.map((c) => c.low));
  const fullRange = fullHigh - fullLow;
  const netMove = Math.abs(pre[pre.length - 1].close - pre[0].close);

  if (fullRange > 0 && netMove / fullRange > 0.8) {
    return false;
  }

  const recentLeg = pre.slice(Math.floor(pre.length * 0.55));
  const legLow = Math.min(...recentLeg.map((c) => c.low));
  const legGain = ((pre[pre.length - 1].high - legLow) / legLow) * 100;

  return legGain >= MIN_PUMP_PCT;
};

export const detectScenario = (candles: Candle[]): Scenario | null => {
  if (candles.length < PUMP_LOOKBACK + REPLAY_WINDOW + 3) {
    return null;
  }

  let best: Scenario | null = null;

  for (let i = PUMP_LOOKBACK; i < candles.length - REPLAY_WINDOW; i++) {
    const window = candles.slice(i - PUMP_LOOKBACK, i + 1);
    const low = Math.min(...window.map((c) => c.low));
    const peak = candles[i].high;
    const peakGainPct = ((peak - low) / low) * 100;

    if (peakGainPct < MIN_PUMP_PCT) {
      continue;
    }

    const after = candles.slice(i + 1, i + 1 + REPLAY_WINDOW);
    const freezeClose = candles[i].close;
    const lowestAfter = Math.min(...after.map((c) => c.low));
    const finalClose = after[after.length - 1].close;

    const dropAfterPct = ((peak - lowestAfter) / peak) * 100;
    const gainAfterPct = ((finalClose - freezeClose) / freezeClose) * 100;

    let correctChoice: "EXIT" | "HOLD" | null = null;

    if (dropAfterPct >= EXIT_DROP_PCT && gainAfterPct < HOLD_GAIN_PCT) {
      correctChoice = "EXIT";
    } else if (gainAfterPct >= HOLD_GAIN_PCT || (dropAfterPct < 10 && finalClose >= freezeClose)) {
      correctChoice = "HOLD";
    }

    if (!correctChoice) {
      continue;
    }

    if (!hasMaturePriceAction(candles, i)) {
      continue;
    }

    const tag = classifyPattern(candles, i, correctChoice);
    const score = correctChoice === "EXIT" ? dropAfterPct : gainAfterPct;

    if (!best || score > (best.correctChoice === "EXIT" ? best.dropAfterPct : best.gainAfterPct)) {
      best = {
        freezeTimestamp: candles[i].time,
        patternTag: tag,
        peakGainPct: Math.round(peakGainPct * 10) / 10,
        dropAfterPct: Math.round(dropAfterPct * 10) / 10,
        gainAfterPct: Math.round(gainAfterPct * 10) / 10,
        correctChoice,
      };
    }
  }

  return best;
};

/** @deprecated use detectScenario */
export const detectReversal = (candles: Candle[]) => {
  const scenario = detectScenario(candles);
  if (!scenario || scenario.correctChoice !== "EXIT") {
    return null;
  }
  return {
    freezeTimestamp: scenario.freezeTimestamp,
    patternTag: scenario.patternTag,
    peakGainPct: scenario.peakGainPct,
    dropAfterPct: scenario.dropAfterPct,
  };
};

const classifyPattern = (
  candles: Candle[],
  peakIndex: number,
  outcome: "EXIT" | "HOLD",
): string => {
  const peak = candles[peakIndex];
  const prior = candles.slice(Math.max(0, peakIndex - 5), peakIndex);
  const avgVol =
    prior.reduce((sum, c) => sum + c.volume, 0) / Math.max(prior.length, 1);

  if (outcome === "HOLD") {
    const after = candles.slice(peakIndex + 1, peakIndex + 6);
    const dip = after.length
      ? ((peak.close - Math.min(...after.map((c) => c.low))) / peak.close) * 100
      : 0;

    if (dip >= 5 && dip < 14) {
      return "shakeout";
    }

    const range = after.length
      ? (Math.max(...after.map((c) => c.high)) - Math.min(...after.map((c) => c.low))) /
        peak.close
      : 0;

    if (range < 0.06) {
      return "bull_flag";
    }

    return "breakout";
  }

  if (peak.volume < avgVol * 0.45) {
    return "volume_cliff";
  }

  const prev = candles[peakIndex - 1];
  if (prev && peak.high <= prev.high * 1.002 && prev.high >= peak.high * 0.995) {
    return "double_top";
  }

  const after = candles[peakIndex + 1];
  if (after && after.close < peak.open * 0.92) {
    return "sharp_reject";
  }

  return "momentum_fade";
};

export const splitCandlesAtFreeze = (
  candles: Candle[],
  freezeTimestamp: number,
) => {
  const index = candles.findIndex((c) => c.time === freezeTimestamp);
  if (index === -1) {
    return { visible: candles, hidden: [] as Candle[] };
  }

  return {
    visible: candles.slice(0, index + 1),
    hidden: candles.slice(index + 1),
  };
};

export const isChoiceCorrect = (
  choice: "EXIT" | "HOLD",
  correctChoice: "EXIT" | "HOLD",
): boolean => choice === correctChoice;
