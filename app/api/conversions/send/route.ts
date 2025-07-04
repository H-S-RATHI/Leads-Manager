import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendConversionEvent } from "@/lib/facebook"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventData = await request.json()

    const result = await sendConversionEvent(eventData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending conversion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
