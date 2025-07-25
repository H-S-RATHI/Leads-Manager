import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"
import { User } from "@/lib/models/User"
import mongoose from "mongoose"

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
      leadQuery.assignedTo = { $in: [new mongoose.Types.ObjectId(session.user.id)] }
      console.log('session.user.id:', session.user.id, typeof session.user.id);
      const sampleLead = await Lead.findOne();
      console.log('Sample lead assignedTo:', sampleLead?.assignedTo);
      const matchingLeads = await Lead.find(leadQuery);
      console.log('Matching leads for sales rep:', matchingLeads.length);
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
