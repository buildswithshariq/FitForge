"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { profileService } from "@/services/profile.service"
import { calculateBMI } from "@/lib/calculators/bmi"
import { createSafeAction } from "@/lib/safe-action"
import { addWeightSchema } from "@/lib/validations/schemas"

export const addWeightAction = createSafeAction(addWeightSchema, async ({ weight }, userId) => {
  const profile = await profileService.getProfile(userId)
  if (!profile) {
    return { success: false, error: "Profile not found" }
  }

  const bmi = calculateBMI(weight, profile.height)

  const [entry] = await prisma.$transaction([
    prisma.weightEntry.create({
      data: {
        userId,
        weight,
        bmi,
      }
    }),
    prisma.profile.update({
      where: { userId },
      data: { currentWeight: weight }
    })
  ])

  // Trigger health engine sync
  const { healthEngine } = await import("@/services/health-engine.service")
  await healthEngine.syncDailySnapshot(userId, entry.date)

  revalidatePath("/dashboard")
  revalidatePath("/profile")
  revalidatePath("/progress")
  return { success: true, data: entry }
})
