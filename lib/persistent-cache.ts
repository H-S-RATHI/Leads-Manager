interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class PersistentCache {
  private static instance: PersistentCache
  private cache: Map<string, CacheItem<any>> = new Map()

  static getInstance(): PersistentCache {
    if (!PersistentCache.instance) {
      PersistentCache.instance = new PersistentCache()
    }
    return PersistentCache.instance
  }

  private constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('app-cache')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.cache = new Map(Object.entries(parsed))
        this.cleanExpired()
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
    }
  }

  private saveToStorage() {
    try {
      const obj = Object.fromEntries(this.cache)
      localStorage.setItem('app-cache', JSON.stringify(obj))
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error)
    }
  }

  private cleanExpired() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key)
      }
    }
    this.saveToStorage()
  }

  set<T>(key: string, data: T, ttl: number = 0): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })
    this.saveToStorage()
  }

  get<T>(key: string): T | null {
    this.cleanExpired()
    const item = this.cache.get(key)
    return item ? item.data : null
  }

  has(key: string): boolean {
    this.cleanExpired()
    return this.cache.has(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
    this.saveToStorage()
  }

  clear(): void {
    this.cache.clear()
    localStorage.removeItem('app-cache')
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }
}

export const persistentCache = PersistentCache.getInstance() 