import type { Candle } from "./reversal";

export const formatMarketCap = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

/** Scale price-based OHLC candles to market cap USD */
export const candlesToMarketCap = (
  candles: Candle[],
  marketCap?: number,
): Candle[] => {
  if (!candles.length || !marketCap || marketCap <= 0) {
    return candles;
  }

  const lastClose = candles[candles.length - 1]?.close ?? 0;
  if (lastClose <= 0) {
    return candles;
  }

  // Already market cap scale
  if (lastClose >= 50 && Math.abs(lastClose - marketCap) / marketCap < 5) {
    return candles;
  }

  const factor = marketCap / lastClose;

  return candles.map((c) => ({
    ...c,
    open: c.open * factor,
    high: c.high * factor,
    low: c.low * factor,
    close: c.close * factor,
  }));
};

/** Undo legacy synth that divided market cap by 1e9 */
export const repairLegacyCandles = (candles: Candle[]): Candle[] => {
  if (!candles.length) {
    return candles;
  }

  const maxVal = Math.max(...candles.map((c) => c.high));
  if (maxVal > 0 && maxVal < 1) {
    const factor = 1_000_000_000;
    return candles.map((c) => ({
      ...c,
      open: c.open * factor,
      high: c.high * factor,
      low: c.low * factor,
      close: c.close * factor,
    }));
  }

  return candles;
};
