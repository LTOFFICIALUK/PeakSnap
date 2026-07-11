import { candlesToMarketCap } from "./chart-format";
import { buildMatureChartCandles } from "./chart-synthesis";
import type { Candle } from "./reversal";
import { fetchPumpCoinByMint, fetchRecentPumpCoins, type PumpFunCoin } from "./pumpfun-api";
import { collectPumpPortalTokens } from "./pumpportal";

export type DexPair = {
  chainId: string;
  dexId?: string;
  pairAddress: string;
  pairCreatedAt?: number;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd?: string;
  marketCap?: number;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  volume?: { h24?: number; h6?: number; h1?: number; m5?: number };
  liquidity?: { usd?: number };
  info?: { imageUrl?: string };
};

type TokenProfile = {
  chainId: string;
  tokenAddress: string;
  icon?: string;
  description?: string;
};

type GeckoOhlcvResponse = {
  data?: {
    attributes?: {
      ohlcv_list?: Array<[number, number, number, number, number, number]>;
    };
  };
};

const SOLANA_CHAIN = "solana";
const DEX_BASE = "https://api.dexscreener.com";

/** Known mega caps — never drill these */
const MEGA_MINTS = new Set([
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", // WIF
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
  "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", // POPCAT
  "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", // MEW
  "So11111111111111111111111111111111111111112", // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
]);

const PREFERRED_DEX = new Set(["pumpfun", "pumpswap", "raydium", "meteora"]);

const MIN_LIQUIDITY_USD = 3_000;
const MAX_LIQUIDITY_USD = 750_000;
const MAX_MARKET_CAP = 2_000_000;
const MIN_VOLUME_H1 = 500;
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** Skip brand-new launches — charts need prior chop */
export const MIN_TOKEN_AGE_MS = 45 * 60 * 1000;
const CANDLE_FETCH_LIMIT = 220;

export type LaunchFilters = {
  maxAgeMs?: number;
  minAgeMs?: number;
  minLiquidityUsd?: number;
  maxLiquidityUsd?: number;
  maxMarketCap?: number;
};

const fetchJson = async <T>(url: string): Promise<T | null> => {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as T;
};

const normalizeMint = (mint: string) => mint.toLowerCase();

const isBlockedMint = (mint: string) => MEGA_MINTS.has(mint);

const fetchLatestProfiles = async (): Promise<TokenProfile[]> => {
  const [profiles, boosts] = await Promise.all([
    fetchJson<TokenProfile[]>(`${DEX_BASE}/token-profiles/latest/v1`),
    fetchJson<TokenProfile[]>(`${DEX_BASE}/token-boosts/latest/v1`),
  ]);

  const seen = new Set<string>();
  const merged: TokenProfile[] = [];

  for (const item of [...(profiles ?? []), ...(boosts ?? [])]) {
    if (item.chainId !== SOLANA_CHAIN || isBlockedMint(item.tokenAddress)) {
      continue;
    }

    const key = normalizeMint(item.tokenAddress);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(item);
  }

  return merged;
};

export const fetchTokenPairs = async (mint: string): Promise<DexPair[]> => {
  const data = await fetchJson<DexPair[]>(`${DEX_BASE}/token-pairs/v1/solana/${mint}`);
  return (data ?? []).filter((p) => p.chainId === SOLANA_CHAIN);
};

