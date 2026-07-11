"use client";

import type { LeaderboardEntry } from "@/lib/challenge-service";

type LeaderboardProps = {
  entries: LeaderboardEntry[];
  players: number;
  deckDate: string;
};

const Leaderboard = ({ entries, players, deckDate }: LeaderboardProps) => {
  return (
    <aside className="panel p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#6b6b78]">
            Leaderboard
          </p>
          <p className="mt-1 font-mono text-sm text-[#e8e8ef]">{deckDate}</p>
        </div>
        <span className="tag px-2 py-1 text-[#6b6b78]">{players} players</span>
      </div>

      {entries.length === 0 ? (
        <p className="font-mono text-xs text-[#6b6b78]">
          Be the first to finish today&apos;s challenge.
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry) => (
            <li
              key={`${entry.rank}-${entry.displayName}`}
              className={`flex items-center justify-between rounded border px-3 py-2 font-mono text-xs ${
                entry.isYou
                  ? "border-[#14f195]/40 bg-[#14f195]/5 text-[#e8e8ef]"
                  : "border-[#23232a] bg-[#08080a]/40 text-[#a8a8b5]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-5 text-[#6b6b78]">#{entry.rank}</span>
                <span className={entry.isYou ? "text-[#14f195]" : ""}>{entry.displayName}</span>
              </span>
              <span>
                {entry.correct}/{entry.total}
              </span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
};

export default Leaderboard;
