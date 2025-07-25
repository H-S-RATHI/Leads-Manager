"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, User, Search as SearchIcon, ChevronDown, Tag } from "lucide-react"

export function LeadsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "all",
    assignedTo: searchParams.get("assignedTo") || "all",
    category: searchParams.get("category") || "all",
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
            // Filter users based on user role
            let filteredUsers = data.users
            
            if (session?.user?.role === "admin") {
              // Admin can filter by admin and sales rep, but not super admin
              filteredUsers = data.users.filter((user: any) => user.role !== "super_admin")
            }
            // Super admin can filter by anyone (no filtering needed)
            
            setUsers(filteredUsers)
          }
        } catch (error) {
          console.error("Failed to fetch users:", error)
        }
      }
      fetchUsers()
    }
  }, [isSalesRep, session?.user?.role])

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
    setFilters({ status: "all", assignedTo: "all", category: "all", search: "" })
    router.push("/dashboard/leads")
  }

  return (
    <>
      {/* Mobile: compact row with icons, no Card wrapper */}
      <div className="flex items-center gap-2 sm:hidden px-2 py-2">
        <div className="relative flex-1">
          <Input
            id="search"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9 pr-2 h-10"
            aria-label="Search"
          />
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <div className="relative">
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger
              className={`w-10 h-10 p-0 flex items-center justify-center relative hide-default-arrow ${filters.status !== 'all' ? 'bg-black' : ''}`}
              aria-label="Status"
            >
              <FileText className={`h-5 w-5 ${filters.status !== 'all' ? 'text-white' : 'text-muted-foreground'}`} />
              {/* Custom arrow color for active filter */}
              <span className="absolute right-2">
                <ChevronDown className={`h-4 w-4 ${filters.status !== 'all' ? 'text-white' : 'text-muted-foreground'}`} />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Visited">Visited</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Purchased">Purchased</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger
              className={`w-10 h-10 p-0 flex items-center justify-center relative hide-default-arrow ${filters.category !== 'all' ? 'bg-black' : ''}`}
              aria-label="Category"
            >
              <Tag className={`h-5 w-5 ${filters.category !== 'all' ? 'text-white' : 'text-muted-foreground'}`} />
              {/* Custom arrow color for active filter */}
              <span className="absolute right-2">
                <ChevronDown className={`h-4 w-4 ${filters.category !== 'all' ? 'text-white' : 'text-muted-foreground'}`} />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Only show assignedTo filter for admin/super_admin */}
        {!isSalesRep && (
          <div className="relative">
            <Select
              value={filters.assignedTo}
              onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
            >
              <SelectTrigger
                className={`w-10 h-10 p-0 flex items-center justify-center relative hide-default-arrow ${filters.assignedTo !== 'all' ? 'bg-black' : ''}`}
                aria-label="Assigned To"
              >
                <User className={`h-5 w-5 ${filters.assignedTo !== 'all' ? 'text-white' : 'text-muted-foreground'}`} />
                {/* Custom arrow color for active filter */}
                <span className="absolute right-2">
                  <ChevronDown className={`h-4 w-4 ${filters.assignedTo !== 'all' ? 'text-white' : 'text-muted-foreground'}`} />
                </span>
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
        <Button onClick={applyFilters} size="icon" className="h-10 w-10" aria-label="Apply Filters">
          <SearchIcon className="h-5 w-5" />
        </Button>
      </div>
      {/* Desktop/tablet: modern flex design */}
      <Card className="hidden sm:block">
        <CardContent>
          <div className="flex flex-wrap items-end gap-4 bg-white px-2 py-2">
            <div className="flex flex-col min-w-[180px] flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1">Search</label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Name or email..."
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  className="h-10 pl-9"
                />
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="flex flex-col min-w-[120px]">
              <label className="text-xs font-semibold text-gray-600 mb-1">Status</label>
              <Select value={filters.status} onValueChange={value => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Visited">Visited</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Purchased">Purchased</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col min-w-[120px]">
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                <Tag className="h-4 w-4 text-gray-400" /> Category
              </label>
              <Select value={filters.category} onValueChange={value => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isSalesRep && (
              <div className="flex flex-col min-w-[140px]">
                <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-400" /> Assigned To
                </label>
                <Select
                  value={filters.assignedTo}
                  onValueChange={value => setFilters({ ...filters, assignedTo: value })}
                >
                  <SelectTrigger className="h-10">
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
            <div className="flex gap-2 ml-auto">
              <Button onClick={applyFilters} className="h-10 px-5">Apply</Button>
              <Button variant="outline" onClick={clearFilters} className="h-10 px-5">Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <style jsx global>{`
  .hide-default-arrow .lucide-chevron-down {
    display: none !important;
  }
`}</style>
    </>
  )
}
