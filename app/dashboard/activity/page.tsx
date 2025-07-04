import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ActivityLog } from "@/components/activity/activity-log"

export default async function ActivityPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "super_admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-gray-600">Monitor all system activities</p>
      </div>

      <ActivityLog />
    </div>
  )
}
