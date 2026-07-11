import { PrismaClient } from "@prisma/client";
import { buildScenario, demoCards } from "./demo-candles";

const prisma = new PrismaClient();

const deckDate = new Date().toISOString().slice(0, 10);

const main = async () => {
  await prisma.guess.deleteMany();
  await prisma.card.deleteMany();
  await prisma.deck.deleteMany();

  const deck = await prisma.deck.create({
    data: { deckDate },
  });

  for (let i = 0; i < demoCards.length; i++) {
    const demo = demoCards[i];
    const built = buildScenario(demo.scenario, i);

    await prisma.card.create({
      data: {
        deckId: deck.id,
        sortOrder: i,
        tokenMint: demo.tokenMint,
        tokenSymbol: demo.tokenSymbol,
        tokenName: demo.tokenName,
        freezeTimestamp: built.freezeTimestamp,
        patternTag: built.patternTag,
        peakGainPct: built.peakGainPct,
        dropAfterPct: built.dropAfterPct,
        gainAfterPct: built.gainAfterPct,
        correctChoice: built.correctChoice,
        candlesJson: JSON.stringify(built.candles),
      },
    });
  }

  const exits = await prisma.card.count({ where: { correctChoice: "EXIT" } });
  const holds = await prisma.card.count({ where: { correctChoice: "HOLD" } });

  console.log(`Seeded deck ${deckDate}: ${demoCards.length} cards (${exits} exit, ${holds} hold).`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
