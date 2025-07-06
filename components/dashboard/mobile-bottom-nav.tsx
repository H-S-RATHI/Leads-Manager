"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Briefcase, MessageSquare, UserCircle, Users } from "lucide-react"

interface MobileBottomNavProps {
  user: any
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/dashboard/leads", icon: Briefcase },
    { name: "Feed", href: "/dashboard/feed", icon: MessageSquare },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  ]

  // Add admin-only navigation items
  if (["super_admin", "admin"].includes(user?.role)) {
    navigation.splice(3, 0, { name: "Users", href: "/dashboard/users", icon: Users })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white border-t border-gray-200">
        <nav className="flex justify-around">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 