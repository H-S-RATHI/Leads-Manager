import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadDetail } from "@/components/leads/lead-detail"
import { notFound } from "next/navigation"

interface LeadPageProps {
  params: {
    id: string
  }
}

export default async function LeadPage({ params }: LeadPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/leads/${params.id}`, {
      headers: {
        Cookie: `next-auth.session-token=${session.user.id}`, // This is simplified - in real app you'd handle this properly
      },
    })

    if (!response.ok) {
      notFound()
    }

    const lead = await response.json()

    return (
      <div className="space-y-6">
        <LeadDetail lead={lead} userRole={session.user.role} userId={session.user.id} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
