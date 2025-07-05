"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, TrendingUp, DollarSign } from "lucide-react"

interface Stats {
  totalLeads: number
  newLeads: number
  totalUsers: number
  conversionRate: number
}

export function DashboardStats() {
  const { data: session } = useSession()
  const isSalesRep = session?.user?.role === "sales_rep"
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    newLeads: 0,
    totalUsers: 0,
    conversionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Briefcase,
      color: "text-blue-600",
      showForSalesRep: true,
    },
    {
      title: "New Leads",
      value: stats.newLeads,
      icon: TrendingUp,
      color: "text-green-600",
      showForSalesRep: true,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-600",
      showForSalesRep: false,
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: DollarSign,
      color: "text-orange-600",
      showForSalesRep: false,
    },
  ]

  // Filter stats based on user role
  const filteredStatCards = isSalesRep 
    ? statCards.filter(stat => stat.showForSalesRep)
    : statCards

  if (loading) {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isSalesRep ? 'lg:grid-cols-2' : 'lg:grid-cols-4'}`}>
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
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isSalesRep ? 'lg:grid-cols-2' : 'lg:grid-cols-4'}`}>
      {filteredStatCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
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
}
