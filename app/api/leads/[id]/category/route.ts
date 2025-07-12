import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"
import { Activity } from "@/lib/models/Activity"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const category = body.category

    if (!["none", "hot", "warm", "cold"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    await connectDB()

    const lead = await Lead.findById(params.id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "sales_rep" && lead.assignedTo?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const oldCategory = lead.category
    lead.category = category
    lead.updatedAt = new Date()

    await lead.save()

    // Log activity
    await Activity.create({
      user: session.user.id,
      action: "lead_category_changed",
      details: {
        leadId: lead._id,
        oldCategory,
        newCategory: category,
      },
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error("Error updating lead category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 