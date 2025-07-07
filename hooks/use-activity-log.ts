import { useQuery } from "@tanstack/react-query"

export interface Activity {
  _id: string
  user: {
    name: string
    email: string
  } | null
  action: string
  details: any
  createdAt: string
}

export interface ActivityLogResponse {
  activities: Activity[]
  totalPages: number
}

export function useActivityLog(page: number) {
  return useQuery({
    queryKey: ["activity-log", page],
    queryFn: async () => {
      const response = await fetch(`/api/activity?page=${page}&limit=20`)
      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }
      return response.json()
    },
    staleTime: 0,
  })
} 