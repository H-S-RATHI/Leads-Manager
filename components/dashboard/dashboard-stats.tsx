"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, TrendingUp, DollarSign } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"

interface Stats {
  totalLeads: number
  newLeads: number
  totalUsers: number
  conversionRate: number
}

export const DashboardStats = React.memo(function DashboardStats() {
  const { data: session } = useSession()
  const router = useRouter()
  const isSalesRep = session?.user?.role === "sales_rep"
  const { data: stats, isLoading: loading } = useDashboardStats()

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: Briefcase,
      color: "text-blue-600",
      showForSalesRep: true,
      onClick: () => router.push("/dashboard/leads"),
    },
    {
      title: "New Leads",
      value: stats?.newLeads || 0,
      icon: TrendingUp,
      color: "text-green-600",
      showForSalesRep: true,
      onClick: () => router.push("/dashboard/leads?status=New"),
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-purple-600",
      showForSalesRep: false,
      onClick: () => router.push("/dashboard/users"),
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      icon: DollarSign,
      color: "text-orange-600",
      showForSalesRep: false,
      onClick: () => router.push("/dashboard/leads"),
    },
  ]

  // Filter stats based on user role
  const filteredStatCards = isSalesRep 
    ? statCards.filter(stat => stat.showForSalesRep)
    : statCards

  if (loading) {
    return (
      <div className={`grid grid-cols-2 gap-4 ${isSalesRep ? 'lg:grid-cols-2' : 'lg:grid-cols-4'}`}>
        {[...Array(isSalesRep ? 2 : 4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-4 ${isSalesRep ? 'lg:grid-cols-2' : 'lg:grid-cols-4'}`}>
      {filteredStatCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={stat.onClick}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})
