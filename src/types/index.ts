export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type Goal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTAIN_WEIGHT'

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'SUPER_ACTIVE'

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'FOREARMS'
  | 'CORE'
  | 'QUADS'
  | 'HAMSTRINGS'
  | 'GLUTES'
  | 'CALVES'
  | 'FULL_BODY'
  | 'CARDIO'
