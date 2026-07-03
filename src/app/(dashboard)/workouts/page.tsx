import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { startOfDay, endOfDay } from "@/lib/utils/dates"
import { WorkoutLoggerClient } from "./workout-logger-client"

export const metadata = {
  title: "Workouts",
}

export default async function WorkoutsPage() {
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

  const recentWorkouts = await prisma.workoutLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 10,
    include: {
      exercises: {
        include: {
          sets: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
        <p className="text-muted-foreground">Log your training sessions and track your gains.</p>
      </div>

      <WorkoutLoggerClient recentWorkouts={recentWorkouts} />
    </div>
  )
}
