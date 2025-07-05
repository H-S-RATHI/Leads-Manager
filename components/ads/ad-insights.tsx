"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function AdInsights() {
  const [accountId, setAccountId] = useState("")
  const [adAccounts, setAdAccounts] = useState([])
  const [dateRange, setDateRange] = useState({
    since: "",
    until: "",
  })
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch ad accounts on component mount
  useEffect(() => {
    const fetchAdAccounts = async () => {
      try {
        const response = await fetch("/api/ads/accounts")
        if (response.ok) {
          const data = await response.json()
          setAdAccounts(data.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch ad accounts:", error)
        toast({
          title: "Error",
          description: "Failed to fetch ad accounts",
          variant: "destructive",
        })
      } finally {
        setAccountsLoading(false)
      }
    }

    fetchAdAccounts()
  }, [toast])

  const fetchInsights = async () => {
    if (!accountId) {
      toast({
        title: "Error",
        description: "Please select an ad account",
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
            <Label htmlFor="accountId">Ad Account</Label>
            {accountsLoading ? (
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an ad account" />
                </SelectTrigger>
                <SelectContent>
                  {adAccounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            {insights.data && insights.data.length > 0 ? (
              <div className="space-y-4">
                {/* Currency and Date Info */}
                <div className="text-sm text-gray-500 border-b pb-2">
                  <p>Currency: {insights.data[0].currency || insights.data[0].account_currency || 'USD'}</p>
                  <p>Date Range: {insights.data[0].date_start} to {insights.data[0].date_stop}</p>
                </div>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Number(insights.data[0].impressions || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Impressions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Number(insights.data[0].clicks || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {(insights.data[0].currency || insights.data[0].account_currency || 'USD') === 'INR' ? '₹' : '$'}
                      {Number(insights.data[0].cpc || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">CPC</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {(insights.data[0].currency || insights.data[0].account_currency || 'USD') === 'INR' ? '₹' : '$'}
                      {Number(insights.data[0].cost_per_lead || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Cost per Lead</p>
                  </div>
                </div>
                
                {/* Total Spend */}
                <div className="text-center border-t pt-4">
                  <p className="text-3xl font-bold">
                    {(insights.data[0].currency || insights.data[0].account_currency || 'USD') === 'INR' ? '₹' : '$'}
                    {Number(insights.data[0].spend || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="text-sm text-gray-600">Total Spend</p>
                </div>
                
                {/* Raw Data for Debugging */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500">View Raw Data</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(insights.data[0], null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available for the selected date range</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting the date range or check if there are active campaigns</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Data from Facebook Marketing API using System User token
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
