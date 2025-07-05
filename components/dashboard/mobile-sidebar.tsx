"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, Users, UserCircle, MessageSquare, Activity, BarChart3, Briefcase } from "lucide-react"

interface MobileSidebarProps {
  user: any
}

export function MobileSidebar({ user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/dashboard/leads", icon: Briefcase },
    // Ad Performance is only for admin/super_admin
    ...(user?.role !== "sales_rep" ? [{ name: "Ad Performance", href: "/dashboard/ads", icon: BarChart3 }] : []),
    { name: "Feed", href: "/dashboard/feed", icon: MessageSquare },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  ]

  // Add admin-only navigation items
  if (["super_admin", "admin"].includes(user?.role)) {
    navigation.splice(2, 0, { name: "Users", href: "/dashboard/users", icon: Users })
  }

  // Add super admin-only navigation items
  if (user?.role === "super_admin") {
    navigation.push({ name: "Activity", href: "/dashboard/activity", icon: Activity })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col bg-gray-900 text-white">
          <div className="p-4">
            <h2 className="text-xl font-bold">CRM Dashboard</h2>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
