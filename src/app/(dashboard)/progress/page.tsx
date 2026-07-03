import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ProgressClient } from "./progress-client"

export const metadata = {
  title: "Progress",
}

export default async function ProgressPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders
  })

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey over time.</p>
        </div>
      </div>
      <ProgressClient />
    </div>
  )
}