export const pickTodayPair = (
  pairs: DexPair[],
  filters: LaunchFilters = {},
): DexPair | null => {
  const maxAgeMs = filters.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
  const minAgeMs = filters.minAgeMs ?? MIN_TOKEN_AGE_MS;
  const minLiq = filters.minLiquidityUsd ?? MIN_LIQUIDITY_USD;
  const maxLiq = filters.maxLiquidityUsd ?? MAX_LIQUIDITY_USD;
  const maxMcap = filters.maxMarketCap ?? MAX_MARKET_CAP;
  const cutoff = Date.now() - maxAgeMs;
  const minCreated = Date.now() - minAgeMs;

  const eligible = pairs.filter((pair) => {
    const liq = pair.liquidity?.usd ?? 0;
    const mcap = pair.marketCap ?? 0;
    const volH1 = pair.volume?.h1 ?? pair.volume?.m5 ?? 0;
    const created = pair.pairCreatedAt ?? 0;

    if (created < cutoff) {
      return false;
    }
    if (created > minCreated) {
      return false;
    }
    if (liq < minLiq || liq > maxLiq) {
      return false;
    }
    if (mcap > maxMcap && mcap > 0) {
      return false;
    }
    if (volH1 < MIN_VOLUME_H1) {
      return false;
    }
    if (pair.dexId && !PREFERRED_DEX.has(pair.dexId)) {
      return false;
    }

    return true;
  });

  if (!eligible.length) {
    return null;
  }

  return [...eligible].sort((a, b) => {
    const dexScore = (p: DexPair) => (p.dexId && PREFERRED_DEX.has(p.dexId) ? 1 : 0);
    const dexDiff = dexScore(b) - dexScore(a);
    if (dexDiff !== 0) {
      return dexDiff;
    }

    // Prefer older tokens — more chart history, less "just launched"
    const ageDiff = (a.pairCreatedAt ?? 0) - (b.pairCreatedAt ?? 0);
    if (ageDiff !== 0) {
      return ageDiff;
    }

    return (b.volume?.h1 ?? 0) - (a.volume?.h1 ?? 0);
  })[0];
};

/** @deprecated use fetchTodayLaunches */
export const fetchSolanaTrendingMints = async (limit = 12): Promise<DexPair[]> => {
  const launches = await fetchTodayLaunches(limit);
  return launches.map((l) => l.pair);
};

export type LaunchCandidate = {
  pair: DexPair;
  pumpCoin?: PumpFunCoin;
  source: "pumpfun" | "pumpportal" | "dexscreener";
};

const pumpCoinToDexPair = (coin: PumpFunCoin): DexPair => {
  const ath = coin.ath_market_cap ?? coin.market_cap;
  const dropFromAth = ath > 0 ? ((ath - coin.market_cap) / ath) * 100 : 0;
  const solLiquidity = ((coin.real_sol_reserves ?? 0) / 1_000_000_000) * 200;

  return {
    chainId: SOLANA_CHAIN,
    dexId: coin.complete ? "pumpswap" : "pumpfun",
    pairAddress: coin.bonding_curve,
    pairCreatedAt: coin.created_timestamp,
    baseToken: {
      address: coin.mint,
      name: coin.name,
      symbol: coin.symbol,
    },
    marketCap: coin.market_cap,
    priceUsd: String(coin.market_cap / 1_000_000_000),
    priceChange: {
      h1: dropFromAth,
      m5: dropFromAth > 8 ? -dropFromAth * 0.4 : 8,
    },
    volume: { h1: 3_000, m5: 1_500 },
    liquidity: { usd: Math.max(solLiquidity, 3_000) },
    info: { imageUrl: coin.image_uri },
  };
};

const buildFromPumpCoin = async (
  coin: PumpFunCoin,
  source: LaunchCandidate["source"],
): Promise<LaunchCandidate | null> => {
  if (isBlockedMint(coin.mint)) {
    return null;
  }

  if (Date.now() - coin.created_timestamp < MIN_TOKEN_AGE_MS) {
    return null;
  }

  if (coin.complete) {
    const tokenPairs = await fetchTokenPairs(coin.mint);
    const best =
      pickTodayPair(tokenPairs) ??
      pickTodayPair(tokenPairs, { maxAgeMs: 48 * 60 * 60 * 1000 });

    if (!best) {
      return null;
    }

    return {
      pair: {
        ...best,
        info: { imageUrl: coin.image_uri ?? best.info?.imageUrl },
      },
      pumpCoin: coin,
      source,
    };
  }

  return {
    pair: pumpCoinToDexPair(coin),
    pumpCoin: coin,
    source,
  };
};

