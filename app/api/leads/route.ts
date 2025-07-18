import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "createdAt"

    await connectDB()

    // Build query based on user role
    const query: any = {}

    // Sales reps can ONLY see leads assigned to them
    if (session.user.role === "sales_rep") {
      query.assignedTo = session.user.id
    } else {
      // Admin and Super Admin can see all leads with optional filtering
      if (assignedTo === "unassigned") {
        query.assignedTo = null
      } else if (assignedTo && assignedTo !== "unassigned" && assignedTo !== "all") {
        query.assignedTo = assignedTo
      }
    }

    // Apply other filters
    if (status && status !== "all") query.status = status
    if (category && category !== "all") query.category = category
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const skip = (page - 1) * limit

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "name email")
        .sort({ [sort]: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(query),
    ])

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    const {
      name,
      phone = null,
      city = null,
    } = body
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    const lead = await Lead.create({
      formName: "CRM Leads Adding Form",
      name,
      phone,
      city,
      assignmentHistory: [],
      statusHistory: [],
      source: "website_form",
      formId: randomUUID(),
      leadgenId: randomUUID(),
    })
    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
