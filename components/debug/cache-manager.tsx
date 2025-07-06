"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCacheInfo, clearAllCache } from "@/lib/cache-utils"

export function CacheManager() {
  const [cacheInfo, setCacheInfo] = useState(getCacheInfo())

  const refreshCacheInfo = () => {
    setCacheInfo(getCacheInfo())
  }

  const handleClearCache = () => {
    clearAllCache()
    refreshCacheInfo()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Cache Manager (Debug)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>React Query Cache:</span>
            <span className="font-mono">{cacheInfo.reactQueryCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Persistent Cache:</span>
            <span className="font-mono">{cacheInfo.persistentCacheCount}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button onClick={refreshCacheInfo} size="sm" variant="outline" className="w-full">
            Refresh Info
          </Button>
          <Button onClick={handleClearCache} size="sm" variant="destructive" className="w-full">
            Clear All Cache
          </Button>
        </div>

        {cacheInfo.persistentCacheKeys.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Cached Keys:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {cacheInfo.persistentCacheKeys.map((key, index) => (
                <div key={index} className="text-xs font-mono bg-gray-100 p-1 rounded">
                  {key.substring(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 