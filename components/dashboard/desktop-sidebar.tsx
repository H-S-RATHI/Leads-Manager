"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserCircle, MessageSquare, Activity, BarChart3, Briefcase } from "lucide-react"

interface DesktopSidebarProps {
  user: any
}

export function DesktopSidebar({ user }: DesktopSidebarProps) {
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
    <div className="flex h-full flex-col bg-gray-900 text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold">CRM Dashboard</h2>
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
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
