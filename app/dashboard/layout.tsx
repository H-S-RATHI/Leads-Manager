import type React from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import { DesktopSidebar } from "@/components/dashboard/desktop-sidebar"
import { Header } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <MobileSidebar user={session.user} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <DesktopSidebar user={session.user} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <Header user={session.user} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
