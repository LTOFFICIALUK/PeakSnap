import { fetchLaunchCandles, fetchTodayLaunches } from "../src/lib/market-data";
import { detectScenario } from "../src/lib/reversal";

const main = async () => {
  const launches = await fetchTodayLaunches(10);

  for (const launch of launches) {
    const candles = await fetchLaunchCandles(launch, 150);
    const scenario = detectScenario(candles);
    console.log(
      `[${launch.source}] ${launch.pair.baseToken.symbol}`,
      "| candles:", candles.length,
      "| scenario:", scenario?.correctChoice ?? "NONE",
      scenario ? `(${scenario.patternTag})` : "",
    );
  }
};

main().catch(console.error);