export const fetchTodayLaunches = async (
  limit = 20,
  filters: LaunchFilters = {},
): Promise<LaunchCandidate[]> => {
  const results: LaunchCandidate[] = [];
  const seenMints = new Set<string>();

  const addCandidate = (candidate: LaunchCandidate | null) => {
    if (!candidate || results.length >= limit) {
      return;
    }

    const key = normalizeMint(candidate.pair.baseToken.address);
    if (seenMints.has(key)) {
      return;
    }

    seenMints.add(key);
    results.push(candidate);
  };

  // 1. PumpPortal WebSocket — freshest launches (free data API)
  const portalTokens = await collectPumpPortalTokens(10_000, 20);
  for (const token of portalTokens) {
    const coin = await fetchPumpCoinByMint(token.mint);
    if (coin) {
      addCandidate(await buildFromPumpCoin(coin, "pumpportal"));
    }
  }

  // 2. pump.fun portal REST — today's created coins
  const pumpCoins = await fetchRecentPumpCoins(50);
  for (const coin of pumpCoins) {
    addCandidate(await buildFromPumpCoin(coin, "pumpfun"));
  }

  // 3. DexScreener — graduated movers still on pumpswap
  const profiles = await fetchLatestProfiles();
  const sorted = [...profiles].sort((a, b) => {
    const aPump = a.tokenAddress.toLowerCase().endsWith("pump") ? 1 : 0;
    const bPump = b.tokenAddress.toLowerCase().endsWith("pump") ? 1 : 0;
    return bPump - aPump;
  });

  for (const profile of sorted) {
    if (results.length >= limit) {
      break;
    }

    const mintKey = normalizeMint(profile.tokenAddress);
    if (seenMints.has(mintKey)) {
      continue;
    }

    const tokenPairs = await fetchTokenPairs(profile.tokenAddress);
    let best = pickTodayPair(tokenPairs, filters);

    if (!best) {
      best = pickTodayPair(tokenPairs, {
        ...filters,
        maxAgeMs: 48 * 60 * 60 * 1000,
      });
    }

    if (!best) {
      continue;
    }

    seenMints.add(mintKey);
    results.push({
      pair: profile.icon
        ? { ...best, info: { imageUrl: profile.icon } }
        : best,
      source: "dexscreener",
    });
  }

  return results.slice(0, limit);
};

let geckoLastCall = 0;
const GECKO_MIN_GAP_MS = 1_200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForGecko = async () => {
  const elapsed = Date.now() - geckoLastCall;
  if (elapsed < GECKO_MIN_GAP_MS) {
    await sleep(GECKO_MIN_GAP_MS - elapsed);
  }
  geckoLastCall = Date.now();
};

