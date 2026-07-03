"use client"

import { useState } from "react"
const Difficulty = { BEGINNER: "BEGINNER", INTERMEDIATE: "INTERMEDIATE", ADVANCED: "ADVANCED" } as const;
type Difficulty = typeof Difficulty[keyof typeof Difficulty];
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateWorkoutPlanAction, generateDietPlanAction } from "@/actions/plans"
import { generateWorkoutPlanSchema, generateDietPlanSchema } from "@/lib/validations/schemas"
import { toast } from "sonner"
import { Dumbbell, Utensils } from "lucide-react"

export function PlanGeneratorClient({ workoutPlans, dietPlans }: { workoutPlans: any[], dietPlans: any[] }) {
  const [isGeneratingW, setIsGeneratingW] = useState(false)
  const [isGeneratingD, setIsGeneratingD] = useState(false)

  // Workout state
  const [wName, setWName] = useState("My 4-Day Split")
  const [days, setDays] = useState("4")
  const [experience, setExperience] = useState<Difficulty>(Difficulty.INTERMEDIATE)

  // Diet state
  const [dName, setDName] = useState("High Protein Diet")
  const [preference, setPreference] = useState("No Restrictions")

  const handleGenWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const parsed = generateWorkoutPlanSchema.safeParse({ name: wName, daysPerWeek: parseInt(days), experience })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      return
    }

    setIsGeneratingW(true)
    const res = await generateWorkoutPlanAction(parsed.data)
    if (res.success) {
      toast.success("Workout plan generated!")
    } else {
      toast.error(res.error || "Failed to generate")
    }
    setIsGeneratingW(false)
  }

  const handleGenDiet = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsed = generateDietPlanSchema.safeParse({ name: dName, preference })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      return
    }

    setIsGeneratingD(true)
    const res = await generateDietPlanAction(parsed.data)
    if (res.success) {
      toast.success("Diet plan generated!")
    } else {
      toast.error(res.error || "Failed to generate")
    }
    setIsGeneratingD(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5" /> Generate Workout Plan</CardTitle>
            <CardDescription>Creates a structured program based on your goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenWorkout} className="space-y-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input value={wName} onChange={e => setWName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Days Per Week</Label>
                <Input type="number" min="1" max="7" value={days} onChange={e => setDays(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <select 
                  value={experience} 
                  onChange={e => setExperience(e.target.value as Difficulty)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value={Difficulty.BEGINNER}>Beginner</option>
                  <option value={Difficulty.INTERMEDIATE}>Intermediate</option>
                  <option value={Difficulty.ADVANCED}>Advanced</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={isGeneratingW}>
                {isGeneratingW ? "Generating..." : "Generate Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {workoutPlans.map(plan => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.daysPerWeek} days/week • {plan.experience}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.days.map((day: any) => (
                  <div key={day.id} className="text-sm">
                    <div className="font-semibold">{day.name}</div>
                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                      {day.exercises.map((ex: any) => (
                        <li key={ex.id}>{ex.exercise.name} ({ex.sets}x{ex.reps})</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Generate Diet Plan</CardTitle>
            <CardDescription>Creates a macro-balanced diet plan based on your TDEE.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenDiet} className="space-y-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input value={dName} onChange={e => setDName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Dietary Preference</Label>
                <Input placeholder="e.g. Vegetarian, Keto, No Restrictions" value={preference} onChange={e => setPreference(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isGeneratingD}>
                {isGeneratingD ? "Generating..." : "Generate Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {dietPlans.map(plan => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.targetCalories} kcal • {plan.targetProtein}g P • {plan.targetCarbs}g C • {plan.targetFat}g F</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {plan.meals.map((meal: any) => (
                  <div key={meal.id} className="text-sm flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold">{meal.name}</div>
                      <div className="text-xs text-muted-foreground">{meal.items}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{meal.calories} kcal</div>
                      <div className="text-xs text-muted-foreground">{meal.protein}P {meal.carbs}C {meal.fat}F</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
