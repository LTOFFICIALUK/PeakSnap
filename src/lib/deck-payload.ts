import { prisma } from "./db";
import { repairLegacyCandles } from "./chart-format";
import {
  ensureTodayDeck,
  MIN_DECK_CARDS,
  parseCandles,
  todayDeckKey,
} from "./deck-service";
import { splitCandlesAtFreeze } from "./reversal";

export type DeckCardPayload = {
  id: string;
  sortOrder: number;
  tokenSymbol: string;
  tokenName: string | null;
  tokenImage: string | null;
  patternTag: string;
  peakGainPct: number;
  dropAfterPct: number;
  freezeTimestamp: number;
  visibleCandles: ReturnType<typeof splitCandlesAtFreeze>["visible"];
  replayCandles: ReturnType<typeof splitCandlesAtFreeze>["hidden"];
  guessed: boolean;
  guess: { choice: string; correct: boolean } | null;
};

export type DeckStatus = "ready" | "building" | "empty" | "error";

export type DeckPayload = {
  deck: { id: string; deckDate: string } | null;
  cards: DeckCardPayload[];
  progress: { completed: number; total: number } | null;
  status: DeckStatus;
  message?: string;
};

const emptyPayload = (status: DeckStatus, message?: string): DeckPayload => ({
  deck: null,
  cards: [],
  progress: null,
  status,
  message,
});

export const getDeckPayload = async (sessionId = ""): Promise<DeckPayload> => {
  const deckDate = todayDeckKey();
  const deck = await prisma.deck.findUnique({
    where: { deckDate },
    include: { cards: { orderBy: { sortOrder: "asc" } } },
  });

  if (!deck) {
    return emptyPayload("empty");
  }

  const guesses = sessionId
    ? await prisma.guess.findMany({
        where: { sessionId, card: { deckId: deck.id } },
      })
    : [];

  const guessedIds = new Set(guesses.map((g) => g.cardId));

  const cards = deck.cards.map((card) => {
    const candles = repairLegacyCandles(parseCandles(card.candlesJson));
    const { visible, hidden } = splitCandlesAtFreeze(candles, card.freezeTimestamp);

    return {
      id: card.id,
      sortOrder: card.sortOrder,
      tokenSymbol: card.tokenSymbol,
      tokenName: card.tokenName,
      tokenImage: card.tokenImage,
      patternTag: card.patternTag,
      peakGainPct: card.peakGainPct,
      dropAfterPct: card.dropAfterPct,
      freezeTimestamp: card.freezeTimestamp,
      visibleCandles: visible,
      replayCandles: hidden,
      guessed: guessedIds.has(card.id),
      guess: guesses.find((g) => g.cardId === card.id) ?? null,
    };
  });

  const completed = cards.filter((c) => c.guessed).length;

  return {
    deck: { id: deck.id, deckDate: deck.deckDate },
    cards,
    progress: {
      completed,
      total: cards.length,
    },
    status: cards.length >= MIN_DECK_CARDS ? "ready" : "empty",
  };
};

export const getDeckPayloadWithEnsure = async (sessionId = ""): Promise<DeckPayload> => {
  try {
    const current = await getDeckPayload(sessionId);

    if (current.cards.length >= MIN_DECK_CARDS) {
      return { ...current, status: "ready" };
    }

    const ensured = await ensureTodayDeck();
    const refreshed = await getDeckPayload(sessionId);

    if (refreshed.cards.length >= MIN_DECK_CARDS) {
      return { ...refreshed, status: "ready" };
    }

    if (ensured.reason === "db_error") {
      return emptyPayload(
        "error",
        "Database not ready. Run `npx prisma migrate dev` in reversal-snap and check DATABASE_URL in .env.",
      );
    }

    return emptyPayload(
      "empty",
      "No reversal drills from today's launches yet. APIs may be quiet — retry in a minute.",
    );
  } catch (error) {
    return emptyPayload(
      "error",
      error instanceof Error ? error.message : "Could not load today's deck.",
    );
  }
};
