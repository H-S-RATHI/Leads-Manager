import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const lead = await Lead.findById(params.id)
      .populate("assignedTo", "name email")
      .populate("assignmentHistory.assignedTo", "name email")
      .populate("assignmentHistory.assignedBy", "name email")
      .populate("statusHistory.changedBy", "name email")

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Check permissions - sales reps can only see their assigned leads
    if (session.user.role === "sales_rep" && lead.assignedTo?._id?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
