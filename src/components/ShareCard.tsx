"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import type { ChallengeState } from "@/lib/challenge-service";
import { buildShareText } from "@/lib/challenge-service";
import { getDisplayName, setDisplayName } from "@/lib/session";

type ShareCardProps = {
  state: ChallengeState;
  onNameSave?: (name: string) => void;
};

const ShareCard = ({ state, onNameSave }: ShareCardProps) => {
  const [name, setName] = useState(getDisplayName());
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(() => {
    const withName = { ...state, displayName: name };
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return buildShareText(withName, `${origin}/drill`);
  }, [state, name]);

  const handleCopy = async () => {
    setDisplayName(name);
    onNameSave?.(name);
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    setDisplayName(name);
    onNameSave?.(name);

    if (navigator.share) {
      try {
        await navigator.share({
          title: "PeakSnap Daily Challenge",
          text: shareText,
          url: `${window.location.origin}/drill`,
        });
        return;
      } catch {
        // fall through to copy
      }
    }

    await handleCopy();
  };

  const { today, dayStreak } = state;

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-[#23232a] bg-[#08080a]/60 px-5 py-6 text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#6b6b78]">
          Daily challenge complete
        </p>
        <p className="mt-3 font-mono text-4xl font-semibold text-[#14f195]">
          {today.correct}/{today.total}
        </p>
        <p className="mt-2 text-sm text-[#a8a8b5]">correct reads today</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
          {today.rank && (
            <span className="tag px-2 py-1 text-[#e8e8ef]">
              #{today.rank} of {today.players}
            </span>
          )}
          {today.percentile !== null && today.players > 1 && (
            <span className="tag px-2 py-1 text-[#ffb347]">
              beat {today.percentile}% of players
            </span>
          )}
          {dayStreak > 0 && (
            <span className="tag px-2 py-1 text-[#14f195]">{dayStreak}-day streak</span>
          )}
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <label className="block">
          <span className="mb-2 block font-mono text-xs text-[#6b6b78]">Leaderboard name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full border border-[#23232a] bg-[#08080a] px-3 py-2 font-mono text-sm text-[#e8e8ef] outline-none focus:border-[#14f195]/40"
            placeholder="Anon"
            aria-label="Display name for leaderboard"
          />
        </label>

        <pre className="overflow-x-auto rounded border border-[#23232a] bg-[#08080a] p-3 font-mono text-[0.65rem] leading-relaxed text-[#a8a8b5] whitespace-pre-wrap">
          {shareText}
        </pre>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex items-center justify-center gap-2 border border-[#23232a] bg-[#08080a] px-4 py-3 font-mono text-sm text-[#e8e8ef] transition-colors hover:border-[#14f195]/40 hover:text-[#14f195]"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="btn-primary flex items-center justify-center gap-2 px-4 py-3 font-mono text-sm"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
