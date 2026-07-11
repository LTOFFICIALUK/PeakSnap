/** Runtime env helpers for Vercel vs local deck builder */

/** Live deck build uses PumpPortal WebSocket — runs on your PC, not Vercel serverless */
export const canBuildLiveDeck = (): boolean => {
  if (process.env.SKIP_LIVE_BUILD === "true") {
    return false;
  }

  if (process.env.VERCEL === "1") {
    return false;
  }

  return true;
};

export const isProductionDeploy = (): boolean => process.env.VERCEL === "1";
