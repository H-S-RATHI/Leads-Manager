import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Determine role based on email
    let role = "sales_rep"
    if (email === process.env.SUPER_ADMIN_EMAIL) {
      role = "super_admin"
    } else if (email === process.env.ADMIN_EMAIL) {
      role = "admin"
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    })

    return NextResponse.json({ message: "User created successfully", userId: user._id }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
