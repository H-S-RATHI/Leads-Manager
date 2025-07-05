import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchAdAccounts } from "@/lib/facebook"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Fetch ad accounts from Facebook
      const adAccounts = await fetchAdAccounts()
      
      return NextResponse.json(adAccounts)
    } catch (facebookError) {
      console.error("Facebook API error:", facebookError)
      
      // Return empty data if Facebook API fails
      return NextResponse.json({ data: [] })
    }
  } catch (error) {
    console.error("Error fetching ad accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 