import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsTable } from "@/components/leads/leads-table"
import { LeadsFilters } from "@/components/leads/leads-filters"

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads</h1>
      </div>

      <LeadsFilters />
      <LeadsTable userRole={session?.user?.role} userId={session?.user?.id} />
    </div>
  )
}
