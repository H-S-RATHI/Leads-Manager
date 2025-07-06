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
    ...createPersistentQuery(queryKey, fetchLead, 0), // No persistent cache
    staleTime: 0, // Always stale
  })
} 