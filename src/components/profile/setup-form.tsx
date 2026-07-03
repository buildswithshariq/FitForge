"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateProfileAction } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
const Gender = { MALE: "MALE", FEMALE: "FEMALE", OTHER: "OTHER" };
const Goal = { WEIGHT_LOSS: "WEIGHT_LOSS", MUSCLE_GAIN: "MUSCLE_GAIN", MAINTAIN_WEIGHT: "MAINTAIN_WEIGHT" };
const ActivityLevel = {
  SEDENTARY: "SEDENTARY",
  LIGHTLY_ACTIVE: "LIGHTLY_ACTIVE",
  MODERATELY_ACTIVE: "MODERATELY_ACTIVE",
  VERY_ACTIVE: "VERY_ACTIVE",
  SUPER_ACTIVE: "SUPER_ACTIVE"
};

export function SetupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateProfileAction({
        age: parseInt(formData.get("age") as string),
        gender: formData.get("gender") as any,
        height: parseFloat(formData.get("height") as string),
        currentWeight: parseFloat(formData.get("currentWeight") as string),
        targetWeight: parseFloat(formData.get("targetWeight") as string),
        goal: formData.get("goal") as any,
        activityLevel: formData.get("activityLevel") as any,
      })
      
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success("Profile setup complete!")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">Setup Your Profile</CardTitle>
        <CardDescription>
          We need a few details to personalize your fitness journey and calculate your targets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" placeholder="25" required min={10} max={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select 
                id="gender" 
                name="gender" 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={Gender.MALE}>Male</option>
                <option value={Gender.FEMALE}>Female</option>
                <option value={Gender.OTHER}>Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" name="height" type="number" placeholder="175" required min={100} max={300} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentWeight">Current Weight (kg)</Label>
              <Input id="currentWeight" name="currentWeight" type="number" step="0.1" placeholder="70" required min={30} max={300} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target Weight (kg)</Label>
              <Input id="targetWeight" name="targetWeight" type="number" step="0.1" placeholder="65" required min={30} max={300} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Primary Goal</Label>
              <select 
                id="goal" 
                name="goal" 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={Goal.WEIGHT_LOSS}>Weight Loss</option>
                <option value={Goal.MUSCLE_GAIN}>Muscle Gain</option>
                <option value={Goal.MAINTAIN_WEIGHT}>Maintain Weight</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">Activity Level</Label>
            <select 
              id="activityLevel" 
              name="activityLevel" 
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={ActivityLevel.SEDENTARY}>Sedentary (Little to no exercise)</option>
              <option value={ActivityLevel.LIGHTLY_ACTIVE}>Lightly Active (Light exercise 1-3 days/week)</option>
              <option value={ActivityLevel.MODERATELY_ACTIVE}>Moderately Active (Moderate exercise 3-5 days/week)</option>
              <option value={ActivityLevel.VERY_ACTIVE}>Very Active (Hard exercise 6-7 days/week)</option>
              <option value={ActivityLevel.SUPER_ACTIVE}>Super Active (Very hard exercise & physical job)</option>
            </select>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Calculating targets..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
