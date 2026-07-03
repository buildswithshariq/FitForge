import { BMICalculator } from "@/components/tools/bmi-calculator"
import { BMRCalculator } from "@/components/tools/bmr-calculator"

export const metadata = {
  title: "Fitness Tools",
}

export default function BMIPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Fitness Tools</h1>
        <p className="text-muted-foreground">Calculate your Body Mass Index and Basal Metabolic Rate.</p>
      </div>
      <div className="flex flex-col gap-8 items-center justify-center">
        <BMICalculator />
        <BMRCalculator />
      </div>
    </div>
  )
}
