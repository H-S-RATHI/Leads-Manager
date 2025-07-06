import { useQuery } from "@tanstack/react-query"
import { createPersistentQuery } from "@/lib/query-client"

interface Stats {
  totalLeads: number
  newLeads: number
  totalUsers: number
  conversionRate: number
}

export function useDashboardStats() {
  const queryKey = ["dashboard-stats"]
  
  const fetchStats = async (): Promise<Stats> => {
    const response = await fetch("/api/dashboard/stats")
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats")
    }
    return response.json()
  }

  return useQuery({
    ...createPersistentQuery(queryKey, fetchStats, 3 * 60 * 1000), // 3 minutes cache
    staleTime: 60 * 1000, // 1 minute
  })
} 