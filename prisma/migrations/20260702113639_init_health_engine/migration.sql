-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "metValue" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "WorkoutLog" ADD COLUMN     "calorieCalculationMethod" TEXT,
ADD COLUMN     "calorieCalculationVersion" TEXT;

-- CreateTable
CREATE TABLE "DailySnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "waterIntake" INTEGER NOT NULL DEFAULT 0,
    "caloriesConsumed" INTEGER NOT NULL DEFAULT 0,
    "caloriesBurned" INTEGER NOT NULL DEFAULT 0,
    "netCalories" INTEGER NOT NULL DEFAULT 0,
    "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMeals" INTEGER NOT NULL DEFAULT 0,
    "totalWorkouts" INTEGER NOT NULL DEFAULT 0,
    "totalExercises" INTEGER NOT NULL DEFAULT 0,
    "workoutDuration" INTEGER NOT NULL DEFAULT 0,
    "averageWorkoutIntensity" TEXT,
    "estimatedSteps" INTEGER,
    "sleepHours" DOUBLE PRECISION,
    "bodyFatPercentage" DOUBLE PRECISION,
    "targetCalories" INTEGER NOT NULL DEFAULT 0,
    "maintenanceCals" INTEGER NOT NULL DEFAULT 0,
    "goal" "Goal",
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "goalStatus" TEXT,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "dailyNote" TEXT,
    "calculationVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailySnapshot_userId_date_idx" ON "DailySnapshot"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySnapshot_userId_date_key" ON "DailySnapshot"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailySnapshot" ADD CONSTRAINT "DailySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
