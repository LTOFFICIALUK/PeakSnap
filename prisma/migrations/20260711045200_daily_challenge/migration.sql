-- CreateTable
CREATE TABLE "DailyRun" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "deckDate" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT 'Anon',
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyRun_deckId_sessionId_key" ON "DailyRun"("deckId", "sessionId");

-- CreateIndex
CREATE INDEX "DailyRun_deckDate_correct_idx" ON "DailyRun"("deckDate", "correct" DESC);

-- CreateIndex
CREATE INDEX "DailyRun_sessionId_idx" ON "DailyRun"("sessionId");

-- AddForeignKey
ALTER TABLE "DailyRun" ADD CONSTRAINT "DailyRun_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
