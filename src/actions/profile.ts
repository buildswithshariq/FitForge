"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { updateProfileSchema } from "@/lib/validations/schemas"
import { calculateBMR, calculateTDEE, calculateMacros } from "@/lib/calculators/bmr"

export const updateProfileAction = createSafeAction(updateProfileSchema, async (data, userId) => {
  // Auto-calculate BMR and TDEE based on the newly saved settings
  const bmr = calculateBMR(data.currentWeight, data.height, data.age, data.gender)
  const tdee = calculateTDEE(bmr, data.activityLevel)
  const macros = calculateMacros(tdee, data.goal)

  const existingProfile = await prisma.profile.findUnique({ where: { userId } })

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      ...data,
      bmr,
      tdee,
      targetCalories: macros.calories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat,
    },
    create: {
      userId,
      ...data,
      bmr,
      tdee,
      targetCalories: macros.calories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat,
    },
  })

  // Goal Engine: Check if goals changed and create history
  if (existingProfile) {
    const hasGoalChanged = 
      existingProfile.goal !== data.goal ||
      existingProfile.targetWeight !== data.targetWeight ||
      existingProfile.activityLevel !== data.activityLevel ||
      existingProfile.targetCalories !== macros.calories
      
    if (hasGoalChanged) {
      await prisma.goalHistory.create({
        data: {
          userId,
          previousGoal: existingProfile.goal,
          newGoal: data.goal,
          previousWeight: existingProfile.currentWeight,
          newWeight: data.currentWeight,
          previousTargetWeight: existingProfile.targetWeight,
          newTargetWeight: data.targetWeight,
          previousActivityLevel: existingProfile.activityLevel,
          newActivityLevel: data.activityLevel,
          previousMaintenanceCals: existingProfile.tdee ? Math.round(existingProfile.tdee) : null,
          newMaintenanceCals: Math.round(tdee),
          previousTargetCalories: existingProfile.targetCalories ? Math.round(existingProfile.targetCalories) : null,
          newTargetCalories: Math.round(macros.calories),
          previousTargetProtein: existingProfile.targetProtein,
          newTargetProtein: macros.protein,
          previousTargetCarbs: existingProfile.targetCarbs,
          newTargetCarbs: macros.carbs,
          previousTargetFat: existingProfile.targetFat,
          newTargetFat: macros.fat,
        }
      })
      
      // Invalidate the cache to ensure new goal metrics reflect
      await prisma.goalAnalyticsCache.deleteMany({ where: { userId } })
    }
  }

  // Also invalidate GoalAnalyticsCache if weight changed significantly
  if (existingProfile && Math.abs(existingProfile.currentWeight - data.currentWeight) >= 1) {
    await prisma.goalAnalyticsCache.deleteMany({ where: { userId } })
  }

  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { success: true, data: profile }
})
