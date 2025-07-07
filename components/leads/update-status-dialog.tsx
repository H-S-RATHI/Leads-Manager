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

interface UpdateStatusDialogProps {
  lead: any
}

export function UpdateStatusDialog({ lead }: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(lead.status)
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const statuses = ["New", "Contacted", "Qualified", "Purchased"]
  const canSetToNew = lead.status === "New"

  const handleUpdateStatus = async () => {
    if (status === lead.status) {
      setOpen(false)
      return
    }
    if (!info.trim()) {
      toast({
        title: "Info Required",
        description: "Please provide information about this status update.",
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

      if (response.ok) {
        const { useQueryClient } = await import("@tanstack/react-query")
        const queryClient = useQueryClient()
        await queryClient.invalidateQueries({ queryKey: ["lead", lead._id] })
        setOpen(false)
        setInfo("")
        toast({
          title: "Success",
          description: "Lead status updated successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Update Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Lead Status</DialogTitle>
          <DialogDescription>Change the status of this lead. This will trigger conversion tracking.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  (s !== "New" || canSetToNew) ? (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
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
          <Button onClick={handleUpdateStatus} disabled={loading}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
