"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { addWaterSchema } from "@/lib/validations/schemas"

export const addWaterAction = createSafeAction(addWaterSchema, async ({ amount }, userId) => {
  const entry = await prisma.waterEntry.create({
    data: {
      userId,
      amount
    }
  })

  // Trigger health engine sync
  const { healthEngine } = await import("@/services/health-engine.service")
  await healthEngine.syncDailySnapshot(userId, entry.date)

  revalidatePath("/dashboard")
  return { success: true, data: entry }
})
