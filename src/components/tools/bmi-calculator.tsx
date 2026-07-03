"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateBMI, getBMICategory } from "@/lib/calculators/bmi"

export function BMICalculator() {
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [result, setResult] = useState<{ bmi: number; category: { label: string; color: string } } | null>(null)

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const w = parseFloat(weight)
    const h = parseFloat(height)
    if (!w || !h) return
    
    const bmi = calculateBMI(w, h)
    const category = getBMICategory(bmi)
    setResult({ bmi, category })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>BMI Calculator</CardTitle>
        <CardDescription>Calculate your Body Mass Index</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input 
              id="weight" 
              type="number" 
              step="0.1" 
              value={weight} 
              onChange={e => setWeight(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input 
              id="height" 
              type="number" 
              value={height} 
              onChange={e => setHeight(e.target.value)} 
              required 
            />
          </div>
          <Button type="submit" className="w-full">Calculate BMI</Button>
        </form>

        {result && (
          <div className="mt-6 p-4 border rounded-lg flex flex-col items-center justify-center text-center space-y-2 bg-muted/50">
            <span className="text-sm text-muted-foreground">Your BMI is</span>
            <span className="text-4xl font-bold">{result.bmi.toFixed(1)}</span>
            <span className={`text-lg font-medium ${result.category.color}`}>
              {result.category.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
