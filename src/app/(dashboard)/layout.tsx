import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const reqHeaders = await headers()
  
  // -- TEMPORARY DEBUG LOGGING --
  console.log("=== DASHBOARD LAYOUT AUTH DEBUG ===")
  console.log("Cookie header present:", !!reqHeaders.get("cookie"))
  if (reqHeaders.get("cookie")) {
    console.log("Raw Cookie snippet:", reqHeaders.get("cookie")?.substring(0, 50) + "...")
  } else {
    console.log("WARNING: No cookie header found in request!")
  }

  const session = await auth.api.getSession({
    headers: reqHeaders
  })
  
  console.log("Session resolved:", session ? "YES" : "NO", session?.user?.email || "")
  console.log("===================================")

  if (!session?.user) {
    console.log("Redirecting to /login because session is null")
    redirect("/login")
  }

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  )
}
