"use server"

import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { createSafeAction } from "@/lib/safe-action"
import { createQuickWorkoutSchema, createCustomExerciseSchema } from "@/lib/validations/schemas"
import { z } from "zod"

// Search exercises action
export const searchExercisesAction = createSafeAction(
  z.object({ query: z.string().max(100) }),
  async ({ query }) => {
    const exercises = await prisma.exercise.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      take: 20
    })
    return { success: true, data: exercises }
  }
)


export const createQuickWorkoutAction = createSafeAction(createQuickWorkoutSchema, async (data, userId) => {
  const { healthEngine } = await import("@/services/health-engine.service")
  
  let caloriesBurned = data.caloriesBurned
  let calcMethod = "User_Input"
  let calcVersion = "v1.0"

  if (!caloriesBurned) {
    const profile = await prisma.profile.findUnique({ where: { userId } })
    const weight = profile?.currentWeight || 80 // fallback weight in kg
    const primaryExercise = data.activeExercises[0]?.name || "General"
    
    // We could fetch MET from DB if needed, but for now rely on engine defaults
    const result = healthEngine.calculateWorkoutCalories(weight, data.duration, primaryExercise)
    caloriesBurned = result.calories
    calcMethod = result.method
    calcVersion = result.version
  }

  let workout;

  if (data.id) {
    const existing = await prisma.workoutLog.findUnique({ where: { id: data.id } })
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Workout not found" }
    }

    // Delete existing exercises (cascades to sets)
    await prisma.exerciseLog.deleteMany({ where: { workoutLogId: data.id } })

    workout = await prisma.workoutLog.update({
      where: { id: data.id },
      data: {
        name: data.name,
        duration: data.duration,
        caloriesBurned,
        calorieCalculationMethod: calcMethod,
        calorieCalculationVersion: calcVersion,
        exercises: {
          create: data.activeExercises.map((ex, i) => ({
            exerciseId: ex.exerciseId,
            name: ex.name,
            order: i,
            sets: {
              create: ex.sets.map((set, j) => ({
                setNumber: j + 1,
                reps: set.reps,
                weight: set.weight,
                completed: true
              }))
            }
          }))
        }
      }
    })
  } else {
    workout = await prisma.workoutLog.create({
      data: {
        userId,
        name: data.name,
        duration: data.duration,
        caloriesBurned,
        calorieCalculationMethod: calcMethod,
        calorieCalculationVersion: calcVersion,
        completed: true,
        exercises: {
          create: data.activeExercises.map((ex, i) => ({
            exerciseId: ex.exerciseId,
            name: ex.name,
            order: i,
            sets: {
              create: ex.sets.map((set, j) => ({
                setNumber: j + 1,
                reps: set.reps,
                weight: set.weight,
                completed: true
              }))
            }
          }))
        }
      }
    })
  }

  // Trigger health engine sync
  await healthEngine.syncDailySnapshot(userId, workout.date)

  revalidatePath("/workouts")
  revalidatePath("/dashboard")
  revalidatePath("/progress")
  return { success: true, data: workout }
})

export const createCustomExerciseAction = createSafeAction(createCustomExerciseSchema, async (data, userId) => {
  const existing = await prisma.exercise.findUnique({
    where: { name: data.name }
  })

  if (existing) {
    return { success: false, error: "An exercise with this exact name already exists. Please choose a different name or search for it." }
  }

  const exercise = await prisma.exercise.create({
    data: {
      name: data.name,
      muscleGroup: data.muscleGroup,
      equipment: data.equipment || "Bodyweight",
      difficulty: "BEGINNER", // Default
      homeSupported: true,
      gymSupported: true
    }
  })

  return { success: true, data: exercise }
})

export const deleteWorkoutLogAction = createSafeAction(
  z.object({ id: z.string() }),
  async ({ id }, userId) => {
    const workout = await prisma.workoutLog.findUnique({ where: { id } })
    if (!workout || workout.userId !== userId) {
      return { success: false, error: "Not found or unauthorized" }
    }
    
    await prisma.workoutLog.delete({ where: { id } })
    
    const { healthEngine } = await import("@/services/health-engine.service")
    await healthEngine.syncDailySnapshot(userId, workout.date)
    
    revalidatePath("/workouts")
    revalidatePath("/dashboard")
    revalidatePath("/progress")
    return { success: true, data: true }
  }
)
