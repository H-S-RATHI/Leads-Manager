import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsersTable } from "@/components/users/users-table"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  if (!session || !["super_admin", "admin"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <UsersTable />
    </div>
  )
}
