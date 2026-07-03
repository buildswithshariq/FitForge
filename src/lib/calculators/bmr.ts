type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
): number {
  const male = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  const female = 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  switch (gender) {
    case 'MALE':
      return Math.round(male)
    case 'FEMALE':
      return Math.round(female)
    case 'OTHER':
      return Math.round((male + female) / 2)
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    SUPER_ACTIVE: 1.9
  }
  return Math.round(bmr * (multipliers[activityLevel] || 1.2))
}

export function calculateMacros(tdee: number, goal: string): { calories: number, protein: number, carbs: number, fat: number } {
  let calories = tdee
  if (goal === 'WEIGHT_LOSS') calories -= 500
  if (goal === 'MUSCLE_GAIN') calories += 300
  
  // Basic split: 30% P, 40% C, 30% F
  const protein = Math.round((calories * 0.3) / 4)
  const carbs = Math.round((calories * 0.4) / 4)
  const fat = Math.round((calories * 0.3) / 9)
  
  return { calories, protein, carbs, fat }
}
