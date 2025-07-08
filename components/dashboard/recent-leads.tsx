"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useLeads } from "@/hooks/use-leads"

interface Lead {
  _id: string
  name: string
  email: string
  status: string
  createdAt: string
}

export function RecentLeads() {
  const { data: leadsData, isLoading } = useLeads(1, 5)
  const leads = leadsData?.leads || []

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "contacted":
        return "bg-yellow-100 text-yellow-800"
      case "qualified":
        return "bg-green-100 text-green-800"
      case "purchased":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
        <CardDescription>Latest leads from your campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No leads found</p>
            <p className="text-sm text-gray-400">
              Leads will appear here once you receive them from Facebook Lead Ads or create them manually.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/leads/${lead._id}`}
                    className="font-medium hover:text-blue-600 block truncate"
                  >
                    {lead.name}
                  </Link>
                  <p className="text-sm text-gray-500 truncate">{lead.email}</p>
                  <p className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant="status" className={getStatusColor(lead.status)}>{lead.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
