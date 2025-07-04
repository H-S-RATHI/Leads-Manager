import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")
    const since = searchParams.get("since") || "30"
    const until = searchParams.get("until") || "1"

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    }

    // This would normally fetch from Facebook Marketing API
    // For demo purposes, returning mock data
    const mockInsights = {
      data: [
        {
          impressions: "10000",
          clicks: "500",
          spend: "250.00",
          cpc: "0.50",
          cost_per_lead: "5.00",
          date_start: new Date(Date.now() - Number.parseInt(since) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          date_stop: new Date(Date.now() - Number.parseInt(until) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
      ],
    }

    return NextResponse.json(mockInsights)
  } catch (error) {
    console.error("Error fetching ad insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
