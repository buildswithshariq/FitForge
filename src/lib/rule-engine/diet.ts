import { Goal, MealType } from "@prisma/client"
import { APP_CONSTANTS } from "@/constants/app"

export interface DietPlanGeneratorConfig {
  tdee: number
  goal: Goal
}

export class DietRuleEngine {
  generatePlan(config: DietPlanGeneratorConfig) {
    const { tdee, goal } = config
    
    // Base macros from profile
    let targetCalories = tdee
    if (goal === Goal.WEIGHT_LOSS) targetCalories -= 500
    if (goal === Goal.MUSCLE_GAIN) targetCalories += 300
    
    // Typical Macro split: 30% Protein, 40% Carbs, 30% Fat
    const proteinGrams = Math.round((targetCalories * 0.3) / 4)
    const carbsGrams = Math.round((targetCalories * 0.4) / 4)
    const fatGrams = Math.round((targetCalories * 0.3) / 9)

    const meals = [
      { name: "Breakfast", type: "BREAKFAST" as MealType, caloriesPct: 0.25 },
      { name: "Lunch", type: "LUNCH" as MealType, caloriesPct: 0.35 },
      { name: "Dinner", type: "DINNER" as MealType, caloriesPct: 0.30 },
      { name: "Snack", type: "SNACK" as MealType, caloriesPct: 0.10 }
    ]

    return {
      totalCalories: targetCalories,
      totalProtein: proteinGrams,
      totalCarbs: carbsGrams,
      totalFat: fatGrams,
      meals: meals.map((m, i) => ({
        mealType: m.type,
        name: m.name,
        calories: Math.round(targetCalories * m.caloriesPct),
        protein: Math.round(proteinGrams * m.caloriesPct),
        carbs: Math.round(carbsGrams * m.caloriesPct),
        fat: Math.round(fatGrams * m.caloriesPct),
        order: i
      }))
    }
  }
}

export const dietRuleEngine = new DietRuleEngine()

export function generateDietPlan(targetCalories: number, targetProtein: number, targetCarbs: number, targetFat: number) {
  const meals = [
    { name: "Breakfast", type: "BREAKFAST" as MealType, caloriesPct: 0.25 },
    { name: "Lunch", type: "LUNCH" as MealType, caloriesPct: 0.35 },
    { name: "Dinner", type: "DINNER" as MealType, caloriesPct: 0.30 },
    { name: "Snack", type: "SNACK" as MealType, caloriesPct: 0.10 }
  ]

  return meals.map((m, i) => ({
    mealType: m.type,
    name: m.name,
    calories: Math.round(targetCalories * m.caloriesPct),
    protein: Math.round(targetProtein * m.caloriesPct),
    carbs: Math.round(targetCarbs * m.caloriesPct),
    fat: Math.round(targetFat * m.caloriesPct),
    items: "Sample meal plan items (generated)",
    order: i
  }))
}
