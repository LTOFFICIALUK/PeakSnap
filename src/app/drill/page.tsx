import type { Metadata } from "next";
import { cookies } from "next/headers";
import DeckApp from "@/components/DeckApp";
import SiteHeader from "@/components/marketing/SiteHeader";
import { getDeckPayloadWithEnsure } from "@/lib/deck-payload";
import { getSessionStats } from "@/lib/deck-service";
import { SITE } from "@/lib/site";

const SESSION_KEY = "peaksnap-session";

export const metadata: Metadata = {
  title: `Daily drill — ${SITE.name}`,
  description: "Today's Solana memecoin reversal deck. Freeze, guess, replay.",
};

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const DrillPage = async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_KEY)?.value ?? "";
  const [initialData, initialStats] = await Promise.all([
    getDeckPayloadWithEnsure(sessionId),
    sessionId
      ? getSessionStats(sessionId)
      : Promise.resolve({ correct: 0, total: 0, accuracy: 0, streak: 0 }),
  ]);

  return (
    <>
      <SiteHeader variant="app" />
      <DeckApp initialData={initialData} initialStats={initialStats} />
    </>
  );
};

export default DrillPage;
