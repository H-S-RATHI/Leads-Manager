import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"
import { Activity } from "@/lib/models/Activity"
import { sendConversionEvent, hashUserData } from "@/lib/facebook"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()

    if (!["New", "Contacted", "Qualified", "Purchased"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
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

    const oldStatus = lead.status
    lead.status = status
    lead.statusHistory.push({
      status,
      changedBy: session.user.id,
      changedAt: new Date(),
    })
    lead.updatedAt = new Date()

    await lead.save()

    // Log activity
    await Activity.create({
      user: session.user.id,
      action: "lead_status_changed",
      details: {
        leadId: lead._id,
        oldStatus,
        newStatus: status,
      },
    })

    // Send conversion event to Facebook
    try {
      const eventName = getEventNameFromStatus(status)
      if (eventName) {
        const conversionData = {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          user_data: {
            em: [hashUserData(lead.email)],
            ph: lead.phone ? [hashUserData(lead.phone)] : undefined,
          },
          custom_data: {
            leadgen_id: lead.leadgenId,
            lead_status: status,
            value: lead.budget || 0,
            currency: "USD",
          },
        }

        await sendConversionEvent(conversionData)

        // Log conversion activity
        await Activity.create({
          user: session.user.id,
          action: "conversion_sent",
          details: {
            leadId: lead._id,
            eventName,
            status,
          },
        })
      }
    } catch (conversionError) {
      console.error("Conversion tracking error:", conversionError)
      // Don't fail the status update if conversion tracking fails
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error updating lead status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getEventNameFromStatus(status: string): string | null {
  switch (status) {
    case "Contacted":
      return "Lead"
    case "Qualified":
      return "CompleteRegistration"
    case "Purchased":
      return "Purchase"
    default:
      return null
  }
}
