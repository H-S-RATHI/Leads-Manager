"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone } from "lucide-react"
import Link from "next/link"
import { useLeadsInfinite, Lead, LeadsResponse } from "@/hooks/use-leads"
import { useEffect, useRef, useCallback } from "react"
import type { InfiniteData } from "@tanstack/react-query"
import { Checkbox } from "@/components/ui/checkbox"
import { AssignLeadDialog } from "./assign-lead-dialog"
import { UpdateStatusDialog } from "./update-status-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Select from 'react-select'
import { useToast } from "@/hooks/use-toast"

interface LeadsTableProps {
  userRole: string
  userId: string
}

export function LeadsTable({ userRole, userId }: LeadsTableProps) {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Selection state
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Bulk dialog state
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false)
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [assignAction, setAssignAction] = useState<'assign' | 'unassign'>('assign')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [assignNote, setAssignNote] = useState("")
  const [assignLoading, setAssignLoading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [statusInfo, setStatusInfo] = useState("")
  const [statusLoading, setStatusLoading] = useState(false)

  // Extract filters from search params
  const filters = useMemo(() => {
    const filterObj: any = {}
    searchParams.forEach((value, key) => {
      if (value && key !== "assignedTo") {
        filterObj[key] = value
      } else if (key === "assignedTo" && userRole !== "sales_rep") {
        filterObj[key] = value
      }
    })
    return filterObj
  }, [searchParams, userRole])

  // Use useLeadsInfinite for infinite scroll
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useLeadsInfinite(10, filters, userRole, userId)
  const leads = (data as InfiniteData<LeadsResponse> | undefined)?.pages?.flatMap((page) => page.leads) || []

  // Infinite scroll logic
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    console.log('Observer fired', { isIntersecting: target.isIntersecting, hasNextPage, isFetchingNextPage })
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }
    const observer = new window.IntersectionObserver(handleObserver, option)
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [handleObserver])

  // New: derive selectAll from selectedLeads and leads
  const allSelected = leads.length > 0 && selectedLeads.length === leads.length

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map((lead: Lead) => lead._id))
    } else {
      setSelectedLeads([])
    }
  }

  // Handle individual select
  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    )
  }

  // Fetch users for assign dialog
  useEffect(() => {
    if (bulkAssignOpen) {
      fetch("/api/users").then(res => res.json()).then(data => setUsers(data.users || []))
      setSelectedUsers([])
    }
  }, [bulkAssignOpen])

  // Bulk assign/unassign handler
  const handleBulkAssign = async () => {
    if (selectedUsers.length === 0) {
      toast({ title: "Error", description: `Please select at least one user to ${assignAction}.`, variant: "destructive" })
      return
    }
    setAssignLoading(true)
    try {
      // TODO: Replace with bulk assign API when available
      await Promise.all(selectedLeads.map(leadId => fetch(`/api/leads/${leadId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assign: assignAction === 'assign' ? selectedUsers : [],
          unassign: assignAction === 'unassign' ? selectedUsers : [],
          note: assignNote,
        })
      })))
      setBulkAssignOpen(false)
      setSelectedLeads([])
      setAssignNote("")
      toast({ title: "Success", description: `Leads ${assignAction === 'assign' ? 'assigned' : 'unassigned'} successfully` })
      refetch()
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${assignAction} leads`, variant: "destructive" })
    } finally {
      setAssignLoading(false)
    }
  }

  // Bulk status update handler
  const handleBulkStatus = async () => {
    if (!status) {
      toast({ title: "Error", description: "Please select a status.", variant: "destructive" })
      return
    }
    if (!statusInfo.trim()) {
      toast({ title: "Info Required", description: "Please provide information about this status update.", variant: "destructive" })
      return
    }
    setStatusLoading(true)
    try {
      // TODO: Replace with bulk status API when available
      await Promise.all(selectedLeads.map(leadId => fetch(`/api/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, info: statusInfo })
      })))
      setBulkStatusOpen(false)
      setSelectedLeads([])
      setStatus("")
      setStatusInfo("")
      toast({ title: "Success", description: "Status updated for selected leads" })
      refetch()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status for selected leads", variant: "destructive" })
    } finally {
      setStatusLoading(false)
    }
  }

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

  // Bulk action bar (visible if any leads are selected)
  const showBulkBar = selectedLeads.length > 0 && (userRole === "admin" || userRole === "super_admin")

  if (isLoading && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      {showBulkBar && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-blue-50 border border-blue-200 rounded px-4 py-2 mb-2">
          <div className="text-sm font-medium text-blue-900">
            {selectedLeads.length} lead{selectedLeads.length > 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setBulkAssignOpen(true)}>
              Assign/Unassign
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBulkStatusOpen(true)}>
              Update Status
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedLeads([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}
      {/* Bulk Assign/Unassign Dialog */}
      <Dialog open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Assign/Unassign Leads</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="bulk-action" value="assign" checked={assignAction === 'assign'} onChange={() => { setAssignAction('assign'); setSelectedUsers([]) }} className="accent-blue-600" /> Assign
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="bulk-action" value="unassign" checked={assignAction === 'unassign'} onChange={() => { setAssignAction('unassign'); setSelectedUsers([]) }} className="accent-red-600" /> Unassign
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{assignAction === 'assign' ? 'Assign To' : 'Unassign From'}</Label>
              <Select
                isMulti
                options={users.map((user: any) => ({ value: user._id, label: `${user.name} (${user.role})` }))}
                value={users.filter((u: any) => selectedUsers.includes(u._id)).map((user: any) => ({ value: user._id, label: `${user.name} (${user.role})` }))}
                onChange={opts => setSelectedUsers(opts.map((opt: any) => opt.value))}
                classNamePrefix="react-select"
                placeholder={`Select user(s) to ${assignAction}`}
                styles={{ menu: (provided: any) => ({ ...provided, zIndex: 9999 }) }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-assign-note">Note</Label>
              <Textarea id="bulk-assign-note" placeholder="Add a note about this assignment..." value={assignNote} onChange={e => setAssignNote(e.target.value)} className="resize-none min-h-[80px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAssignOpen(false)} disabled={assignLoading}>Cancel</Button>
            <Button onClick={handleBulkAssign} disabled={assignLoading}>{assignLoading ? (assignAction === 'assign' ? 'Assigning...' : 'Unassigning...') : (assignAction === 'assign' ? 'Assign' : 'Unassign')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Status Update Dialog */}
      <Dialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="w-full border rounded p-2" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Select status</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Purchased">Purchased</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-status-info">Status Info <span className='text-red-500'>*</span></Label>
              <Textarea id="bulk-status-info" placeholder="Describe what response you received or any important info..." value={statusInfo} onChange={e => setStatusInfo(e.target.value)} className="resize-none min-h-[80px]" required />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkStatusOpen(false)} disabled={statusLoading}>Cancel</Button>
            <Button onClick={handleBulkStatus} disabled={statusLoading}>{statusLoading ? 'Updating...' : 'Update Status'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Mobile view */}
      <div className="block sm:hidden">
        <div className="space-y-4 px-2 py-2">
          {/* Select all for mobile */}
          <div className="flex items-center mb-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              id="select-all-mobile"
            />
            <label htmlFor="select-all-mobile" className="ml-2 text-sm">Select All</label>
          </div>
          {leads.map((lead: Lead) => {
            const latestStatusNote = lead.statusHistory && lead.statusHistory.length > 0
              ? lead.statusHistory[lead.statusHistory.length - 1].info
              : null;
            return (
              <Card key={lead._id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = `/dashboard/leads/${lead._id}`}> 
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedLeads.includes(lead._id)}
                      onCheckedChange={() => handleSelectLead(lead._id)}
                      className="mr-2"
                      onClick={e => e.stopPropagation()}
                    />
                    <h3 className="font-medium text-sm">{lead.name}</h3>
                  </div>
                  <Badge variant="status" className={`${getStatusColor(lead.status)} text-xs`}>{lead.status}</Badge>
                </div>
                <div className="space-y-2 mt-2">
                  {/* Removed email display */}
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                      rel="noopener noreferrer"
                      target="_self"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      <Phone className="h-3 w-3" />
                      <span>{lead.phone}</span>
                    </a>
                  )}
                  {lead.city && (
                    <p className="text-sm text-gray-500">📍 {lead.city}</p>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    {userRole !== "sales_rep" && (
                      <span className="text-xs text-gray-500">
                        {Array.isArray(lead.assignedTo) && lead.assignedTo.length > 0 ? lead.assignedTo.map((u: any) => u.name).join(", ") : "Unassigned"}
                      </span>
                    )}
                    {userRole !== "sales_rep" && lead.formName && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {lead.formName}
                      </span>
                    )}
                  </div>
                  {/* Update Status Button */}
                  <div className="pt-2" onClick={e => e.stopPropagation()}>
                    <UpdateStatusDialog lead={lead} onStatusUpdated={() => refetch()} />
                  </div>
                  {/* Latest Status Note */}
                  {latestStatusNote && (
                    <div className="pt-2 text-xs text-gray-700 italic border-t border-gray-100 mt-2">
                      {latestStatusNote}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          <div ref={loaderRef} />
          {isFetchingNextPage && (
            <div className="text-center py-2 text-gray-500 text-sm">Loading more...</div>
          )}
          {hasNextPage && !isFetchingNextPage && (
            <div className="text-center py-2">
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
                Load More
              </Button>
            </div>
          )}
          {!hasNextPage && leads.length > 0 && (
            <div className="text-center py-2 text-gray-400 text-xs">No more leads</div>
          )}
          {isLoading && leads.length === 0 && (
            <div className="text-center py-2 text-gray-500 text-sm">Loading leads...</div>
          )}
          {!leads.length && !isLoading && (
            <div className="text-center py-2 text-gray-400 text-xs">No leads found</div>
          )}
        </div>
      </div>
      {/* Desktop view */}
      <Card className="hidden sm:block">
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      id="select-all-desktop"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">City</TableHead>
                  <TableHead>Status</TableHead>
                  {userRole !== "sales_rep" && <TableHead className="hidden lg:table-cell">Assigned To</TableHead>}
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                  {userRole !== "sales_rep" && <TableHead className="hidden lg:table-cell">Form</TableHead>}
                  <TableHead>Update Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Latest Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead: Lead) => {
                  const latestStatusNote = lead.statusHistory && lead.statusHistory.length > 0
                    ? lead.statusHistory[lead.statusHistory.length - 1].info
                    : null;
                  return (
                    <TableRow key={lead._id} className="cursor-pointer hover:bg-gray-50" onClick={() => window.location.href = `/dashboard/leads/${lead._id}`}> 
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead._id)}
                          onCheckedChange={() => handleSelectLead(lead._id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      {/* Removed email column */}
                      <TableCell>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                            rel="noopener noreferrer"
                            target="_self"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            onClick={e => e.stopPropagation()}
                          >
                            <Phone className="h-4 w-4" />
                            <span className="hidden sm:inline">{lead.phone}</span>
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {lead.city || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="status" className={`${getStatusColor(lead.status)} text-xs`}>{lead.status}</Badge>
                      </TableCell>
                      {userRole !== "sales_rep" && (
                        <TableCell className="hidden lg:table-cell">
                          {Array.isArray(lead.assignedTo) && lead.assignedTo.length > 0 ? lead.assignedTo.map((u: any) => u.name).join(", ") : "Unassigned"}
                        </TableCell>
                      )}
                      <TableCell className="hidden xl:table-cell">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                      {userRole !== "sales_rep" && (
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {lead.formName || "-"}
                          </span>
                        </TableCell>
                      )}
                      {/* Update Status Button */}
                      <TableCell>
                        <div onClick={e => e.stopPropagation()}>
                          <UpdateStatusDialog lead={lead} onStatusUpdated={() => refetch()} />
                        </div>
                      </TableCell>
                      {/* Latest Status Note */}
                      <TableCell>
                        {latestStatusNote && (
                          <span className="text-xs text-gray-700 italic">{latestStatusNote}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div ref={loaderRef} />
            {isFetchingNextPage && (
              <div className="text-center py-2 text-gray-500 text-sm">Loading more...</div>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <div className="text-center py-2">
                <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
                  Load More
                </Button>
              </div>
            )}
            {!hasNextPage && leads.length > 0 && (
              <div className="text-center py-2 text-gray-400 text-xs">No more leads</div>
            )}
            {isLoading && leads.length === 0 && (
              <div className="text-center py-2 text-gray-500 text-sm">Loading leads...</div>
            )}
            {!leads.length && !isLoading && (
              <div className="text-center py-2 text-gray-400 text-xs">No leads found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
