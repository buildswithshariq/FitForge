import { prisma } from "@/lib/db/prisma"
import { startOfDay, endOfDay } from "@/lib/utils/dates"

export class DashboardRepository {
  async getDailyStats(userId: string, date: Date) {
    const start = startOfDay(date)
    const end = endOfDay(date)

    const [waterEntries, foodEntries, workoutLogs, profile] = await Promise.all([
      prisma.waterEntry.findMany({
        where: { userId, date: { gte: start, lte: end } }
      }),
      prisma.foodEntry.findMany({
        where: { userId, date: { gte: start, lte: end } }
      }),
      prisma.workoutLog.findMany({
        where: { userId, date: { gte: start, lte: end }, completed: true }
      }),
      prisma.profile.findUnique({
        where: { userId }
      })
    ])

    return {
      waterEntries,
      foodEntries,
      workoutLogs,
      profile
    }
  }
}

export const dashboardRepository = new DashboardRepository()
