"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Calendar, User } from "lucide-react"
import { AssignLeadDialog } from "./assign-lead-dialog"
import { UpdateStatusDialog } from "./update-status-dialog"

interface LeadDetailProps {
  lead: any
  userRole: string
  userId: string
}

// Consistent date formatting function to prevent hydration errors
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  }
  return d.toLocaleString('en-US', options)
}

export function LeadDetail({ lead, userRole, userId }: LeadDetailProps) {
  const [currentLead, setCurrentLead] = useState(lead)

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

  const canAssignLead = () => {
    return (
      ["super_admin", "admin"].includes(userRole) ||
      (userRole === "sales_rep" && currentLead.assignedTo?._id === userId)
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{currentLead.name}</h1>
          <p className="text-gray-600 text-sm sm:text-base">Lead Details</p>
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {canAssignLead() && <AssignLeadDialog lead={currentLead} onUpdate={setCurrentLead} userRole={userRole} />}
          <UpdateStatusDialog lead={currentLead} onUpdate={setCurrentLead} />
        </div>
      </div>

      {/* Lead Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <a href={`mailto:${currentLead.email}`} className="text-blue-600 hover:underline break-all">
                {currentLead.email}
              </a>
            </div>
            {currentLead.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <a href={`tel:${currentLead.phone}`} className="text-blue-600 hover:underline">
                  {currentLead.phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Lead Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <Badge className={getStatusColor(currentLead.status)}>{currentLead.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Assigned To:</span>
              <span className="text-sm">{currentLead.assignedTo ? currentLead.assignedTo.name : "Unassigned"}</span>
            </div>
            {currentLead.budget && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Budget:</span>
                <span className="text-sm">${currentLead.budget.toLocaleString()}</span>
              </div>
            )}
            {currentLead.plotSize && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Plot Size:</span>
                <span className="text-sm">{currentLead.plotSize}</span>
              </div>
            )}
            {currentLead.city && (
              <div className="flex items-center justify-between">
                <span className="font-medium">City:</span>
                <span className="text-sm">📍 {currentLead.city}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium">Created:</span>
              <span className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(currentLead.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Track all interactions with this lead</CardDescription>
        </CardHeader>
        <CardContent>
          {currentLead.assignmentHistory && currentLead.assignmentHistory.length > 0 ? (
            <div className="space-y-4">
              {currentLead.assignmentHistory.map((assignment: any, index: number) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full -ml-5"></div>
                    <span className="font-medium text-sm">Lead Assigned</span>
                    <span className="text-xs text-gray-500">{formatDate(assignment.assignedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Assigned to <strong>{assignment.assignedTo?.name}</strong>
                    {assignment.assignedBy && (
                      <span>
                        {" "}
                        by <strong>{assignment.assignedBy.name}</strong>
                      </span>
                    )}
                  </p>
                  {assignment.note && <p className="text-sm text-gray-500 mt-1 italic">"{assignment.note}"</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Status History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>All status changes for this lead</CardDescription>
        </CardHeader>
        <CardContent>
          {currentLead.statusHistory && currentLead.statusHistory.length > 0 ? (
            <div className="space-y-4">
              {currentLead.statusHistory.map((statusItem: any, index: number) => (
                <div key={index} className="border-l-2 border-green-200 pl-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full -ml-5"></div>
                    <span className="font-medium text-sm">{statusItem.status}</span>
                    <span className="text-xs text-gray-500">{formatDate(statusItem.changedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Changed by <strong>{statusItem.changedBy?.name || 'Unknown'}</strong>
                  </p>
                  {statusItem.info && (
                    <p className="text-sm text-gray-500 mt-1 italic">"{statusItem.info}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No status changes recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
