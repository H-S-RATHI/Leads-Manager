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

    const { assign = [], unassign = [], note, password } = await request.json()

    await connectDB()

    const lead = await Lead.findById(params.id)
      .populate([
        { path: "assignedTo", select: "name email" },
        { path: "assignmentHistory.assignedTo", select: "name email" },
        { path: "assignmentHistory.assignedBy", select: "name email" },
        { path: "assignmentHistory.unassignedFrom", select: "name email" },
      ])
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

    // Only admin/super_admin can batch assign/unassign
    if (!["admin", "super_admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Batch assign/unassign only allowed for admin or super_admin" }, { status: 403 })
    }

    // Defensive: ensure assignedTo is always an array
    if (!Array.isArray(lead.assignedTo)) {
      lead.assignedTo = []
    }

    // Helper to get user name by id
    const usersCache: Record<string, any> = {}
    const getUserName = (userId: string) => {
      const user = usersCache[userId]
      return user ? user.name : "Unknown"
    }
    // Cache users to avoid multiple DB calls
    const getUser = async (userId: string) => {
      if (!usersCache[userId]) {
        usersCache[userId] = await User.findById(userId).select("name")
      }
      return usersCache[userId]
    }

    // Unassign users
    for (const userId of unassign) {
      console.log('Unassigning userId:', userId)
      console.log('Current assignedTo:', lead.assignedTo)
      lead.assignedTo.forEach((id: any, i: number) => {
        console.log(`assignedTo[${i}]:`, id, 'type:', typeof id, 'id._id:', id?._id)
      })
      // Try both ObjectId and populated object
      const idx = lead.assignedTo.findIndex((id: any) =>
        (typeof id === 'object' && (id._id?.toString?.() === userId)) ||
        (typeof id === 'string' && id === userId)
      )
      console.log('Found index to unassign:', idx)
      if (idx !== -1) {
        console.log('Splicing assignedTo at index:', idx)
        lead.assignedTo.splice(idx, 1)
        console.log('assignedTo after splice:', lead.assignedTo)
        lead.assignmentHistory.push({
          assignedTo: null,
          assignedBy: session.user.id,
          note,
          assignedAt: new Date(),
          action: "unassigned",
          unassignedFrom: userId,
        })
        await Activity.create({
          user: session.user.id,
          action: "lead_unassigned",
          details: {
            leadId: lead._id,
            unassignedFrom: userId,
            note,
          },
        })
      }
      else {
        console.log('UserId not found in assignedTo, nothing to unassign.')
      }
    }

    // Assign users
    for (const userId of assign) {
      if (!lead.assignedTo.some((id: any) => id.toString() === userId)) {
        lead.assignedTo.push(userId)
        lead.assignmentHistory.push({
          assignedTo: userId,
          assignedBy: session.user.id,
          note,
          assignedAt: new Date(),
          action: "assigned",
          unassignedFrom: null,
        })
        await Activity.create({
          user: session.user.id,
          action: "lead_assigned",
          details: {
            leadId: lead._id,
            assignedTo: userId,
            note,
          },
        })
      }
    }

    lead.updatedAt = new Date()
    await lead.save()
    console.log('assignedTo after save:', lead.assignedTo)

    // Re-query and populate after save to ensure all nested fields are populated
    const populatedLead = await Lead.findById(lead._id)
      .populate([
        { path: "assignedTo", select: "name email" },
        { path: "assignmentHistory.assignedTo", select: "name email" },
        { path: "assignmentHistory.assignedBy", select: "name email" },
        { path: "assignmentHistory.unassignedFrom", select: "name email" },
      ])

    // Manual fallback for assignmentHistory.unassignedFrom
    for (const assignment of populatedLead.assignmentHistory) {
      if (
        assignment.action === "unassigned" &&
        assignment.unassignedFrom &&
        typeof assignment.unassignedFrom === "string"
      ) {
        const user = await User.findById(assignment.unassignedFrom).select("name email")
        if (user) assignment.unassignedFrom = user
      }
    }
    return NextResponse.json(populatedLead)
  } catch (error) {
    console.error("Error assigning lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
