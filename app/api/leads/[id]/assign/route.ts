import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"
import { User } from "@/lib/models/User"
import { Activity } from "@/lib/models/Activity"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignedTo, note, password } = await request.json()

    await connectDB()

    const lead = await Lead.findById(params.id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Check permissions
    const canAssign =
      ["super_admin", "admin"].includes(session.user.role) ||
      (session.user.role === "sales_rep" && lead.assignedTo?.toString() === session.user.id)

    if (!canAssign) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If sales rep, verify password
    if (session.user.role === "sales_rep") {
      if (!password) {
        return NextResponse.json({ error: "Password required" }, { status: 400 })
      }

      const user = await User.findById(session.user.id)
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid password" }, { status: 400 })
      }
    }

    // Update lead assignment
    lead.assignedTo = assignedTo
    lead.assignmentHistory.push({
      assignedTo,
      assignedBy: session.user.id,
      note,
      assignedAt: new Date(),
    })
    lead.updatedAt = new Date()

    await lead.save()

    // Log activity
    await Activity.create({
      user: session.user.id,
      action: "lead_assigned",
      details: {
        leadId: lead._id,
        assignedTo,
        note,
      },
    })

    // Populate and return updated lead
    await lead.populate("assignedTo", "name email")

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error assigning lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
