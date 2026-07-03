import { Goal, Difficulty, MuscleGroup } from "@prisma/client"

export interface WorkoutPlanGeneratorConfig {
  goal: Goal
  daysPerWeek: number
  experience: Difficulty
}

export class WorkoutRuleEngine {
  generatePlan(config: WorkoutPlanGeneratorConfig) {
    const { daysPerWeek, experience } = config
    let split: { name: string; targetMuscleGroups: MuscleGroup[] }[] = []

    if (daysPerWeek === 3) {
      split = [
        { name: "Full Body A", targetMuscleGroups: ["FULL_BODY", "CORE"] },
        { name: "Full Body B", targetMuscleGroups: ["FULL_BODY", "CORE"] },
        { name: "Full Body C", targetMuscleGroups: ["FULL_BODY", "CORE"] }
      ]
    } else if (daysPerWeek === 4) {
      split = [
        { name: "Upper Body", targetMuscleGroups: ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS"] },
        { name: "Lower Body", targetMuscleGroups: ["QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "CORE"] },
        { name: "Upper Body", targetMuscleGroups: ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS"] },
        { name: "Lower Body", targetMuscleGroups: ["QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "CORE"] }
      ]
    } else if (daysPerWeek === 5) {
      split = [
        { name: "Push", targetMuscleGroups: ["CHEST", "SHOULDERS", "TRICEPS"] },
        { name: "Pull", targetMuscleGroups: ["BACK", "BICEPS"] },
        { name: "Legs", targetMuscleGroups: ["QUADS", "HAMSTRINGS", "GLUTES", "CALVES"] },
        { name: "Upper Body", targetMuscleGroups: ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS"] },
        { name: "Lower Body & Core", targetMuscleGroups: ["QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "CORE"] }
      ]
    } else if (daysPerWeek === 6) {
      split = [
        { name: "Push", targetMuscleGroups: ["CHEST", "SHOULDERS", "TRICEPS"] },
        { name: "Pull", targetMuscleGroups: ["BACK", "BICEPS"] },
        { name: "Legs", targetMuscleGroups: ["QUADS", "HAMSTRINGS", "GLUTES", "CALVES"] },
        { name: "Push", targetMuscleGroups: ["CHEST", "SHOULDERS", "TRICEPS"] },
        { name: "Pull", targetMuscleGroups: ["BACK", "BICEPS"] },
        { name: "Legs & Core", targetMuscleGroups: ["QUADS", "HAMSTRINGS", "GLUTES", "CALVES", "CORE"] }
      ]
    } else {
      split = [
        { name: "Full Body", targetMuscleGroups: ["FULL_BODY", "CORE"] }
      ]
    }

    const sets = experience === Difficulty.BEGINNER ? 3 : (experience === Difficulty.INTERMEDIATE ? 4 : 5)
    const reps = config.goal === Goal.MUSCLE_GAIN ? "8-12" : (config.goal === Goal.WEIGHT_LOSS ? "12-15" : "10")

    return {
      split,
      recommendedSets: sets,
      recommendedReps: reps
    }
  }
}

export const workoutRuleEngine = new WorkoutRuleEngine()

export function generateWorkoutPlan(daysPerWeek: number, experience: Difficulty, goal: Goal) {
  const engine = new WorkoutRuleEngine()
  const result = engine.generatePlan({ daysPerWeek, experience, goal })
  
  const days = []
  for (let i = 0; i < 7; i++) {
    if (i < result.split.length) {
      days.push({
        dayNumber: i + 1,
        name: result.split[i].name,
        isRestDay: false,
        exercises: result.split[i].targetMuscleGroups.map((mg, index) => ({
          muscleGroup: mg,
          sets: result.recommendedSets,
          reps: result.recommendedReps,
          restSeconds: 60,
          order: index
        }))
      })
    } else {
      days.push({
        dayNumber: i + 1,
        name: "Rest Day",
        isRestDay: true,
        exercises: []
      })
    }
  }
  return days
}
