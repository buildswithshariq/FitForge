import { EditForm } from "@/components/profile/edit-form"
import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { profileService } from "@/services/profile.service"

export const metadata = {
  title: "Edit Profile",
}

export default async function EditProfilePage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders
  })

  if (!session?.user) {
    redirect("/login")
  }

  const profile = await profileService.getProfile(session.user.id)
  
  if (!profile) {
    redirect("/profile/setup")
  }

  return (
    <div className="container p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal details and fitness targets.</p>
      </div>
      <EditForm profile={profile} />
    </div>
  )
}
