"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addWeightAction } from "@/actions/weight"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scale } from "lucide-react"
import { toast } from "sonner"
import { getBMICategory } from "@/lib/calculators/bmi"
import { addWeightSchema, type AddWeightInput } from "@/lib/validations/schemas"

interface WeightTrackerProps {
  currentWeight: number
  targetWeight: number
  height: number
  bmi: number | null
}

export function WeightTracker({ currentWeight, targetWeight, height, bmi }: WeightTrackerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddWeightInput>({
    resolver: zodResolver(addWeightSchema),
    defaultValues: {
      weight: currentWeight
    }
  })

  const onSubmit = async (data: AddWeightInput) => {
    setIsLoading(true)
    try {
      const result = await addWeightAction(data)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success(`Weight updated to ${data.weight}kg`)
      }
    } catch (err) {
      toast.error("Failed to add weight")
    } finally {
      setIsLoading(false)
    }
  }

  const bmiCategory = bmi ? getBMICategory(bmi) : null

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-indigo-500" />
          Weight Tracking
        </CardTitle>
        <CardDescription>Target: {targetWeight} kg</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex justify-between items-center rounded-lg bg-muted p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Current</span>
            <span className="text-2xl font-bold">{currentWeight} <span className="text-sm font-normal">kg</span></span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-muted-foreground">BMI</span>
            <span className="text-2xl font-bold">{bmi?.toFixed(1) || '--'}</span>
            {bmiCategory && (
              <span className={`text-xs font-medium ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <div className="space-y-2">
            <Label htmlFor="weight">Log Today's Weight</Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register("weight", { valueAsNumber: true })}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Log"}
              </Button>
            </div>
            {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
