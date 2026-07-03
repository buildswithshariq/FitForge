"use client"

import { useState } from "react"
import { addWaterAction } from "@/actions/water"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { APP_CONSTANTS } from "@/constants/app"
import { Droplets, Plus } from "lucide-react"
import { toast } from "sonner"

import { addWaterSchema } from "@/lib/validations/schemas"

interface WaterTrackerProps {
  consumed: number
  goal: number
}

export function WaterTracker({ consumed, goal }: WaterTrackerProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddWater = async (amount: number) => {
    // Client-side validation
    const parsed = addWaterSchema.safeParse({ amount })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input")
      return
    }

    setIsLoading(true)
    try {
      const result = await addWaterAction({ amount })
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success(`Added ${amount}ml of water`)
      }
    } catch (err) {
      toast.error("Failed to add water")
    } finally {
      setIsLoading(false)
    }
  }

  const progress = Math.min((consumed / goal) * 100, 100)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          Water Intake
        </CardTitle>
        <CardDescription>Daily goal: {goal} ml</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 128 128">
              {/* Background track */}
              <circle
                className="text-muted stroke-current"
                strokeWidth="8"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              {/* Progress ring */}
              <circle
                className="text-blue-500 transition-all duration-1000 ease-in-out stroke-current"
                strokeWidth="8"
                strokeDasharray={`${(progress / 100) * 351.86} 351.86`}
                strokeLinecap="round"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className="text-2xl font-bold">{consumed}</span>
              <span className="text-xs text-muted-foreground">ml</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {APP_CONSTANTS.WATER_QUICK_ADD_OPTIONS.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => handleAddWater(amount)}
              className="flex gap-1"
            >
              <Plus className="h-3 w-3" />
              {amount}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
