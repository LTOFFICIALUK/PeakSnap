import { prisma } from "./db";
import { canBuildLiveDeck } from "./env";
import { detectScenario, type Candle } from "./reversal";
import {
  fetchLaunchCandles,
  fetchTodayLaunches,
  pairToMeta,
} from "./market-data";

export const TARGET_DECK_SIZE = 10;
export const MIN_DECK_CARDS = 1;

const DECK_SIZE = TARGET_DECK_SIZE;

export type DeckEnsureResult = {
  ok: boolean;
  cardCount: number;
  reason: "ready" | "built" | "partial" | "no_launches" | "db_error";
  error?: string;
};

let ensureInFlight: Promise<DeckEnsureResult> | null = null;

export const todayDeckKey = (): string => {
  return new Date().toISOString().slice(0, 10);
};

export const ensureTodayDeck = async (): Promise<DeckEnsureResult> => {
  if (ensureInFlight) {
    return ensureInFlight;
  }

  ensureInFlight = (async () => {
    try {
      const existing = await getDeckForToday();
      const existingCount = existing?.cards.length ?? 0;

      if (existing && existingCount >= TARGET_DECK_SIZE) {
        return {
          ok: true,
          cardCount: existingCount,
          reason: "ready",
        };
      }

      if (!canBuildLiveDeck()) {
        return {
          ok: existingCount >= MIN_DECK_CARDS,
          cardCount: existingCount,
          reason: existingCount >= MIN_DECK_CARDS ? "ready" : "no_launches",
        };
      }

      const result = await buildTodayDeck();
      const cardCount = result.deck?.cards.length ?? 0;

      if (cardCount >= MIN_DECK_CARDS) {
        return {
          ok: true,
          cardCount,
          reason: existing?.cards.length ? "partial" : "built",
        };
      }

      return { ok: false, cardCount: 0, reason: "no_launches" };
    } catch (error) {
      return {
        ok: false,
        cardCount: 0,
        reason: "db_error",
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      ensureInFlight = null;
    }
  })();

  return ensureInFlight;
};

export const buildTodayDeck = async () => {
  const deckDate = todayDeckKey();
  const existing = await prisma.deck.findUnique({
    where: { deckDate },
    include: { cards: true },
  });

  if (existing && existing.cards.length >= DECK_SIZE) {
    return { deck: existing, created: 0, skipped: existing.cards.length };
  }

  const deck =
    existing ??
    (await prisma.deck.create({
      data: { deckDate },
    }));

  const launches = await fetchTodayLaunches(40);
  let created = 0;
  let scanned = 0;

  for (const launch of launches) {
    scanned += 1;
    if (created + (existing?.cards.length ?? 0) >= DECK_SIZE) {
      break;
    }

    const pair = launch.pair;
    const meta = pairToMeta(pair);
    const candles = await fetchLaunchCandles(launch, 220);

    if (candles.length < 50) {
      continue;
    }

    const scenario = detectScenario(candles);

    if (!scenario) {
      continue;
    }

    const existingCards = await prisma.card.findMany({ where: { deckId: deck.id } });
    const exitCount = existingCards.filter((c) => c.correctChoice === "EXIT").length;
    const holdCount = existingCards.filter((c) => c.correctChoice === "HOLD").length;
    const targetEach = Math.ceil(DECK_SIZE / 2);

    // Balance EXIT/HOLD once we have enough cards; fill freely when deck is thin
    if (existingCards.length >= 4) {
      if (scenario.correctChoice === "EXIT" && exitCount >= targetEach) {
        continue;
      }
      if (scenario.correctChoice === "HOLD" && holdCount >= targetEach) {
        continue;
      }
    }

    const duplicate = await prisma.card.findFirst({
      where: { deckId: deck.id, tokenMint: meta.mint },
    });

    if (duplicate) {
      continue;
    }

    const sortOrder = existingCards.length;

    await prisma.card.create({
      data: {
        deckId: deck.id,
        sortOrder,
        tokenMint: meta.mint,
        tokenSymbol: meta.symbol,
        tokenName: meta.name,
        tokenImage: meta.image,
        poolAddress: meta.poolAddress,
        freezeTimestamp: scenario.freezeTimestamp,
        patternTag: scenario.patternTag,
        peakGainPct: scenario.peakGainPct,
        dropAfterPct: scenario.dropAfterPct,
        gainAfterPct: scenario.gainAfterPct,
        correctChoice: scenario.correctChoice,
        candlesJson: JSON.stringify(candles),
      },
    });

    created += 1;
  }

  const refreshed = await prisma.deck.findUnique({
    where: { id: deck.id },
    include: { cards: { orderBy: { sortOrder: "asc" } } },
  });

  return {
    deck: refreshed,
    created,
    scanned,
    skipped: scanned - created,
  };
};

export const getDeckForToday = async () => {
  const deckDate = todayDeckKey();
  return prisma.deck.findUnique({
    where: { deckDate },
    include: { cards: { orderBy: { sortOrder: "asc" } } },
  });
};

export const parseCandles = (raw: string): Candle[] => {
  return JSON.parse(raw) as Candle[];
};

export const getSessionStats = async (sessionId: string) => {
  const guesses = await prisma.guess.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
  });

  const correct = guesses.filter((g) => g.correct).length;
  const total = guesses.length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  return { correct, total, accuracy, streak: computeStreak(guesses) };
};

const computeStreak = (guesses: Array<{ correct: boolean }>) => {
  let streak = 0;
  for (const guess of guesses) {
    if (!guess.correct) {
      break;
    }
    streak += 1;
  }
  return streak;
};
