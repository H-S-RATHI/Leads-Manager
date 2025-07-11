import { useQuery, useInfiniteQuery, QueryFunctionContext } from "@tanstack/react-query"
import { createPersistentQuery } from "@/lib/query-client"

export interface Lead {
  _id: string
  name: string
  email: string
  phone: string
  city: string
  status: string
  assignedTo: any
  createdAt: string
  formName?: string
  statusHistory?: { status: string; changedBy?: any; changedAt?: string; info?: string }[];
}

export interface LeadsResponse {
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

// Infinite scroll version
export function useLeadsInfinite(
  limit: number = 10,
  filters: {
    status?: string
    assignedTo?: string
    search?: string
  } = {},
  userRole?: string,
  userId?: string
) {
  return useInfiniteQuery<LeadsResponse, Error, LeadsResponse, [string, number, typeof filters, string?, string?]>(
    {
      queryKey: ["leads-infinite", limit, filters, userRole, userId],
      queryFn: async (context: QueryFunctionContext) => {
        const pageParam = (context.pageParam as number) || 1
        const params = new URLSearchParams()
        params.set("page", pageParam.toString())
        params.set("limit", limit.toString())
        if (userRole === "sales_rep") {
          params.set("assignedTo", userId || "")
        }
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
        const json = await response.json();
        console.log('API /api/leads response', json);
        return json as LeadsResponse;
      },
      getNextPageParam: (lastPage: LeadsResponse) => {
        if (!lastPage) return undefined
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1
        }
        return undefined
      },
      initialPageParam: 1,
      staleTime: 0,
    }
  )
} 