-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
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
    "gainAfterPct" REAL NOT NULL DEFAULT 0,
    "correctChoice" TEXT NOT NULL DEFAULT 'EXIT',
    "candlesJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("candlesJson", "createdAt", "deckId", "dropAfterPct", "freezeTimestamp", "id", "patternTag", "peakGainPct", "poolAddress", "sortOrder", "tokenImage", "tokenMint", "tokenName", "tokenSymbol") SELECT "candlesJson", "createdAt", "deckId", "dropAfterPct", "freezeTimestamp", "id", "patternTag", "peakGainPct", "poolAddress", "sortOrder", "tokenImage", "tokenMint", "tokenName", "tokenSymbol" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
CREATE INDEX "Card_deckId_sortOrder_idx" ON "Card"("deckId", "sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
