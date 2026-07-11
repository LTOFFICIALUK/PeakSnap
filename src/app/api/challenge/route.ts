import { NextResponse } from "next/server";
import { getChallengeState, recordDailyRun } from "@/lib/challenge-service";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") ?? "";
  const displayName = searchParams.get("displayName") ?? "Anon";

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const state = await getChallengeState(sessionId, displayName);
  if (!state) {
    return NextResponse.json({ error: "No deck today" }, { status: 404 });
  }

  return NextResponse.json(state);
};

export const POST = async (request: Request) => {
  const body = (await request.json()) as {
    sessionId?: string;
    displayName?: string;
  };

  if (!body.sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const result = await recordDailyRun(body.sessionId, body.displayName ?? "Anon");
  if (!result) {
    return NextResponse.json({ error: "Challenge not complete" }, { status: 400 });
  }

  const state = await getChallengeState(body.sessionId, body.displayName ?? "Anon");
  return NextResponse.json({ result, state });
};
