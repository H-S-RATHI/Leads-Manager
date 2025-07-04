import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Activity } from "@/lib/models/Activity"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    await connectDB()

    const skip = (page - 1) * limit

    const [activities, total] = await Promise.all([
      Activity.find().populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Activity.countDocuments(),
    ])

    return NextResponse.json({
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { action, details } = await request.json()

    await connectDB()

    const activity = await Activity.create({
      user: session?.user?.id || null,
      action,
      details,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
