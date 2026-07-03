import { prisma } from "@/lib/db/prisma"
import { DailySnapshot } from "@prisma/client"

export interface GoalInsightsResult {
  scores: {
    nutrition: number;
    workout: number;
    hydration: number;
    consistency: number;
    overall: number;
  };
  predictions: {
    expectedWeightIn30Days: number | null;
    expectedGoalCompletionDate: string | null;
    averageWeeklyWeightChange: number | null;
  };
  dailyFeedback: string[];
  weeklyInsights: {
    bestWeek: string | null;
    worstWeek: string | null;
    averageDeficit: number;
    averageProtein: number;
    averageWorkouts: number;
    goalSuccessRate: number;
  };
  monthlyInsights: {
    perfectNutritionDays: number;
    missedWorkoutDays: number; // Planned vs Actual (simplified)
  };
  recommendations: string[];
}

export class GoalEngineService {
  /**
   * Main entry point to get Goal Insights. 
   * Includes caching logic to avoid recalculating 90 days of data on every load.
   */
  public async getGoalInsights(userId: string): Promise<GoalInsightsResult | null> {
    const profile = await prisma.profile.findUnique({ where: { userId } })
    if (!profile) return null

    // Check Cache
    const cache = await prisma.goalAnalyticsCache.findUnique({
      where: { userId }
    })
    
    // Invalidate cache if older than 4 hours for demo purposes
    // In production, we'd invalidate via event triggers
    const isCacheValid = cache && (new Date().getTime() - cache.lastCalculatedAt.getTime()) < 4 * 60 * 60 * 1000

    if (isCacheValid) {
      try {
        return JSON.parse(cache.data) as GoalInsightsResult
      } catch (e) {
        // Fallback to recalculate
      }
    }

    // Fetch up to 90 days of snapshots
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const snapshots = await prisma.dailySnapshot.findMany({
      where: { userId, date: { gte: ninetyDaysAgo } },
      orderBy: { date: 'asc' }
    })

    if (snapshots.length === 0) {
      return this.generateEmptyInsights()
    }

    const todaySnapshot = snapshots[snapshots.length - 1]
    const last30 = snapshots.slice(-30)

    const scores = this.calculateScores(last30, profile.targetCalories || 2000, profile.targetProtein || 150)
    const predictions = this.calculatePredictions(snapshots, profile.currentWeight, profile.targetWeight, profile.goal)
    const dailyFeedback = this.generateDailyFeedback(todaySnapshot)
    const weeklyInsights = this.calculateWeeklyInsights(snapshots)
    const monthlyInsights = this.calculateMonthlyInsights(last30)
    const recommendations = this.generateRecommendations(scores, todaySnapshot)

    const result: GoalInsightsResult = {
      scores,
      predictions,
      dailyFeedback,
      weeklyInsights,
      monthlyInsights,
      recommendations
    }

    // Update Cache
    await prisma.goalAnalyticsCache.upsert({
      where: { userId },
      create: { userId, data: JSON.stringify(result), lastCalculatedAt: new Date() },
      update: { data: JSON.stringify(result), lastCalculatedAt: new Date() }
    })

    return result
  }

  private calculateScores(snapshots: DailySnapshot[], targetCals: number, targetProtein: number) {
    if (snapshots.length === 0) return { nutrition: 0, workout: 0, hydration: 0, consistency: 0, overall: 0 }

    let nutSum = 0
    let workSum = 0
    let hydSum = 0

    snapshots.forEach(s => {
      // Nutrition: Close to target cals & hit protein
      let nutScore = 100
      const calDiff = Math.abs(s.netCalories - s.targetCalories)
      if (calDiff > 500) nutScore -= 50
      else if (calDiff > 200) nutScore -= 20
      
      if (s.protein < targetProtein * 0.8) nutScore -= 20
      nutSum += Math.max(0, nutScore)

      // Workout: Did they workout? (Simple binary for now, scaled)
      workSum += s.totalWorkouts > 0 ? 100 : 0

      // Hydration: Hit 2500ml?
      hydSum += s.waterIntake >= 2500 ? 100 : (s.waterIntake / 2500) * 100
    })

    const days = snapshots.length
    const nutrition = Math.round(nutSum / days)
    const workout = Math.round(workSum / days) // Average days with workout
    const hydration = Math.min(100, Math.round(hydSum / days))
    
    // Consistency: standard deviation proxy
    const consistency = Math.round((nutrition + hydration) / 2)
    const overall = Math.round((nutrition * 0.4) + (workout * 0.4) + (hydration * 0.2))

    return { nutrition, workout, hydration, consistency, overall }
  }

