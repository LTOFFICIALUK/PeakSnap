import WebSocket from "ws";

export type PumpPortalToken = {
  mint: string;
  name?: string;
  symbol?: string;
  uri?: string;
  timestamp?: number;
};

type PortalMessage = {
  mint?: string;
  name?: string;
  symbol?: string;
  uri?: string;
  signature?: string;
  traderPublicKey?: string;
  txType?: string;
};

/** Collect fresh mints from PumpPortal free WebSocket (subscribeNewToken) */
export const collectPumpPortalTokens = async (
  durationMs = 10_000,
  maxTokens = 25,
): Promise<PumpPortalToken[]> => {
  return new Promise((resolve) => {
    const tokens: PumpPortalToken[] = [];
    const seen = new Set<string>();

    const ws = new WebSocket("wss://pumpportal.fun/api/data");
    const timeout = setTimeout(() => {
      ws.close();
      resolve(tokens);
    }, durationMs);

    ws.on("open", () => {
      ws.send(JSON.stringify({ method: "subscribeNewToken" }));
    });

    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString()) as PortalMessage;
        const mint = data.mint;
        if (!mint || seen.has(mint)) {
          return;
        }

        seen.add(mint);
        tokens.push({
          mint,
          name: data.name,
          symbol: data.symbol,
          uri: data.uri,
          timestamp: Date.now(),
        });

        if (tokens.length >= maxTokens) {
          clearTimeout(timeout);
          ws.close();
          resolve(tokens);
        }
      } catch {
        // ignore malformed frames
      }
    });

    ws.on("error", () => {
      clearTimeout(timeout);
      resolve(tokens);
    });

    ws.on("close", () => {
      clearTimeout(timeout);
      resolve(tokens);
    });
  });
};
