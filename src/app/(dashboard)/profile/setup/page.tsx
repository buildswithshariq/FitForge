import { SetupForm } from "@/components/profile/setup-form"
import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { profileService } from "@/services/profile.service"

export const metadata = {
  title: "Setup Profile",
}

export default async function SetupProfilePage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders
  })

  if (!session?.user) {
    redirect("/login")
  }

  const profile = await profileService.getProfile(session.user.id)
  if (profile) {
    // If they already have a profile, go straight to dashboard
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4 md:p-8">
      <SetupForm />
    </div>
  )
}
