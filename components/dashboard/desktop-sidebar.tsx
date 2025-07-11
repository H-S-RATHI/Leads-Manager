"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserCircle, MessageSquare, Activity, BarChart3, Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface DesktopSidebarProps {
  user: any
  collapsed: boolean
  setCollapsed: (c: boolean) => void
}

export function DesktopSidebar({ user, collapsed, setCollapsed }: DesktopSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/dashboard/leads", icon: Briefcase },
    // Ad Performance is only for super_admin
    ...(user?.role === "super_admin" ? [{ name: "Ad Performance", href: "/dashboard/ads", icon: BarChart3 }] : []),
    { name: "Feed", href: "/dashboard/feed", icon: MessageSquare },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  ]

  // Add admin-only navigation items (Users)
  if (["super_admin", "admin"].includes(user?.role)) {
    // Insert Users after Leads, but before Ad Performance for super_admin
    const insertIndex = user?.role === "super_admin" ? 3 : 2
    navigation.splice(insertIndex, 0, { name: "Users", href: "/dashboard/users", icon: Users })
  }

  // Add super admin-only navigation items
  if (user?.role === "super_admin") {
    navigation.push({ name: "Activity", href: "/dashboard/activity", icon: Activity })
  }

  return (
    <div className={cn("flex h-full flex-col bg-gray-900 text-white transition-all duration-200", collapsed ? "w-16" : "w-64")}>
      <div className="flex items-center justify-between p-6">
        {!collapsed && <h2 className="text-xl font-bold">CRM Dashboard</h2>}
        <button
          className="ml-auto p-1 rounded hover:bg-gray-800 focus:outline-none"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Open sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
