const PUMPFUN_BASE = "https://frontend-api-v3.pump.fun";

export type PumpFunCoin = {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image_uri?: string;
  bonding_curve: string;
  created_timestamp: number;
  complete: boolean;
  market_cap: number;
  ath_market_cap?: number;
  ath_market_cap_timestamp?: number;
  last_trade_timestamp?: number;
  real_sol_reserves?: number;
  virtual_sol_reserves?: number;
  is_banned?: boolean;
};

const pumpHeaders = {
  Accept: "application/json",
  Origin: "https://pump.fun",
};

export const fetchRecentPumpCoins = async (
  limit = 50,
  maxAgeMs = 24 * 60 * 60 * 1000,
): Promise<PumpFunCoin[]> => {
  const url = new URL(`${PUMPFUN_BASE}/coins`);
  url.searchParams.set("limit", String(Math.min(limit, 50)));
  url.searchParams.set("offset", "0");
  url.searchParams.set("sort", "created_timestamp");
  url.searchParams.set("order", "DESC");
  url.searchParams.set("includeNsfw", "false");

  const res = await fetch(url.toString(), {
    headers: pumpHeaders,
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return [];
  }

  const coins = (await res.json()) as PumpFunCoin[];
  const cutoff = Date.now() - maxAgeMs;

  return coins.filter((coin) => {
    if (!coin.mint || !coin.symbol || coin.is_banned) {
      return false;
    }
    if (coin.created_timestamp < cutoff) {
      return false;
    }
    const ath = coin.ath_market_cap ?? coin.market_cap;
    if (ath < 4_000) {
      return false;
    }
    if (coin.market_cap > 2_500_000) {
      return false;
    }
    return true;
  });
};

export const fetchPumpCoinByMint = async (mint: string): Promise<PumpFunCoin | null> => {
  const res = await fetch(`${PUMPFUN_BASE}/coins/${mint}`, {
    headers: pumpHeaders,
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as PumpFunCoin;
};
