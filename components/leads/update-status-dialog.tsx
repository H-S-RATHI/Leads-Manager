"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

interface UpdateStatusDialogProps {
  lead: any
}

export function UpdateStatusDialog({ lead }: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(lead.status)
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Allow current status and all forward statuses
  const getAllowedStatuses = (current: string) => {
    switch (current) {
      case "New":
        return ["Contacted"]
      case "Contacted":
        return ["Contacted", "Qualified", "Purchased"]
      case "Qualified":
        return ["Qualified", "Purchased"]
      case "Purchased":
        return ["Purchased"]
      default:
        return []
    }
  }

  const allowedStatuses = getAllowedStatuses(lead.status)
  const canUpdate = allowedStatuses.length > 0

  // When dialog opens, default dropdown to current status
  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setStatus(lead.status)
      setInfo("")
    }
  }

  const handleUpdateStatus = async () => {
    if (!info.trim()) {
      toast({
        title: "Info Required",
        description: "Please provide information about this status update.",
        variant: "destructive",
      })
      return
    }
    // Prevent backward transitions
    const statusOrder = ["New", "Contacted", "Qualified", "Purchased"]
    const currentIdx = statusOrder.indexOf(lead.status)
    const nextIdx = statusOrder.indexOf(status)
    if (nextIdx < currentIdx) {
      toast({
        title: "Invalid Status",
        description: "You cannot move status backward.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`/api/leads/${lead._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, info }),
      })
      console.log("Status update response:", response)
      if (response.ok) {
        const data = await response.json()
        console.log("Status update data:", data)
        await queryClient.invalidateQueries({ queryKey: ["lead", lead._id] })
        setOpen(false)
        setInfo("")
        toast({
          title: "Success",
          description: "Lead status updated successfully",
        })
      } else {
        let error
        try {
          error = await response.json()
        } catch (e) {
          error = { message: "Failed to parse error response", raw: e }
        }
        console.log("Status update error:", error)
        toast({
          title: "Error",
          description: error.error || error.message || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Status update exception:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canUpdate}>Update Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Lead Status</DialogTitle>
          <DialogDescription>Change the status of this lead. This will trigger conversion tracking.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh] grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={!canUpdate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canUpdate && (
              <div className="text-sm text-gray-500 mt-2">No further status changes allowed.</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status-info">Status Info <span className='text-red-500'>*</span></Label>
            <textarea
              id="status-info"
              className="w-full border rounded p-2 min-h-[60px]"
              placeholder="Describe what response you received or any important info..."
              value={info}
              onChange={e => setInfo(e.target.value)}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} disabled={loading || !canUpdate}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
