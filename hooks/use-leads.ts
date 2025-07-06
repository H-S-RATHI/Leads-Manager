import { useQuery } from "@tanstack/react-query"
import { createPersistentQuery } from "@/lib/query-client"

interface Lead {
  _id: string
  name: string
  email: string
  phone: string
  city: string
  status: string
  assignedTo: any
  createdAt: string
  formName?: string
}

interface LeadsResponse {
  leads: Lead[]
  total: number
  page: number
  totalPages: number
}

export function useLeads(
  page: number = 1,
  limit: number = 10,
  filters: {
    status?: string
    assignedTo?: string
    search?: string
  } = {},
  userRole?: string,
  userId?: string
) {
  const queryKey = ["leads", page, limit, filters, userRole, userId]
  
  const fetchLeads = async (): Promise<LeadsResponse> => {
    const params = new URLSearchParams()
    params.set("page", page.toString())
    params.set("limit", limit.toString())

    // For sales reps, automatically filter to only their assigned leads
    if (userRole === "sales_rep") {
      params.set("assignedTo", userId || "")
    }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        if (key === "assignedTo" && userRole === "sales_rep") return
        params.set(key, value)
      }
    })

    const response = await fetch(`/api/leads?${params.toString()}`)
    if (!response.ok) {
      throw new Error("Failed to fetch leads")
    }
    return response.json()
  }

  return useQuery({
    ...createPersistentQuery(queryKey, fetchLeads, 0), // No persistent cache
    staleTime: 0, // Always stale
  })
} 