const fetchGeckoCandles = async (poolAddress: string, limit: number): Promise<Candle[]> => {
  await waitForGecko();

  const url = new URL(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddress}/ohlcv/minute`,
  );
  url.searchParams.set("aggregate", "1");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("currency", "usd");

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (res.status === 429) {
      await sleep(2_000 * (attempt + 1));
      continue;
    }

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as GeckoOhlcvResponse;
    const list = data.data?.attributes?.ohlcv_list ?? [];

    return list
      .map(([time, open, high, low, close, volume]) => ({
        time,
        open,
        high,
        low,
        close,
        volume,
      }))
      .sort((a, b) => a.time - b.time);
  }

  return [];
};

const fetchBirdeyeCandles = async (mint: string, limit: number): Promise<Candle[]> => {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    return [];
  }

  const timeTo = Math.floor(Date.now() / 1000);
  const timeFrom = timeTo - limit * 60;

  const url = new URL("https://public-api.birdeye.so/defi/ohlcv");
  url.searchParams.set("address", mint);
  url.searchParams.set("type", "1m");
  url.searchParams.set("time_from", String(timeFrom));
  url.searchParams.set("time_to", String(timeTo));

  const res = await fetch(url.toString(), {
    headers: { "X-API-KEY": apiKey, "x-chain": "solana" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as {
    data?: { items?: Array<{ unixTime: number; o: number; h: number; l: number; c: number; v: number }> };
  };

  return (data.data?.items ?? [])
    .map((item) => ({
      time: item.unixTime,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
    }))
    .sort((a, b) => a.time - b.time);
};

/** Build minute candles from DexScreener data when OHLCV APIs have no data yet */
export const synthesizeCandlesFromPair = (pair: DexPair): Candle[] => {
  if (!pair.pairCreatedAt) {
    return [];
  }

  const endMcap = pair.marketCap ?? 0;
  if (endMcap <= 0) {
    return [];
  }

  const ageMinutes = Math.floor((Date.now() - pair.pairCreatedAt) / 60_000);
  if (ageMinutes < MIN_TOKEN_AGE_MS / 60_000) {
    return [];
  }

  const createdSec = Math.floor(pair.pairCreatedAt / 1000);
  const minutes = Math.min(180, Math.max(90, ageMinutes));
  const athMcap = endMcap * (1.05 + Math.random() * 0.08);
  const floorMcap = endMcap / (1 + Math.abs(pair.priceChange?.h1 ?? 20) / 100);
  const dumping = (pair.priceChange?.m5 ?? 0) < -6;

  return buildMatureChartCandles({
    startSec: createdSec,
    totalMinutes: minutes,
    floorMcap,
    athMcap,
    currentMcap: endMcap,
    dumping,
    baseVolume: pair.volume?.m5 ?? 1_200,
  });
};

/** Build minute candles from pump.fun bonding curve market cap data */
export const synthesizeCandlesFromPumpCoin = (coin: PumpFunCoin): Candle[] => {
  const ageMinutes = Math.floor((Date.now() - coin.created_timestamp) / 60_000);
  if (ageMinutes < MIN_TOKEN_AGE_MS / 60_000) {
    return [];
  }

  const createdSec = Math.floor(coin.created_timestamp / 1000);
  const minutes = Math.min(180, Math.max(90, ageMinutes));
  const ath = coin.ath_market_cap ?? coin.market_cap;
  const current = coin.market_cap;
  const dropFromAth = ath > 0 ? ((ath - current) / ath) * 100 : 0;
  const floorMcap = Math.max(current * 0.55, ath * 0.35);

  return buildMatureChartCandles({
    startSec: createdSec,
    totalMinutes: minutes,
    floorMcap,
    athMcap: ath,
    currentMcap: current,
    dumping: dropFromAth >= 14,
    baseVolume: 2_500,
  });
};

export const fetchLaunchCandles = async (
  candidate: LaunchCandidate,
  limit = CANDLE_FETCH_LIMIT,
): Promise<Candle[]> => {
  const mcap =
    candidate.pair.marketCap ??
    candidate.pumpCoin?.market_cap ??
    candidate.pumpCoin?.ath_market_cap;

  if (candidate.pumpCoin && !candidate.pumpCoin.complete) {
    const pumpSynth = synthesizeCandlesFromPumpCoin(candidate.pumpCoin);
    if (pumpSynth.length >= 25) {
      return candlesToMarketCap(pumpSynth, mcap);
    }
  }

  return fetchPoolCandles(candidate.pair.pairAddress, limit, candidate.pair);
};

export const fetchPoolCandles = async (
  poolAddress: string,
  limit = CANDLE_FETCH_LIMIT,
  pair?: DexPair,
): Promise<Candle[]> => {
  const mcap = pair?.marketCap;

  const gecko = await fetchGeckoCandles(poolAddress, limit);
  if (gecko.length >= 25) {
    return candlesToMarketCap(gecko, mcap);
  }

  if (pair?.baseToken.address) {
    const birdeye = await fetchBirdeyeCandles(pair.baseToken.address, limit);
    if (birdeye.length >= 25) {
      return candlesToMarketCap(birdeye, mcap);
    }
  }

  if (pair) {
    const synthetic = synthesizeCandlesFromPair(pair);
    if (synthetic.length >= 25) {
      return candlesToMarketCap(synthetic, mcap);
    }
  }

  return candlesToMarketCap(gecko, mcap);
};

export type PairMeta = {
  mint: string;
  symbol: string;
  name: string;
  image?: string;
  poolAddress: string;
  pairCreatedAt?: number;
  dexId?: string;
  liquidityUsd?: number;
  marketCap?: number;
};

export const pairToMeta = (pair: DexPair): PairMeta => ({
  mint: pair.baseToken.address,
  symbol: pair.baseToken.symbol,
  name: pair.baseToken.name,
  image: pair.info?.imageUrl,
  poolAddress: pair.pairAddress,
  pairCreatedAt: pair.pairCreatedAt,
  dexId: pair.dexId,
  liquidityUsd: pair.liquidity?.usd,
  marketCap: pair.marketCap,
});
