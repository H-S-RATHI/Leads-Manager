import { useQuery } from "@tanstack/react-query"
import { createPersistentQuery } from "@/lib/query-client"

export function useLead(leadId: string) {
  const queryKey = ["lead", leadId]

  const fetchLead = async () => {
    const response = await fetch(`/api/leads/${leadId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch lead")
    }
    return response.json()
  }

  return useQuery({
    ...createPersistentQuery(queryKey, fetchLead, 2 * 60 * 1000), // 2 minutes cache
    staleTime: 30 * 1000, // 30 seconds
  })
} 