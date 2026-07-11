import { NextResponse } from "next/server";
import { buildTodayDeck } from "@/lib/deck-service";

export const POST = async (request: Request) => {
  const secret = request.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await buildTodayDeck();

  return NextResponse.json({
    ok: true,
    deckDate: result.deck?.deckDate,
    cardCount: result.deck?.cards.length ?? 0,
    created: result.created,
    scanned: result.scanned,
    skipped: result.skipped,
  });
};
