import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    await connectDB()

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: session.user.id },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already taken" }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { name, email, updatedAt: new Date() },
      { new: true },
    ).select("-password")

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
