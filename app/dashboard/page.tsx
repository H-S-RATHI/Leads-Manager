import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentLeads } from "@/components/dashboard/recent-leads"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Welcome back, {session?.user?.name}</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentLeads />
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">• View and manage leads</p>
              <p className="text-gray-600">• Check ad performance</p>
              <p className="text-gray-600">• Update your profile</p>
              <p className="text-gray-600">• Post to company feed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
