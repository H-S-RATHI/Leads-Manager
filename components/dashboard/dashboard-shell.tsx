"use client"
import { useState } from "react"
import { DesktopSidebar } from "./desktop-sidebar"
import { Header } from "./header"
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ChevronRight } from "lucide-react";

export function DashboardShell({ user, children }: { user: any; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const isSuperAdmin = user.role === "super_admin";
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for super_admin: hide on mobile when collapsed, show open button */}
      {isSuperAdmin && collapsed && (
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded bg-gray-900 text-white shadow-lg lg:hidden"
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
      <div
        className={
          isSuperAdmin
            ? collapsed
              ? "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-16 lg:flex-col"
              : "fixed inset-y-0 flex w-64 flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:flex"
            : collapsed
              ? "fixed inset-y-0 flex w-16 flex-col"
              : "fixed inset-y-0 flex w-64 flex-col"
        }
      >
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