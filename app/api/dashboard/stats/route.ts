import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"
import { User } from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Build query based on user role - sales reps only see their assigned leads
    const leadQuery: any = {}
    if (session.user.role === "sales_rep") {
      leadQuery.assignedTo = session.user.id
    }

    const [totalLeads, newLeads, totalUsers, purchasedLeads] = await Promise.all([
      Lead.countDocuments(leadQuery),
      Lead.countDocuments({ ...leadQuery, status: "New" }),
      // Only show user count to admin/super_admin
      session.user.role !== "sales_rep" ? User.countDocuments() : 0,
      Lead.countDocuments({ ...leadQuery, status: "Purchased" }),
    ])

    const conversionRate = totalLeads > 0 ? Math.round((purchasedLeads / totalLeads) * 100) : 0

    return NextResponse.json({
      totalLeads,
      newLeads,
      totalUsers: session.user.role === "sales_rep" ? 0 : totalUsers,
      conversionRate,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