  private calculatePredictions(snapshots: DailySnapshot[], currentWeight: number, targetWeight: number, goal: string) {
    // We need at least 14 days of weight data to make a stable prediction
    const weightData = snapshots.filter(s => s.weight !== null).slice(-30)
    
    if (weightData.length < 14 || currentWeight === targetWeight) {
      return { expectedWeightIn30Days: null, expectedGoalCompletionDate: null, averageWeeklyWeightChange: null }
    }

    const first = weightData[0]
    const last = weightData[weightData.length - 1]
    const daysDiff = (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24) || 1
    
    if (daysDiff < 7) {
      return { expectedWeightIn30Days: null, expectedGoalCompletionDate: null, averageWeeklyWeightChange: null }
    }

    const totalChange = (last.weight!) - (first.weight!)
    const dailyChange = totalChange / daysDiff
    const weeklyChange = dailyChange * 7

    const expectedWeightIn30Days = currentWeight + (dailyChange * 30)
    
    let expectedGoalCompletionDate: string | null = null
    const weightToLose = targetWeight - currentWeight

    // Only project if moving in the right direction
    if ((goal === "WEIGHT_LOSS" && dailyChange < 0) || (goal === "MUSCLE_GAIN" && dailyChange > 0)) {
      const daysToGoal = weightToLose / dailyChange
      if (daysToGoal > 0 && daysToGoal < 365 * 2) { // Cap at 2 years
        const completionDate = new Date()
        completionDate.setDate(completionDate.getDate() + daysToGoal)
        expectedGoalCompletionDate = completionDate.toISOString().split("T")[0]
      }
    }

    return {
      expectedWeightIn30Days: Number(expectedWeightIn30Days.toFixed(1)),
      expectedGoalCompletionDate,
      averageWeeklyWeightChange: Number(weeklyChange.toFixed(2))
    }
  }

  private generateDailyFeedback(today: DailySnapshot) {
    const feedback: string[] = []
    
    const calDiff = today.netCalories - today.targetCalories
    if (Math.abs(calDiff) < 100) {
      feedback.push("You stayed within your calorie target today.")
    } else if (calDiff > 0) {
      feedback.push(`You exceeded your calorie goal by ${calDiff} kcal.`)
    } else {
      feedback.push(`You were ${Math.abs(calDiff)} kcal under your target.`)
    }

    if (today.waterIntake < 2500) {
      feedback.push("Water intake is below today's target.")
    } else {
      feedback.push("Great job hitting your water goal!")
    }

    if (today.totalWorkouts > 0) {
      feedback.push("Workout completed today! Keep up the momentum.")
    }

    return feedback
  }

  private calculateWeeklyInsights(snapshots: DailySnapshot[]) {
    if (snapshots.length === 0) {
      return { bestWeek: null, worstWeek: null, averageDeficit: 0, averageProtein: 0, averageWorkouts: 0, goalSuccessRate: 0 }
    }

    let deficitSum = 0
    let proteinSum = 0
    let workoutSum = 0
    let successDays = 0

    snapshots.forEach(s => {
      deficitSum += (s.maintenanceCals - s.netCalories)
      proteinSum += s.protein
      workoutSum += s.totalWorkouts
      if (Math.abs(s.netCalories - s.targetCalories) <= 200) successDays++
    })

    const days = snapshots.length
    return {
      bestWeek: null, // Complex to calculate grouping without robust date math, simplified for now
      worstWeek: null,
      averageDeficit: Math.round(deficitSum / days),
      averageProtein: Math.round(proteinSum / days),
      averageWorkouts: Number((workoutSum / (days / 7 || 1)).toFixed(1)),
      goalSuccessRate: Math.round((successDays / days) * 100)
    }
  }

  private calculateMonthlyInsights(last30: DailySnapshot[]) {
    let perfectNutritionDays = 0
    let missedWorkoutDays = 0

    last30.forEach(s => {
      if (Math.abs(s.netCalories - s.targetCalories) <= 150) perfectNutritionDays++
      // Assuming 4 workouts a week is the target => 16 a month
    })

    missedWorkoutDays = Math.max(0, 16 - last30.reduce((acc, s) => acc + (s.totalWorkouts > 0 ? 1 : 0), 0))

    return { perfectNutritionDays, missedWorkoutDays }
  }

  private generateRecommendations(scores: GoalInsightsResult["scores"], today: DailySnapshot) {
    const recs: string[] = []
    
    if (scores.hydration < 70) recs.push("Drink 500 ml more water today to improve your hydration score.")
    if (today.protein < 100) recs.push("Increase protein intake to support muscle recovery.")
    if (scores.workout < 40) recs.push("Add one more workout this week to stay on track.")
    if (scores.nutrition < 60) recs.push("Focus on hitting your calorie targets more consistently.")

    if (recs.length === 0) recs.push("You are doing excellent. Keep it up!")

    return recs
  }

  private generateEmptyInsights(): GoalInsightsResult {
    return {
      scores: { nutrition: 0, workout: 0, hydration: 0, consistency: 0, overall: 0 },
      predictions: { expectedWeightIn30Days: null, expectedGoalCompletionDate: null, averageWeeklyWeightChange: null },
      dailyFeedback: ["Start logging data to generate insights."],
      weeklyInsights: { bestWeek: null, worstWeek: null, averageDeficit: 0, averageProtein: 0, averageWorkouts: 0, goalSuccessRate: 0 },
      monthlyInsights: { perfectNutritionDays: 0, missedWorkoutDays: 0 },
      recommendations: ["Log your first meal or workout!"]
    }
  }
}

export const goalEngine = new GoalEngineService()
