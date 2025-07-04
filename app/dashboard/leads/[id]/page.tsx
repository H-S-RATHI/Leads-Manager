import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadDetail } from "@/components/leads/lead-detail"
import { notFound } from "next/navigation"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"

interface LeadPageProps {
  params: {
    id: string
  }
}

export default async function LeadPage({ params }: LeadPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  try {
    await connectDB()
    const lead = await Lead.findById(params.id)
      .populate("assignedTo", "name email")
      .populate("assignmentHistory.assignedTo", "name email")
      .populate("assignmentHistory.assignedBy", "name email")
      .populate("statusHistory.changedBy", "name email")

    if (!lead) {
      notFound()
    }

    // Check permissions - sales reps can only see their assigned leads
    if (session.user.role === "sales_rep" && lead.assignedTo?._id?.toString() !== session.user.id) {
      notFound()
    }

    return (
      <div className="space-y-6">
        <LeadDetail lead={lead.toObject()} userRole={session.user.role ?? ""} userId={session.user.id ?? ""} />
      </div>
    )
  } catch (error) {
    console.error("Error loading lead detail page:", error)
    notFound()
  }
}
