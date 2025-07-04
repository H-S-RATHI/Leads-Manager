"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Activity {
  _id: string
  user: {
    name: string
    email: string
  } | null
  action: string
  details: any
  createdAt: string
}

export function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchActivities()
  }, [currentPage])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/activity?page=${currentPage}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "bg-green-100 text-green-800"
      case "lead_received":
        return "bg-blue-100 text-blue-800"
      case "lead_assigned":
        return "bg-yellow-100 text-yellow-800"
      case "lead_status_changed":
        return "bg-purple-100 text-purple-800"
      case "conversion_sent":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {activities.map((activity) => (
          <Card key={activity._id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getActionColor(activity.action)}>{formatAction(activity.action)}</Badge>
                    <span className="text-sm text-gray-500">{activity.user ? activity.user.name : "System"}</span>
                  </div>
                  <p className="text-sm text-gray-600">{new Date(activity.createdAt).toLocaleString()}</p>
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(activity.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
