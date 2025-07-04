import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdInsights } from "@/components/ads/ad-insights"

export default async function AdsPage() {
  const session = await getServerSession(authOptions)

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
