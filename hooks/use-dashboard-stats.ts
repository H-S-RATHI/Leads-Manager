import { useQuery } from "@tanstack/react-query"

interface Stats {
  totalLeads: number
  newLeads: number
  totalUsers: number
  conversionRate: number
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<Stats> => {
      const response = await fetch("/api/dashboard/stats")
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats")
      }
      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
  })
} 