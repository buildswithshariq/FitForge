"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { searchFoodsSchema, logFoodSchema, createCustomFoodSchema } from "@/lib/validations/schemas"
import { z } from "zod"

export const searchFoodsAction = createSafeAction(searchFoodsSchema, async ({ query }, userId) => {
  const foods = await prisma.food.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive'
      }
    },
    take: 20
  })

  return { success: true, data: foods }
})

export const logFoodAction = createSafeAction(logFoodSchema, async (data, userId) => {
  const food = await prisma.food.findUnique({ where: { id: data.foodId } })
  if (!food) {
    return { success: false, error: "Food not found" }
  }

  const entry = await prisma.foodEntry.create({
    data: {
      userId,
      foodId: food.id,
      name: food.name,
      mealType: data.mealType,
      servings: data.servings,
      calories: Math.round(food.calories * data.servings),
      protein: food.protein * data.servings,
      carbs: food.carbs * data.servings,
      fat: food.fat * data.servings,
    }
  })

  // Trigger health engine sync
  const { healthEngine } = await import("@/services/health-engine.service")
  await healthEngine.syncDailySnapshot(userId, entry.date)

  revalidatePath("/diet")
  revalidatePath("/dashboard")
  return { success: true, data: entry }
})

export const createCustomFoodAction = createSafeAction(createCustomFoodSchema, async (data, userId) => {
  // Check if name already exists globally to prevent constraint error
  const existing = await prisma.food.findUnique({
    where: { name: data.name }
  })

  if (existing) {
    return { success: false, error: "A food with this exact name already exists. Please choose a different name or search for it." }
  }

  const food = await prisma.food.create({
    data: {
      name: data.name,
      servingSize: data.servingSize,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
    }
  })

  return { success: true, data: food }
})

export const deleteFoodEntryAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }, userId) => {
    const entry = await prisma.foodEntry.findUnique({ where: { id } })
    if (!entry || entry.userId !== userId) {
      return { success: false, error: "Not found or unauthorized" }
    }
    
    await prisma.foodEntry.delete({ where: { id } })
    
    const { healthEngine } = await import("@/services/health-engine.service")
    await healthEngine.syncDailySnapshot(userId, entry.date)
    
    revalidatePath("/diet")
    revalidatePath("/dashboard")
    return { success: true, data: true }
  }
)

export const updateFoodEntryAction = createSafeAction(
  z.object({
    id: z.string(),
    servings: z.number().positive(),
    mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"])
  }),
  async ({ id, servings, mealType }, userId) => {
    const entry = await prisma.foodEntry.findUnique({ 
      where: { id },
      include: { food: true } 
    })
    
    if (!entry || entry.userId !== userId) {
      return { success: false, error: "Not found or unauthorized" }
    }

    const food = entry.food
    if (!food) {
      return { success: false, error: "Original food data missing" }
    }

    const updated = await prisma.foodEntry.update({
      where: { id },
      data: {
        servings,
        mealType,
        calories: Math.round(food.calories * servings),
        protein: food.protein * servings,
        carbs: food.carbs * servings,
        fat: food.fat * servings,
      }
    })

    const { healthEngine } = await import("@/services/health-engine.service")
    await healthEngine.syncDailySnapshot(userId, updated.date)
    
    revalidatePath("/diet")
    revalidatePath("/dashboard")
    return { success: true, data: updated }
  }
)
