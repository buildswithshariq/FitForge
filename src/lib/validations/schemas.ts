import { z } from "zod"

export const addWaterSchema = z.object({
  amount: z.number().int().positive().max(5000, "Amount must be reasonable (max 5000ml)"),
})

export type AddWaterInput = z.infer<typeof addWaterSchema>

export const addWeightSchema = z.object({
  weight: z.number().positive().min(20, "Weight is too low").max(500, "Weight is too high"),
})

export type AddWeightInput = z.infer<typeof addWeightSchema>

export const saveNoteSchema = z.object({
  content: z.string().max(2000, "Note is too long").trim(),
})

export type SaveNoteInput = z.infer<typeof saveNoteSchema>

export const generateWorkoutPlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  daysPerWeek: z.number().int().min(1).max(7),
  experience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
})

export type GenerateWorkoutPlanInput = z.infer<typeof generateWorkoutPlanSchema>

export const generateDietPlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  preference: z.string().max(100),
})

export type GenerateDietPlanInput = z.infer<typeof generateDietPlanSchema>

export const logFoodSchema = z.object({
  foodId: z.string().min(1, "Food ID is required"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  servings: z.number().positive().max(50),
})

export type LogFoodInput = z.infer<typeof logFoodSchema>

export const searchFoodsSchema = z.object({
  query: z.string().max(100),
})

export type SearchFoodsInput = z.infer<typeof searchFoodsSchema>

export const logWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required").max(100),
  duration: z.number().int().positive().max(480, "Duration must be less than 8 hours"),
  caloriesBurned: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export type LogWorkoutInput = z.infer<typeof logWorkoutSchema>

export const updateProfileSchema = z.object({
  age: z.number().int().positive().max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  height: z.number().positive().max(300),
  currentWeight: z.number().positive().max(500),
  targetWeight: z.number().positive().max(500),
  goal: z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTAIN_WEIGHT"]),
  activityLevel: z.enum(["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "SUPER_ACTIVE"]),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const createQuickWorkoutSchema = z.object({
  id: z.string().optional(), // For editing existing workouts
  name: z.string().min(1).max(100),
  duration: z.number().int().positive(),
  caloriesBurned: z.number().int().nullable().optional(),
  activeExercises: z.array(z.object({
    exerciseId: z.string(),
    name: z.string(),
    sets: z.array(z.object({
      reps: z.number().int().nonnegative(),
      weight: z.number().nonnegative(),
      isBodyweight: z.boolean().optional(),
      isTime: z.boolean().optional()
    }))
  }))
})

export type CreateQuickWorkoutInput = z.infer<typeof createQuickWorkoutSchema>

export const deleteItemSchema = z.object({
  id: z.string()
})

export const updateFoodEntrySchema = z.object({
  id: z.string(),
  servings: z.number().positive().max(50),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"])
})

export const createCustomFoodSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  servingSize: z.string().min(1, "Serving size is required").max(50),
  calories: z.number().int().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
})

export type CreateCustomFoodInput = z.infer<typeof createCustomFoodSchema>

export const createCustomExerciseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  muscleGroup: z.enum(["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS", "CORE", "QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "FULL_BODY", "CARDIO"]),
  equipment: z.string().max(50).optional().nullable(),
})

export type CreateCustomExerciseInput = z.infer<typeof createCustomExerciseSchema>
