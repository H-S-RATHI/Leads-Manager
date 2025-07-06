"use client"

import { useParams } from "next/navigation"
import { LeadDetail } from "@/components/leads/lead-detail"
import { useSession } from "next-auth/react"
import { useLead } from "@/hooks/use-lead"

export default function LeadPage() {
  const params = useParams()
  const { data: session } = useSession()
  const { data: lead, isLoading, error } = useLead(params.id as string)

  if (!session || !session.user) return null
  if (isLoading) return <div>Loading...</div>
  if (error || !lead) return <div>Lead not found or you do not have access.</div>

  return (
    <div className="space-y-6">
      <LeadDetail lead={lead} userRole={session.user.role ?? ""} userId={session.user.id ?? ""} />
    </div>
  )
}
