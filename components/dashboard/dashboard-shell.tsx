"use client"
import { useState } from "react"
import { DesktopSidebar } from "./desktop-sidebar"
import { Header } from "./header"
import { MobileBottomNav } from "./mobile-bottom-nav";

export function DashboardShell({ user, children }: { user: any; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={collapsed ? "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-16 lg:flex-col" : "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col"}>
        <DesktopSidebar user={user} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <div className={collapsed ? "lg:pl-16" : "lg:pl-64"}>
        <Header user={user} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      {/* Restore mobile bottom navigation for admin and sales_rep */}
      {['admin', 'sales_rep'].includes(user.role) && (
        <MobileBottomNav user={user} />
      )}
    </div>
  )
} 