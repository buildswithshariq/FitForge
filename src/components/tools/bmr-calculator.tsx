"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BMRCalculator() {
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE")
  const [bmr, setBmr] = useState<number | null>(null)

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseInt(age)
    if (!w || !h || !a) return
    
    // Mifflin-St Jeor Equation
    let calculatedBmr = (10 * w) + (6.25 * h) - (5 * a)
    if (gender === "MALE") {
      calculatedBmr += 5
    } else {
      calculatedBmr -= 161
    }
    
    setBmr(calculatedBmr)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>BMR Calculator</CardTitle>
        <CardDescription>Calculate your Basal Metabolic Rate</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bmr-gender">Gender</Label>
            <select 
              id="bmr-gender"
              value={gender} 
              onChange={e => setGender(e.target.value as "MALE" | "FEMALE")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-age">Age (years)</Label>
            <Input 
              id="bmr-age" 
              type="number" 
              value={age} 
              onChange={e => setAge(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-weight">Weight (kg)</Label>
            <Input 
              id="bmr-weight" 
              type="number" 
              step="0.1" 
              value={weight} 
              onChange={e => setWeight(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmr-height">Height (cm)</Label>
            <Input 
              id="bmr-height" 
              type="number" 
              value={height} 
              onChange={e => setHeight(e.target.value)} 
              required 
            />
          </div>
          <Button type="submit" className="w-full">Calculate BMR</Button>
        </form>

        {bmr && (
          <div className="mt-6 p-4 border rounded-lg flex flex-col items-center justify-center text-center space-y-2 bg-muted/50">
            <span className="text-sm text-muted-foreground">Your BMR is</span>
            <span className="text-4xl font-bold">{Math.round(bmr)}</span>
            <span className="text-sm text-muted-foreground">kcal / day</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
