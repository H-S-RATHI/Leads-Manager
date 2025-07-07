"use client"

import { useQuery } from "@tanstack/react-query"
import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfilePage() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const res = await fetch("/api/profile")
      if (!res.ok) throw new Error("Failed to fetch user profile")
      return res.json()
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Could not load profile.</div>

  return (
    <div className="space-y-6">

      <ProfileForm user={user} onProfileUpdated={refetch} />
    </div>
  )
}
