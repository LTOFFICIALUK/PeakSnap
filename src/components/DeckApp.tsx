"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Crosshair, Flame, Loader2, Target, Zap } from "lucide-react";
import ChartReplay from "./ChartReplay";
import type { DeckPayload } from "@/lib/deck-payload";

type GuessResult = {
  correct: boolean;
  dropAfterPct: number;
  gainAfterPct: number;
  correctChoice: string;
  peakGainPct: number;
  patternTag: string;
  choice: string;
};

type DeckAppProps = {
  initialData: DeckPayload;
  initialStats: { correct: number; total: number; accuracy: number; streak: number };
};

const SESSION_KEY = "peaksnap-session";

const getSessionId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    document.cookie = `${SESSION_KEY}=${existing}; path=/; max-age=31536000; samesite=lax`;
    return existing;
  }

  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  document.cookie = `${SESSION_KEY}=${id}; path=/; max-age=31536000; samesite=lax`;
  return id;
};

const formatTag = (tag: string) => tag.replaceAll("_", " ");

const DeckApp = ({
  initialData = { deck: null, cards: [], progress: null, status: "empty" },
  initialStats = { correct: 0, total: 0, accuracy: 0, streak: 0 },
}: DeckAppProps) => {
  const [data, setData] = useState(initialData);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(() =>
    initialData.status === "ready" && initialData.cards.length > 0 ? "idle" : "loading",
  );
  const [loadMessage, setLoadMessage] = useState(initialData.message ?? "");
  const [activeIndex, setActiveIndex] = useState(() => {
    const firstOpen = initialData.cards.findIndex((card) => !card.guessed);
    return firstOpen === -1 ? 0 : firstOpen;
  });
  const [phase, setPhase] = useState<"guess" | "replaying" | "result">("guess");
  const [result, setResult] = useState<GuessResult | null>(null);
  const resultRef = useRef<GuessResult | null>(null);
  const [stats, setStats] = useState(initialStats);

  const refreshStats = useCallback(async () => {
    const res = await fetch(`/api/stats?sessionId=${getSessionId()}`);
    const json = await res.json();
    setStats(json);
  }, []);

  const refreshDeck = useCallback(async (ensure = true) => {
    setLoadState("loading");
    const sessionId = getSessionId();
    const url = ensure
      ? `/api/deck?sessionId=${sessionId}&ensure=1`
      : `/api/deck?sessionId=${sessionId}`;

    const res = await fetch(url);
    const json = (await res.json()) as DeckPayload;

    setData(json);

    if (json.status === "ready" && json.cards.length > 0) {
      setLoadState("idle");
      setLoadMessage("");
      const firstOpen = json.cards.findIndex((card) => !card.guessed);
      setActiveIndex(firstOpen === -1 ? 0 : firstOpen);
      return true;
    }

    setLoadState(json.status === "error" ? "error" : "loading");
    setLoadMessage(json.message ?? "Building today's deck from live launches…");
    return false;
  }, []);

  useEffect(() => {
    if (initialData.status === "ready" && initialData.cards.length > 0) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const tryLoad = async () => {
      if (cancelled) {
        return;
      }

      attempts += 1;
      const ready = await refreshDeck(attempts === 1);

      if (ready || cancelled) {
        return;
      }

      if (attempts < 8) {
        window.setTimeout(tryLoad, 5000);
      } else {
        setLoadState("error");
      }
    };

    void tryLoad();

    return () => {
      cancelled = true;
    };
  }, [initialData.status, initialData.cards.length, refreshDeck]);

  const card = data.cards[activeIndex];
  const revealToken = phase !== "guess" || card?.guessed === true;
  const progressPct = useMemo(() => {
    if (!data.progress?.total) {
      return 0;
    }
    return Math.round((data.progress.completed / data.progress.total) * 100);
  }, [data]);

  const handleGuess = async (choice: "EXIT" | "HOLD") => {
    if (!card || phase !== "guess") {
      return;
    }

    const res = await fetch(`/api/cards/${card.id}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getSessionId(), choice }),
    });

    const json = (await res.json()) as { result: GuessResult };
    resultRef.current = json.result;
    setResult(json.result);
    setPhase("replaying");
  };

  const handleReplayComplete = useCallback(() => {
    const guessResult = resultRef.current;
    setPhase("result");
    void refreshStats();

    setData((current) => {
      if (!current.progress || !guessResult) {
        return current;
      }

      const wasGuessed = current.cards[activeIndex]?.guessed ?? false;

      return {
        ...current,
        progress: {
          ...current.progress,
          completed: current.progress.completed + (wasGuessed ? 0 : 1),
        },
        cards: current.cards.map((c, i) =>
          i === activeIndex
            ? {
                ...c,
                guessed: true,
                guess: { choice: guessResult.choice, correct: guessResult.correct },
              }
            : c,
        ),
      };
    });
  }, [activeIndex, refreshStats]);

  const handleNext = () => {
    const next = data.cards.findIndex((c, i) => i > activeIndex && !c.guessed);
    if (next !== -1) {
      setActiveIndex(next);
      setPhase("guess");
      resultRef.current = null;
      setResult(null);
      return;
    }

    const wrap = data.cards.findIndex((c) => !c.guessed);
    if (wrap !== -1) {
      setActiveIndex(wrap);
      setPhase("guess");
      resultRef.current = null;
      setResult(null);
    }
  };

  if (!data.deck || !card) {
    const isDbError = loadMessage.includes("DATABASE_URL") || loadMessage.includes("migrate");

    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        {loadState === "loading" ? (
          <Loader2 className="h-8 w-8 animate-spin text-[#14f195]" aria-hidden />
        ) : (
          <Crosshair className="h-8 w-8 text-[#14f195]" aria-hidden />
        )}
        <p className="text-lg font-medium">
          {loadState === "loading" ? "Loading today's deck" : "Deck unavailable"}
        </p>
        <p className="text-sm text-[#6b6b78]">
          {loadMessage ||
            (loadState === "loading"
              ? "Pulling live Solana launches from Pump.fun and DexScreener…"
              : "Could not build today's reversal drills.")}
        </p>
        {isDbError && (
          <p className="font-mono text-xs text-[#a8a8b5]">
            Or run <code className="text-[#e8e8ef]">npm run db:seed</code> for offline demo cards.
          </p>
        )}
        {loadState !== "loading" && (
          <button
            type="button"
            onClick={() => void refreshDeck(true)}
            className="mt-2 border border-[#23232a] bg-[#08080a] px-4 py-2 font-mono text-sm text-[#e8e8ef] transition-colors hover:border-[#14f195]/40 hover:text-[#14f195]"
            aria-label="Retry loading deck"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#6b6b78]">
            daily deck · {data.deck.deckDate}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Reversal drill
          </h1>
        </div>
        <div className="flex gap-3 font-mono text-xs">
          <div className="panel px-3 py-2">
            <span className="text-[#6b6b78]">acc</span>{" "}
            <span className="text-[#14f195]">{stats.accuracy}%</span>
          </div>
          <div className="panel px-3 py-2">
            <span className="text-[#6b6b78]">streak</span>{" "}
            <span className="text-[#e8e8ef]">{stats.streak}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between font-mono text-xs text-[#6b6b78]">
          <span>
            card {activeIndex + 1} / {data.cards.length}
          </span>
          <span>{progressPct}% deck</span>
        </div>
        <div className="progress-track h-1 w-full">
          <div className="progress-fill h-1 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <main className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#23232a] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center border border-[#23232a] bg-[#08080a] font-mono text-xs font-semibold text-[#14f195] transition-all duration-300 ${revealToken ? "" : "blur-sm"}`}
              aria-hidden
            >
              {revealToken ? card.tokenSymbol.slice(0, 2) : "??"}
            </div>
            <div className="min-w-0">
              <p
                className={`font-mono text-sm font-semibold transition-all duration-300 ${revealToken ? "" : "blur-md"}`}
                aria-label={revealToken ? `Token ${card.tokenSymbol}` : "Token name hidden until reveal"}
              >
                {revealToken ? card.tokenSymbol : "????"}
              </p>
              <p
                className={`text-xs text-[#6b6b78] transition-all duration-300 ${revealToken ? "" : "blur-md"}`}
              >
                {revealToken ? (card.tokenName ?? "Unknown") : "Revealed after your call"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="tag px-2 py-1 text-[#6b6b78]">{formatTag(card.patternTag)}</span>
            <span className="tag flex items-center gap-1 px-2 py-1 text-[#ffb347]">
              <Flame className="h-3 w-3" aria-hidden />
              +{card.peakGainPct}%
            </span>
          </div>
        </div>

        <div className="border-b border-[#23232a] px-2 py-2 sm:px-4">
          <ChartReplay
            key={`${card.id}-${phase === "guess" ? "guess" : "played"}`}
            cardId={card.id}
            visibleCandles={card.visibleCandles}
            replayCandles={card.replayCandles}
            freezeTimestamp={card.freezeTimestamp}
            isReplaying={phase === "replaying"}
            onReplayComplete={handleReplayComplete}
          />
        </div>

        <div className="px-4 py-5 sm:px-5">
          {phase === "guess" && (
            <>
              <p className="mb-4 text-sm text-[#a8a8b5]">
                Chart is frozen one candle before the top. Would you{" "}
                <span className="text-[#ffb3c1]">exit</span> or{" "}
                <span className="text-[#a5e8ff]">hold</span>?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleGuess("EXIT")}
                  className="btn-exit flex items-center justify-center gap-2 px-4 py-3 font-mono text-sm font-medium transition-colors"
                  aria-label="Exit position"
                >
                  <Target className="h-4 w-4" aria-hidden />
                  Exit
                </button>
                <button
                  type="button"
                  onClick={() => handleGuess("HOLD")}
                  className="btn-hold flex items-center justify-center gap-2 px-4 py-3 font-mono text-sm font-medium transition-colors"
                  aria-label="Hold position"
                >
                  <Zap className="h-4 w-4" aria-hidden />
                  Hold
                </button>
              </div>
            </>
          )}

          {phase === "replaying" && (
            <p className="font-mono text-sm text-[#38bdf8]">Replaying what happened next…</p>
          )}

          {phase === "result" && result && (
            <div className="space-y-4">
              <p
                className={`font-mono text-sm ${result.correct ? "text-[#14f195]" : "text-[#ff4d6d]"}`}
              >
                {result.correct ? "Correct read." : "Wrong read."}{" "}
                {result.correctChoice === "EXIT" ? (
                  <>Price dumped {result.dropAfterPct}% after the freeze.</>
                ) : (
                  <>Holding was right — price gained {result.gainAfterPct}% after.</>
                )}
              </p>
              <p className="text-xs text-[#6b6b78]">
                Pattern: {formatTag(result.patternTag)} · Pump was +{result.peakGainPct}% before top
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="flex w-full items-center justify-center gap-2 border border-[#23232a] bg-[#08080a] px-4 py-3 font-mono text-sm text-[#e8e8ef] transition-colors hover:border-[#14f195]/40 hover:text-[#14f195]"
                aria-label="Next card"
              >
                Next card
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </main>

      <p className="mt-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#4a4a55]">
        educational simulation · not financial advice
      </p>
    </div>
  );
};

export default DeckApp;
