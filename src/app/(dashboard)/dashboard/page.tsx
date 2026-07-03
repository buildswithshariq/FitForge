import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { healthEngine } from "@/services/health-engine.service"
import { StatCard } from "@/components/dashboard/stat-card"
import { WaterTracker } from "@/components/trackers/water-tracker"
import { WeightTracker } from "@/components/trackers/weight-tracker"
import { DailyNoteWidget } from "@/components/trackers/daily-note-widget"
import { GoalInsightsWidget } from "@/components/dashboard/goal-insights-widget"
import { Activity, Droplets, Dumbbell, Utensils, Flame } from "lucide-react"
import { goalEngine } from "@/services/goal-engine.service"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders
  })

  if (!session?.user) {
    redirect("/login")
  }

  // Get the snapshot from the Health Engine
  const today = new Date()
  const snapshot = await healthEngine.getDashboardSnapshot(session.user.id, today)
  
  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please complete your profile to view the dashboard.</p>
      </div>
    )
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  const insights = await goalEngine.getGoalInsights(session.user.id)

  const calsLeft = Math.max(0, snapshot.targetCalories - snapshot.caloriesBurned)
  const isGoalUnder = snapshot.netCalories < snapshot.targetCalories

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session.user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here is your summary for today. {snapshot.goalStatus}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-2 row-span-2">
          <GoalInsightsWidget insights={insights} />
        </div>
        <StatCard
          title="Calories Consumed"
          value={`${snapshot.caloriesConsumed} kcal`}
          subtitle={`Goal: ${snapshot.targetCalories} kcal`}
          icon={Activity}
          progress={snapshot.completionPercentage}
        />
        <StatCard
          title="Calories Burned"
          value={`${snapshot.caloriesBurned} kcal`}
          subtitle={`Goal: ${Math.round(snapshot.maintenanceCals - snapshot.targetCalories) || 500} kcal`}
          icon={Flame}
          progress={(snapshot.caloriesBurned / Math.max(Math.round(snapshot.maintenanceCals - snapshot.targetCalories) || 500, 1)) * 100}
        />
        <StatCard
          title="Protein"
          value={`${snapshot.protein}g`}
          subtitle={`Goal: ${profile?.targetProtein || 150}g`}
          icon={Utensils}
          progress={(snapshot.protein / (profile?.targetProtein || 150)) * 100}
        />
        <StatCard
          title="Water"
          value={`${snapshot.waterIntake} ml`}
          subtitle={`Goal: 2500 ml`}
          icon={Droplets}
          progress={(snapshot.waterIntake / 2500) * 100}
        />
        <StatCard
          title="Workouts"
          value={snapshot.totalWorkouts}
          subtitle={snapshot.totalWorkouts === 1 ? "Completed today" : "Completed today"}
          icon={Dumbbell}
        />
      </div>

      {/* Widgets for specific sections will go here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <WaterTracker consumed={snapshot.waterIntake} goal={2500} />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeightTracker 
            currentWeight={snapshot.weight || 0}
            targetWeight={profile?.targetWeight || 0}
            height={profile?.height || 0}
            bmi={snapshot.bmi}
          />
          <DailyNoteWidget initialNote={snapshot.dailyNote ?? ""} />
        </div>
      </div>
    </div>
  )
}
