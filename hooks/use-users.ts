import { useQuery } from "@tanstack/react-query"
import { createPersistentQuery } from "@/lib/query-client"

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  profilePhoto?: string
}

interface UsersResponse {
  users: User[]
}

export function useUsers() {
  const queryKey = ["users"]
  
  const fetchUsers = async (): Promise<UsersResponse> => {
    const response = await fetch("/api/users")
    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }
    return response.json()
  }

  return useQuery({
    ...createPersistentQuery(queryKey, fetchUsers, 10 * 60 * 1000), // 10 minutes cache
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
} 