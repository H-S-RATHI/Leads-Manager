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

interface LeadsTableProps {
  userRole: string
  userId: string
}

export function LeadsTable({ userRole, userId }: LeadsTableProps) {
  const searchParams = useSearchParams()

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

  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useLeadsInfinite(10, filters, userRole, userId)

  // Merge all loaded leads
  const leads = ((data as unknown) as InfiniteData<LeadsResponse>)?.pages.flatMap((page) => page.leads) || []

  // Infinite scroll logic
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
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

  if (loading && !data) {
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
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{userRole === "sales_rep" ? "My Assigned Leads" : "All Leads"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile view */}
          <div className="block sm:hidden">
            <div className="space-y-4 p-4">
              {leads.map((lead: Lead) => (
                <Card key={lead._id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = `/dashboard/leads/${lead._id}`}> 
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm">{lead.name}</h3>
                      <Badge variant="status" className={`${getStatusColor(lead.status)} text-xs`}>{lead.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{lead.email || 'No email'}</p>
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
                      <span className="text-xs text-gray-500">
                        {Array.isArray(lead.assignedTo) && lead.assignedTo.length > 0 ? lead.assignedTo.map((u: any) => u.name).join(", ") : "Unassigned"}
                      </span>
                      {lead.formName && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {lead.formName}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              <div ref={loaderRef} />
              {isFetchingNextPage && (
                <div className="text-center py-2 text-gray-500 text-sm">Loading more...</div>
              )}
              {!hasNextPage && leads.length > 0 && (
                <div className="text-center py-2 text-gray-400 text-xs">No more leads</div>
              )}
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                    <TableHead className="hidden lg:table-cell">Form</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: Lead) => (
                    <TableRow key={lead._id} className="cursor-pointer hover:bg-gray-50" onClick={() => window.location.href = `/dashboard/leads/${lead._id}`}> 
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{lead.email || 'No email'}</TableCell>
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
                      <TableCell className="hidden lg:table-cell">
                        {Array.isArray(lead.assignedTo) && lead.assignedTo.length > 0 ? lead.assignedTo.map((u: any) => u.name).join(", ") : "Unassigned"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {lead.formName || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div ref={loaderRef} />
              {isFetchingNextPage && (
                <div className="text-center py-2 text-gray-500 text-sm">Loading more...</div>
              )}
              {!hasNextPage && leads.length > 0 && (
                <div className="text-center py-2 text-gray-400 text-xs">No more leads</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
