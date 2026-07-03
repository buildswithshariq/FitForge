"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { saveNoteSchema } from "@/lib/validations/schemas"

export const saveNoteAction = createSafeAction(saveNoteSchema, async ({ content }, userId) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const existing = await prisma.dailyNote.findFirst({
    where: { 
      userId,
      date: { gte: today }
    }
  })

  let note
  if (existing) {
    note = await prisma.dailyNote.update({
      where: { id: existing.id, userId }, // IDOR protection check on userId
      data: { content }
    })
  } else {
    note = await prisma.dailyNote.create({
      data: {
        userId,
        content,
        date: new Date()
      }
    })
  }

  // Trigger health engine sync
  const { healthEngine } = await import("@/services/health-engine.service")
  await healthEngine.syncDailySnapshot(userId, note.date)

  revalidatePath("/dashboard")
  return { success: true, data: note }
})
