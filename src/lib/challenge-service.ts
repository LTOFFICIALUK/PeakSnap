import { prisma } from "./db";
import { todayDeckKey } from "./deck-service";

export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  correct: number;
  total: number;
  isYou: boolean;
};

export type ChallengeState = {
  deckDate: string;
  today: {
    correct: number;
    total: number;
    completed: boolean;
    rank: number | null;
    percentile: number | null;
    players: number;
  };
  dayStreak: number;
  displayName: string;
  leaderboard: LeaderboardEntry[];
};

const previousDay = (date: string): string => {
  const d = new Date(`${date}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const computeDayStreak = (completedDates: Set<string>, today: string): number => {
  if (!completedDates.size) {
    return 0;
  }

  let cursor = completedDates.has(today) ? today : previousDay(today);
  if (!completedDates.has(cursor)) {
    return 0;
  }

  let streak = 0;
  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = previousDay(cursor);
  }

  return streak;
};

const sanitizeDisplayName = (name: string): string => {
  const trimmed = name.trim().slice(0, 20);
  return trimmed.length > 0 ? trimmed : "Anon";
};

export const recordDailyRun = async (
  sessionId: string,
  displayName = "Anon",
): Promise<{ correct: number; total: number } | null> => {
  const deckDate = todayDeckKey();
  const deck = await prisma.deck.findUnique({
    where: { deckDate },
    include: { cards: true },
  });

  if (!deck || deck.cards.length === 0) {
    return null;
  }

  const cardIds = deck.cards.map((c) => c.id);
  const guesses = await prisma.guess.findMany({
    where: { sessionId, cardId: { in: cardIds } },
  });

  if (guesses.length < deck.cards.length) {
    return null;
  }

  const correct = guesses.filter((g) => g.correct).length;
  const total = deck.cards.length;
  const name = sanitizeDisplayName(displayName);

  await prisma.dailyRun.upsert({
    where: {
      deckId_sessionId: { deckId: deck.id, sessionId },
    },
    create: {
      deckId: deck.id,
      deckDate,
      sessionId,
      displayName: name,
      correct,
      total,
    },
    update: {
      displayName: name,
      correct,
      total,
      completedAt: new Date(),
    },
  });

  return { correct, total };
};

const getRankForRun = async (
  deckDate: string,
  correct: number,
  completedAt: Date,
  sessionId: string,
): Promise<{ rank: number; players: number; percentile: number }> => {
  const runs = await prisma.dailyRun.findMany({
    where: { deckDate },
    orderBy: [{ correct: "desc" }, { completedAt: "asc" }],
  });

  const players = runs.length;
  const rank = runs.findIndex((r) => r.sessionId === sessionId) + 1;

  if (rank <= 0) {
    return { rank: 0, players, percentile: 0 };
  }

  const percentile =
    players > 1 ? Math.round(((players - rank) / (players - 1)) * 100) : 100;

  return { rank, players, percentile };
};

export const getChallengeState = async (
  sessionId: string,
  displayName = "Anon",
): Promise<ChallengeState | null> => {
  const deckDate = todayDeckKey();
  const deck = await prisma.deck.findUnique({
    where: { deckDate },
    include: { cards: true },
  });

  if (!deck) {
    return null;
  }

  const total = deck.cards.length;
  const cardIds = deck.cards.map((c) => c.id);

  const [guesses, todayRun, allRuns, leaderboardRuns] = await Promise.all([
    sessionId
      ? prisma.guess.findMany({ where: { sessionId, cardId: { in: cardIds } } })
      : Promise.resolve([]),
    sessionId
      ? prisma.dailyRun.findUnique({
          where: { deckId_sessionId: { deckId: deck.id, sessionId } },
        })
      : Promise.resolve(null),
    sessionId
      ? prisma.dailyRun.findMany({
          where: { sessionId },
          select: { deckDate: true },
        })
      : Promise.resolve([]),
    prisma.dailyRun.findMany({
      where: { deckDate },
      orderBy: [{ correct: "desc" }, { completedAt: "asc" }],
      take: 10,
    }),
  ]);

  const correct = todayRun?.correct ?? guesses.filter((g) => g.correct).length;
  const completed = Boolean(todayRun) || guesses.length >= total;

  let rank: number | null = null;
  let percentile: number | null = null;
  let players = 0;

  if (todayRun && sessionId) {
    const rankData = await getRankForRun(
      deckDate,
      todayRun.correct,
      todayRun.completedAt,
      sessionId,
    );
    rank = rankData.rank;
    percentile = rankData.percentile;
    players = rankData.players;
  } else {
    players = await prisma.dailyRun.count({ where: { deckDate } });
  }

  const completedDates = new Set(allRuns.map((r) => r.deckDate));
  if (completed && !completedDates.has(deckDate)) {
    completedDates.add(deckDate);
  }

  const leaderboard: LeaderboardEntry[] = leaderboardRuns.map((run, i) => ({
    rank: i + 1,
    displayName: run.displayName,
    correct: run.correct,
    total: run.total,
    isYou: run.sessionId === sessionId,
  }));

  return {
    deckDate,
    today: {
      correct,
      total,
      completed,
      rank,
      percentile,
      players,
    },
    dayStreak: sessionId ? computeDayStreak(completedDates, deckDate) : 0,
    displayName: sanitizeDisplayName(todayRun?.displayName ?? displayName),
    leaderboard,
  };
};

export const buildShareText = (
  state: ChallengeState,
  siteUrl = "https://peaksnap.vercel.app/drill",
): string => {
  const { today, dayStreak, deckDate } = state;
  const score = `${today.correct}/${today.total}`;
  const rankLine =
    today.rank && today.players > 1
      ? ` · #${today.rank} of ${today.players}`
      : today.players > 0
        ? ` · ${today.players} players today`
        : "";
  const streakLine = dayStreak > 0 ? ` · ${dayStreak}-day streak` : "";

  return `PeakSnap Daily Challenge · ${deckDate}\n${score} correct${rankLine}${streakLine}\n${siteUrl}`;
};
