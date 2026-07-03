"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { generateWorkoutPlan } from "@/lib/rule-engine/workout"
import { generateDietPlan } from "@/lib/rule-engine/diet"
import { createSafeAction } from "@/lib/safe-action"
import { generateWorkoutPlanSchema, generateDietPlanSchema } from "@/lib/validations/schemas"
import { z } from "zod"

export const generateWorkoutPlanAction = createSafeAction(generateWorkoutPlanSchema, async (data, userId) => {
  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile) return { success: false, error: "Profile not found" }

  const allExercises = await prisma.exercise.findMany()

  const plan = await prisma.workoutPlan.create({
    data: {
      userId,
      name: data.name,
      goal: profile.goal,
      daysPerWeek: data.daysPerWeek,
      location: 'GYM', // simplified for V1
      experience: data.experience,
      isActive: true,
      days: {
        create: generateWorkoutPlan(data.daysPerWeek, data.experience, profile.goal).map(day => ({
          dayNumber: day.dayNumber,
          name: day.name,
          isRestDay: day.isRestDay,
          exercises: {
            create: day.exercises.map(ex => {
              // Simple matching strategy
              let match = allExercises.find(e => e.muscleGroup === ex.muscleGroup)
              if (!match) match = allExercises[0] // Fallback

              return {
                exerciseId: match.id,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds,
                order: ex.order
              }
            })
          }
        }))
      }
    }
  })

  revalidatePath("/plans")
  return { success: true, data: plan }
})

export const generateDietPlanAction = createSafeAction(generateDietPlanSchema, async (data, userId) => {
  const profile = await prisma.profile.findUnique({ where: { userId } })
  if (!profile || !profile.targetCalories) return { success: false, error: "Profile or calorie targets not found" }

  const plan = await prisma.dietPlan.create({
    data: {
      userId,
      name: data.name,
      goal: profile.goal,
      targetCalories: profile.targetCalories,
      targetProtein: profile.targetProtein || 0,
      targetCarbs: profile.targetCarbs || 0,
      targetFat: profile.targetFat || 0,
      preference: data.preference,
      isActive: true,
      meals: {
        create: generateDietPlan(profile.targetCalories, profile.targetProtein || 0, profile.targetCarbs || 0, profile.targetFat || 0).map(meal => ({
          mealType: meal.mealType,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          items: meal.items,
          order: meal.order
        }))
      }
    }
  })

  revalidatePath("/plans")
  return { success: true, data: plan }
})

export const deleteWorkoutPlanAction = createSafeAction(z.object({ id: z.string() }), async ({ id }, userId) => {
  await prisma.workoutPlan.delete({
    where: { id, userId } // IDOR protection: only delete if userId matches
  })
  revalidatePath("/plans")
  return { success: true, data: undefined }
})

export const deleteDietPlanAction = createSafeAction(z.object({ id: z.string() }), async ({ id }, userId) => {
  await prisma.dietPlan.delete({
    where: { id, userId } // IDOR protection: only delete if userId matches
  })
  revalidatePath("/plans")
  return { success: true, data: undefined }
})
