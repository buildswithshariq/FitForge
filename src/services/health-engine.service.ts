import { prisma } from "@/lib/db/prisma"

// MET (Metabolic Equivalent of Task) Reference Values
// In a full implementation, these would be in the Exercise model.
const DEFAULT_MET = 5.0
const MET_MAP: Record<string, number> = {
  "Running": 9.8,
  "Cycling": 7.5,
  "Walking": 3.8,
  "Weightlifting": 6.0,
  "Yoga": 3.0,
  "Swimming": 8.0,
  "HIIT": 10.0,
}

export class HealthEngineService {
  /**
   * Version of the calculation logic. If formulas change, bump this version.
   */
  public readonly CALCULATION_VERSION = "v1.1"

  /**
   * Calculate calories burned during a workout.
   * Formula: Calories = MET * Weight (kg) * Duration (hours)
   */
  public calculateWorkoutCalories(
    userWeightKg: number, 
    durationMinutes: number, 
    exerciseName: string = "General", 
    customMet?: number | null
  ) {
    const met = customMet ?? MET_MAP[exerciseName] ?? DEFAULT_MET
    const durationHours = durationMinutes / 60
    const calories = met * userWeightKg * durationHours
    
    return {
      calories: Math.round(calories),
      method: "METs_Standard",
      version: this.CALCULATION_VERSION
    }
  }

  /**
   * Core engine synchronization function.
   * This should be called whenever any raw data (Food, Water, Workout, Weight) changes.
   * 
   * @param userId The user's ID
   * @param date The logical date (e.g. representing midnight of that day in UTC)
   */
  public async syncDailySnapshot(userId: string, date: Date) {
    // Normalize date to start of day UTC
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)
    
    const endOfDay = new Date(startOfDay)
    endOfDay.setUTCHours(23, 59, 59, 999)

    // Fetch all raw data for this day concurrently
    const [
      profile,
      foodEntries,
      waterEntries,
      workoutLogs,
      weightEntries,
      dailyNote
    ] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.foodEntry.findMany({ 
        where: { userId, date: { gte: startOfDay, lte: endOfDay } }
      }),
      prisma.waterEntry.findMany({ 
        where: { userId, date: { gte: startOfDay, lte: endOfDay } }
      }),
      prisma.workoutLog.findMany({ 
        where: { userId, date: { gte: startOfDay, lte: endOfDay }, completed: true }
      }),
      prisma.weightEntry.findFirst({ 
        where: { userId, date: { gte: startOfDay, lte: endOfDay } },
        orderBy: { date: 'desc' }
      }),
      prisma.dailyNote.findFirst({
        where: { userId, date: { gte: startOfDay, lte: endOfDay } }
      })
    ])

    if (!profile) return null

    // 1. Calculate Nutrition
    const caloriesConsumed = foodEntries.reduce((sum, e) => sum + e.calories, 0)
    const protein = foodEntries.reduce((sum, e) => sum + (e.protein || 0), 0)
    const carbs = foodEntries.reduce((sum, e) => sum + (e.carbs || 0), 0)
    const fat = foodEntries.reduce((sum, e) => sum + (e.fat || 0), 0)
    const totalMeals = foodEntries.length

    // 2. Calculate Workouts
    const totalWorkouts = workoutLogs.length
    const workoutDuration = workoutLogs.reduce((sum, log) => sum + log.duration, 0)
    const caloriesBurned = workoutLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0)

    // 3. Calculate Water & Weight
    const waterIntake = waterEntries.reduce((sum, e) => sum + e.amount, 0)
    const weight = weightEntries?.weight || profile.currentWeight
    const bmi = weightEntries?.bmi || profile.bmr // reusing bmi field to cache actual bmi if calculated

    // 4. Calculate Net & Goals
    const maintenanceCals = profile.tdee ? Math.round(profile.tdee) : 2500
    const targetCalories = profile.targetCalories ? Math.round(profile.targetCalories) : maintenanceCals
    const netCalories = caloriesConsumed - caloriesBurned
    
    // Adherence logic
    const difference = netCalories - targetCalories
    const isUnder = difference < 0
    const goalStatus = difference === 0 
      ? "Perfectly on target" 
      : `You are ${Math.abs(difference)} kcal ${isUnder ? 'below' : 'over'} today's target.`
      
    const completionPercentage = Math.min(100, Math.max(0, (caloriesConsumed / (targetCalories || 1)) * 100))

    // Upsert the Snapshot
    const snapshot = await prisma.dailySnapshot.upsert({
      where: {
        userId_date: {
          userId,
          date: startOfDay
        }
      },
      create: {
        userId,
        date: startOfDay,
        weight,
        bmi,
        waterIntake,
        caloriesConsumed,
        caloriesBurned,
        netCalories,
        protein,
        carbs,
        fat,
        totalMeals,
        totalWorkouts,
        totalExercises: 0, // Would need exercise log count
        workoutDuration,
        targetCalories,
        maintenanceCals,
        goal: profile.goal,
        completionPercentage,
        goalStatus,
        dailyNote: dailyNote?.content,
        calculationVersion: this.CALCULATION_VERSION
      },
      update: {
        weight,
        bmi,
        waterIntake,
        caloriesConsumed,
        caloriesBurned,
        netCalories,
        protein,
        carbs,
        fat,
        totalMeals,
        totalWorkouts,
        workoutDuration,
        targetCalories,
        maintenanceCals,
        goal: profile.goal,
        completionPercentage,
        goalStatus,
        dailyNote: dailyNote?.content,
        calculationVersion: this.CALCULATION_VERSION,
        generatedAt: new Date()
      }
    })

    return snapshot
  }

  /**
   * Get the dashboard snapshot for a specific date. 
   * If it doesn't exist, it attempts a sync.
   */
  public async getDashboardSnapshot(userId: string, date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setUTCHours(0, 0, 0, 0)

    let snapshot = await prisma.dailySnapshot.findUnique({
      where: {
        userId_date: {
          userId,
          date: startOfDay
        }
      }
    })

    if (!snapshot) {
      snapshot = await this.syncDailySnapshot(userId, startOfDay)
    }

    return snapshot
  }

  /**
   * Get analytics over a date range. Fast query since everything is pre-calculated.
   */
  public async getAnalytics(userId: string, startDate: Date, endDate: Date) {
    return prisma.dailySnapshot.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    })
  }
}

export const healthEngine = new HealthEngineService()
