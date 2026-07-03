import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { dashboardService } from "@/services/dashboard.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db/prisma"
import { startOfDay, endOfDay } from "@/lib/utils/dates"
import { FoodLogClient } from "./food-log-client"

export const metadata = {
  title: "Diet & Nutrition",
}

export default async function DietPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders
  })

  if (!session?.user) {
    redirect("/login")
  }

  const today = new Date()
  const start = startOfDay(today)
  const end = endOfDay(today)

  const [summary, todaysEntries] = await Promise.all([
    dashboardService.getDailySummary(session.user.id, today),
    prisma.foodEntry.findMany({
      where: { userId: session.user.id, date: { gte: start, lte: end } },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Diet & Nutrition</h1>
        <p className="text-muted-foreground">Log your meals and track your macros.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.nutrition.calories}</div>
            <p className="text-xs text-muted-foreground">/ {summary.nutrition.calorieGoal} kcal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Protein</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.nutrition.protein.toFixed(1)}g</div>
            <p className="text-xs text-muted-foreground">/ {summary.nutrition.proteinGoal}g</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Carbs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.nutrition.carbs.toFixed(1)}g</div>
            <p className="text-xs text-muted-foreground">/ {summary.nutrition.carbsGoal}g</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.nutrition.fat.toFixed(1)}g</div>
            <p className="text-xs text-muted-foreground">/ {summary.nutrition.fatGoal}g</p>
          </CardContent>
        </Card>
      </div>

      <FoodLogClient entries={todaysEntries} />
    </div>
  )
}
