import { PrismaClient } from "@prisma/client";
import { buildTodayDeck, todayDeckKey } from "../src/lib/deck-service";

const prisma = new PrismaClient();

const main = async () => {
  const deckDate = todayDeckKey();
  const existing = await prisma.deck.findUnique({ where: { deckDate } });

  if (existing) {
    await prisma.guess.deleteMany({ where: { card: { deckId: existing.id } } });
    await prisma.card.deleteMany({ where: { deckId: existing.id } });
    await prisma.deck.delete({ where: { id: existing.id } });
    console.log(`Cleared existing deck for ${deckDate}`);
  }

  const result = await buildTodayDeck();

  console.log(`Deck ${deckDate}:`);
  console.log(`  scanned: ${result.scanned}`);
  console.log(`  created: ${result.created}`);
  console.log(`  skipped: ${result.skipped}`);
  console.log(`  total cards: ${result.deck?.cards.length ?? 0}`);

  for (const card of result.deck?.cards ?? []) {
    console.log(`  · ${card.tokenSymbol} (${card.patternTag}, ${card.correctChoice})`);
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
