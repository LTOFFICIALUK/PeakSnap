import { NextResponse } from "next/server";
import { getSessionStats } from "@/lib/deck-service";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const stats = await getSessionStats(sessionId);
  return NextResponse.json(stats);
};
