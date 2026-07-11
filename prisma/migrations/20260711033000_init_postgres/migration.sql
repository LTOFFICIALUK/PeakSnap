-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "deckDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenName" TEXT,
    "tokenImage" TEXT,
    "poolAddress" TEXT,
    "freezeTimestamp" INTEGER NOT NULL,
    "patternTag" TEXT NOT NULL,
    "peakGainPct" DOUBLE PRECISION NOT NULL,
    "dropAfterPct" DOUBLE PRECISION NOT NULL,
    "gainAfterPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "correctChoice" TEXT NOT NULL DEFAULT 'EXIT',
    "candlesJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guess" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deck_deckDate_key" ON "Deck"("deckDate");

-- CreateIndex
CREATE INDEX "Card_deckId_sortOrder_idx" ON "Card"("deckId", "sortOrder");

-- CreateIndex
CREATE INDEX "Guess_sessionId_idx" ON "Guess"("sessionId");

-- CreateIndex
CREATE INDEX "Guess_cardId_sessionId_idx" ON "Guess"("cardId", "sessionId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
