import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isChoiceCorrect } from "@/lib/reversal";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = async (request: Request, context: RouteContext) => {
  const { id } = await context.params;
  const body = (await request.json()) as {
    sessionId?: string;
    choice?: "EXIT" | "HOLD";
  };

  if (!body.sessionId || !body.choice) {
    return NextResponse.json({ error: "Missing sessionId or choice" }, { status: 400 });
  }

  const card = await prisma.card.findUnique({ where: { id } });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const existing = await prisma.guess.findFirst({
    where: { cardId: id, sessionId: body.sessionId },
  });

  if (existing) {
    return NextResponse.json({
      guess: existing,
      result: {
        correct: existing.correct,
        dropAfterPct: card.dropAfterPct,
        gainAfterPct: card.gainAfterPct,
        correctChoice: card.correctChoice,
        peakGainPct: card.peakGainPct,
        patternTag: card.patternTag,
        choice: existing.choice,
      },
    });
  }

  const correct = isChoiceCorrect(body.choice, card.correctChoice as "EXIT" | "HOLD");

  const guess = await prisma.guess.create({
    data: {
      cardId: id,
      sessionId: body.sessionId,
      choice: body.choice,
      correct,
    },
  });

  return NextResponse.json({
    guess,
    result: {
      correct,
      dropAfterPct: card.dropAfterPct,
      gainAfterPct: card.gainAfterPct,
      correctChoice: card.correctChoice,
      peakGainPct: card.peakGainPct,
      patternTag: card.patternTag,
      choice: body.choice,
    },
  });
};
