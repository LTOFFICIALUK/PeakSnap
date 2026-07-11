import { fetchTodayLaunches } from "../src/lib/market-data";

const main = async () => {
  const launches = await fetchTodayLaunches(12);
  console.log(`found ${launches.length} launches`);
  for (const launch of launches) {
    const p = launch.pair;
    const ageH = p.pairCreatedAt
      ? ((Date.now() - p.pairCreatedAt) / 3_600_000).toFixed(1)
      : "?";
    console.log(
      `[${launch.source}] ${p.baseToken.symbol} · ${p.dexId} · mcap $${Math.round(p.marketCap ?? 0)} · ${ageH}h old`,
    );
  }
};

main().catch(console.error);
