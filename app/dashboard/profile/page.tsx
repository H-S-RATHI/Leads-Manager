import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <ProfileForm user={session?.user} />
    </div>
  )
}
