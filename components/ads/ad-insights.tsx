"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function AdInsights() {
  const [accountId, setAccountId] = useState("")
  const [dateRange, setDateRange] = useState({
    since: "",
    until: "",
  })
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchInsights = async () => {
    if (!accountId) {
      toast({
        title: "Error",
        description: "Please enter an account ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        accountId,
        since: dateRange.since || "30",
        until: dateRange.until || "1",
      })

      const response = await fetch(`/api/ads/insights?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      } else {
        throw new Error("Failed to fetch insights")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ad insights",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fetch Ad Insights</CardTitle>
          <CardDescription>Enter your Facebook Ad Account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountId">Ad Account ID</Label>
            <Input
              id="accountId"
              placeholder="act_1234567890"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="since">Since (days ago)</Label>
              <Input
                id="since"
                type="number"
                placeholder="30"
                value={dateRange.since}
                onChange={(e) => setDateRange({ ...dateRange, since: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="until">Until (days ago)</Label>
              <Input
                id="until"
                type="number"
                placeholder="1"
                value={dateRange.until}
                onChange={(e) => setDateRange({ ...dateRange, until: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={fetchInsights} disabled={loading}>
            {loading ? "Fetching..." : "Fetch Insights"}
          </Button>
        </CardContent>
      </Card>

      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Ad Performance</CardTitle>
            <CardDescription>Your campaign metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Impressions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Clicks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-sm text-gray-600">CPC</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-sm text-gray-600">Cost per Lead</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Note: Connect your Facebook Marketing API to see real data</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
