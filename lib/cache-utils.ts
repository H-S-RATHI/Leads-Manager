import { queryClient } from "./query-client"
import { persistentCache } from "./persistent-cache"

// Utility to invalidate both React Query cache and persistent cache
export function invalidateCache(queryKey: any[]) {
  // Invalidate React Query cache
  queryClient.invalidateQueries({ queryKey })
  
  // Clear persistent cache
  const cacheKey = JSON.stringify(queryKey)
  persistentCache.delete(cacheKey)
}

// Utility to clear all cache
export function clearAllCache() {
  queryClient.clear()
  persistentCache.clear()
}

// Utility to get cache info for debugging
export function getCacheInfo() {
  const reactQueryCache = queryClient.getQueryCache().getAll()
  const persistentCacheKeys = persistentCache.getKeys()
  
  return {
    reactQueryCount: reactQueryCache.length,
    persistentCacheCount: persistentCacheKeys.length,
    persistentCacheKeys,
  }
} 