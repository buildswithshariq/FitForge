type Goal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTAIN_WEIGHT'

interface MacroResult {
  calories: number
  protein: number
  carbs: number
  fat: number
}

const GOAL_CONFIG: Record<Goal, { calorieOffset: number; protein: number; carbs: number; fat: number }> = {
  WEIGHT_LOSS: { calorieOffset: -500, protein: 0.4, carbs: 0.35, fat: 0.25 },
  MUSCLE_GAIN: { calorieOffset: 300, protein: 0.35, carbs: 0.45, fat: 0.2 },
  MAINTAIN_WEIGHT: { calorieOffset: 0, protein: 0.3, carbs: 0.4, fat: 0.3 },
}

export function calculateMacros(tdee: number, goal: Goal): MacroResult {
  const config = GOAL_CONFIG[goal]
  const calories = tdee + config.calorieOffset

  return {
    calories: Math.round(calories),
    protein: Math.round((calories * config.protein) / 4),
    carbs: Math.round((calories * config.carbs) / 4),
    fat: Math.round((calories * config.fat) / 9),
  }
}
