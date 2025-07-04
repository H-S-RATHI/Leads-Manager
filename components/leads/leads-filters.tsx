"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LeadsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "all",
    assignedTo: searchParams.get("assignedTo") || "all",
    search: searchParams.get("search") || "",
  })
  const [users, setUsers] = useState([])

  const isSalesRep = session?.user?.role === "sales_rep"

  useEffect(() => {
    // Only fetch users for admin/super_admin
    if (!isSalesRep) {
      const fetchUsers = async () => {
        try {
          const response = await fetch("/api/users")
          if (response.ok) {
            const data = await response.json()
            setUsers(data.users)
          }
        } catch (error) {
          console.error("Failed to fetch users:", error)
        }
      }
      fetchUsers()
    }
  }, [isSalesRep])

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        // Sales reps can't filter by assignedTo - it's automatically set to their ID
        if (key === "assignedTo" && isSalesRep) return
        params.set(key, value)
      }
    })
    router.push(`/dashboard/leads?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ status: "all", assignedTo: "all", search: "" })
    router.push("/dashboard/leads")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Purchased">Purchased</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Only show assignedTo filter for admin/super_admin */}
          {!isSalesRep && (
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={filters.assignedTo}
                onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user: any) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-end space-x-2">
            <Button onClick={applyFilters} className="flex-1 sm:flex-none">
              Apply
            </Button>
            <Button variant="outline" onClick={clearFilters} className="flex-1 sm:flex-none bg-transparent">
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
