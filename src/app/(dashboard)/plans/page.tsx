import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { PlanGeneratorClient } from "./plan-generator-client"

export const metadata = {
  title: "AI Plans",
}

export default async function PlansPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders
  })

  if (!session?.user) {
    redirect("/login")
  }

  const [workoutPlans, dietPlans] = await Promise.all([
    prisma.workoutPlan.findMany({
      where: { userId: session.user.id },
      include: {
        days: {
          include: {
            exercises: {
              include: { exercise: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.dietPlan.findMany({
      where: { userId: session.user.id },
      include: { meals: true },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Plans</h1>
        <p className="text-muted-foreground">Generate personalized workout and diet plans using the internal rule engine.</p>
      </div>

      <PlanGeneratorClient workoutPlans={workoutPlans} dietPlans={dietPlans} />
    </div>
  )
}
