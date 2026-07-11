import type { Metadata } from "next";
import { cookies } from "next/headers";
import DeckApp from "@/components/DeckApp";
import SiteHeader from "@/components/marketing/SiteHeader";
import { getChallengeState } from "@/lib/challenge-service";
import { getDeckPayloadWithEnsure } from "@/lib/deck-payload";
import { SITE } from "@/lib/site";

const SESSION_KEY = "peaksnap-session";

export const metadata: Metadata = {
  title: `Daily challenge — ${SITE.name}`,
  description: "Today's Solana memecoin reversal challenge. Score, streak, leaderboard.",
};

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const DrillPage = async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_KEY)?.value ?? "";

  const [initialData, initialChallenge] = await Promise.all([
    getDeckPayloadWithEnsure(sessionId),
    sessionId ? getChallengeState(sessionId) : Promise.resolve(null),
  ]);

  return (
    <>
      <SiteHeader variant="app" />
      <DeckApp initialData={initialData} initialChallenge={initialChallenge} />
    </>
  );
};

export default DrillPage;
