import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdInsights } from "@/components/ads/ad-insights"

export default async function AdsPage() {
  const session = await getServerSession(authOptions)

  // Redirect non-super_admin users away from this page
  if (session?.user?.role !== "super_admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ad Performance</h1>
        <p className="text-gray-600">Monitor your Facebook ad campaigns</p>
      </div>

      <AdInsights />
    </div>
  )
}
