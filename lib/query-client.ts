import { QueryClient } from "@tanstack/react-query"
import { persistentCache } from "./persistent-cache"

// Create a custom query client with persistent cache
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Helper function to create queries with persistent cache
export function createPersistentQuery<T>(
  queryKey: any[],
  fetchFn: () => Promise<T>,
  ttl: number = 0
) {
  return {
    queryKey,
    queryFn: async (): Promise<T> => {
      const cacheKey = JSON.stringify(queryKey)
      
      // Check persistent cache first
      const cachedData = persistentCache.get<T>(cacheKey)
      if (cachedData) {
        console.log('📦 Loading from persistent cache:', cacheKey)
        return cachedData
      }

      // If not in cache, fetch from API
      const data = await fetchFn()
      // Store in persistent cache
      persistentCache.set(cacheKey, data, ttl)
      console.log('🌐 Fetched from API and cached:', cacheKey)
      return data
    },
  }
} 