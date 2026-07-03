import { dashboardRepository } from "@/repositories/dashboard.repository"
import { APP_CONSTANTS } from "@/constants/app"

export class DashboardService {
  async getDailySummary(userId: string, date: Date = new Date()) {
    const data = await dashboardRepository.getDailyStats(userId, date)
    
    // Aggregate Water
    const totalWater = data.waterEntries.reduce((sum, entry) => sum + entry.amount, 0)
    const waterGoal = APP_CONSTANTS.WATER_GOAL_ML
    const waterProgress = (totalWater / waterGoal) * 100

    // Aggregate Calories & Macros
    const totalCalories = data.foodEntries.reduce((sum, entry) => sum + entry.calories, 0)
    const totalProtein = data.foodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0)
    const totalCarbs = data.foodEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0)
    const totalFat = data.foodEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0)

    const calorieGoal = data.profile?.targetCalories || 2000
    const calorieProgress = (totalCalories / calorieGoal) * 100

    return {
      water: {
        consumed: totalWater,
        goal: waterGoal,
        progress: waterProgress
      },
      nutrition: {
        calories: totalCalories,
        calorieGoal,
        calorieProgress,
        protein: totalProtein,
        proteinGoal: data.profile?.targetProtein || 150,
        carbs: totalCarbs,
        carbsGoal: data.profile?.targetCarbs || 200,
        fat: totalFat,
        fatGoal: data.profile?.targetFat || 70,
      },
      workouts: {
        completed: data.workoutLogs.length,
        duration: data.workoutLogs.reduce((sum, log) => sum + log.duration, 0),
        caloriesBurned: data.workoutLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0),
        calorieBurnGoal: (data.profile?.tdee && data.profile?.bmr) ? Math.round(data.profile.tdee - data.profile.bmr) : 500
      },
      profile: data.profile
    }
  }
}

export const dashboardService = new DashboardService()
