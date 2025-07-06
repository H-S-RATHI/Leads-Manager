import { useQuery } from "@tanstack/react-query"

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
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<UsersResponse> => {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
} 