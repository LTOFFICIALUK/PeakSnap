-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deckDate" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deckId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "tokenMint" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenName" TEXT,
    "tokenImage" TEXT,
    "poolAddress" TEXT,
    "freezeTimestamp" INTEGER NOT NULL,
    "patternTag" TEXT NOT NULL,
    "peakGainPct" REAL NOT NULL,
    "dropAfterPct" REAL NOT NULL,
    "candlesJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guess_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Deck_deckDate_key" ON "Deck"("deckDate");

-- CreateIndex
CREATE INDEX "Card_deckId_sortOrder_idx" ON "Card"("deckId", "sortOrder");

-- CreateIndex
CREATE INDEX "Guess_sessionId_idx" ON "Guess"("sessionId");

-- CreateIndex
CREATE INDEX "Guess_cardId_sessionId_idx" ON "Guess"("cardId", "sessionId");
