import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadsFilters } from "@/components/leads/leads-filters"

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">

      <LeadsFilters />
      <LeadsTable userRole={session?.user?.role || ""} userId={session?.user?.id || ""} />
    </div>
  )
}
