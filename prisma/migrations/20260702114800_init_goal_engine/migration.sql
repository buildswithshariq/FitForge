-- CreateTable
CREATE TABLE "GoalHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "previousGoal" "Goal",
    "newGoal" "Goal" NOT NULL,
    "previousWeight" DOUBLE PRECISION,
    "newWeight" DOUBLE PRECISION NOT NULL,
    "previousTargetWeight" DOUBLE PRECISION,
    "newTargetWeight" DOUBLE PRECISION NOT NULL,
    "previousActivityLevel" "ActivityLevel",
    "newActivityLevel" "ActivityLevel" NOT NULL,
    "previousMaintenanceCals" INTEGER,
    "newMaintenanceCals" INTEGER NOT NULL,
    "previousTargetCalories" INTEGER,
    "newTargetCalories" INTEGER NOT NULL,
    "previousTargetProtein" DOUBLE PRECISION,
    "newTargetProtein" DOUBLE PRECISION NOT NULL,
    "previousTargetCarbs" DOUBLE PRECISION,
    "newTargetCarbs" DOUBLE PRECISION NOT NULL,
    "previousTargetFat" DOUBLE PRECISION,
    "newTargetFat" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "GoalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalAnalyticsCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalAnalyticsCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalHistory_userId_effectiveDate_idx" ON "GoalHistory"("userId", "effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "GoalAnalyticsCache_userId_key" ON "GoalAnalyticsCache"("userId");

-- AddForeignKey
ALTER TABLE "GoalHistory" ADD CONSTRAINT "GoalHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalAnalyticsCache" ADD CONSTRAINT "GoalAnalyticsCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
