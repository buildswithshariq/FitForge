"use server"

import { prisma } from "@/lib/db/prisma"
import { createSafeAction } from "@/lib/safe-action"
import { healthEngine } from "@/services/health-engine.service"
import { goalEngine } from "@/services/goal-engine.service"
import { z } from "zod"

export const getProgressDataAction = createSafeAction(
  z.object({
    days: z.number().optional().default(30)
  }), 
  async ({ days }, userId) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const snapshots = await healthEngine.getAnalytics(userId, startDate, endDate)
    const insights = await goalEngine.getGoalInsights(userId)

    const userProfile = await prisma.profile.findUnique({ where: { userId } })
    let lastKnownWeight = userProfile?.currentWeight || 0

    const dateList = []
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      dateList.push(d.toISOString().split("T")[0])
    }

    const snapshotMap = new Map(snapshots.map(s => [s.date.toISOString().split("T")[0], s]))
    
    const denseSnapshots = []
    const denseWeight = []
    const denseWorkouts = []

    for (const dateStr of dateList) {
      const s = snapshotMap.get(dateStr)
      if (s && s.weight) {
        lastKnownWeight = s.weight
      }
      
      const defaultBmi = userProfile?.bmr || 0 // Profile BMR acts as a fallback for BMI in this schema

      denseSnapshots.push({
        date: dateStr,
        weight: s?.weight || lastKnownWeight,
        bmi: s?.bmi || defaultBmi,
        caloriesConsumed: s?.caloriesConsumed || 0,
        caloriesBurned: s?.caloriesBurned || 0,
        netCalories: s?.netCalories || 0,
        targetCalories: s?.targetCalories || userProfile?.targetCalories || 2500,
        workoutDuration: s?.workoutDuration || 0,
        totalWorkouts: s?.totalWorkouts || 0,
        waterIntake: s?.waterIntake || 0,
        completionPercentage: s?.completionPercentage || 0,
        streak: s?.streak || 0
      })

      denseWeight.push({
        date: dateStr,
        weight: lastKnownWeight,
        bmi: s?.bmi || defaultBmi
      })

      denseWorkouts.push({
        date: dateStr,
        duration: s?.workoutDuration || 0,
        calories: s?.caloriesBurned || 0
      })
    }

    return {
      success: true,
      data: {
        snapshots: denseSnapshots,
        weight: denseWeight,
        workouts: denseWorkouts,
        insights
      }
    }
  }
)
