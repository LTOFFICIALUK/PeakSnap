import { NextResponse } from "next/server";
import { getDeckPayload, getDeckPayloadWithEnsure } from "@/lib/deck-payload";
import { ensureTodayDeck } from "@/lib/deck-service";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") ?? "";
  const ensure = searchParams.get("ensure") === "1";

  const payload = ensure
    ? await getDeckPayloadWithEnsure(sessionId)
    : await getDeckPayload(sessionId);

  return NextResponse.json(payload);
};

export const POST = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") ?? "";

  await ensureTodayDeck();
  const payload = await getDeckPayload(sessionId);

  return NextResponse.json(payload);
};
