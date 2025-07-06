import { useQuery } from "@tanstack/react-query"
import { createPersistentQuery } from "@/lib/query-client"

interface Post {
  _id: string
  content: string
  author: {
    _id: string
    name: string
    profilePhoto?: string
  }
  likes: any[]
  editHistory?: Array<{
    previousContent: string
    editedBy: {
      _id: string
      name: string
    }
    editedAt: string
  }>
  createdAt: string
  updatedAt: string
}

interface FeedResponse {
  posts: Post[]
  total: number
}

export function useFeed() {
  const queryKey = ["feed"]
  
  const fetchFeed = async (): Promise<FeedResponse> => {
    const response = await fetch("/api/feed")
    if (!response.ok) {
      throw new Error("Failed to fetch feed")
    }
    return response.json()
  }

  return useQuery({
    ...createPersistentQuery(queryKey, fetchFeed, 0), // No persistent cache
    staleTime: 0, // Always stale
  })
} 