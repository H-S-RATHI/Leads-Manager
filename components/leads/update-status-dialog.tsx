"use client"

import { useState, useEffect } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useMediaQuery } from "@/hooks/use-mobile"

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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [mobileSheetHeight, setMobileSheetHeight] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isMobile && open) {
      // Try to use dvh if supported, else fallback to JS
      const test = document.createElement('div')
      test.style.height = '100dvh'
      document.body.appendChild(test)
      const supportsDvh = test.offsetHeight !== 0
      document.body.removeChild(test)
      if (supportsDvh) {
        setMobileSheetHeight('70dvh')
      } else {
        setMobileSheetHeight(`${Math.round(window.innerHeight * 0.7)}px`)
      }
      // Listen for resize (keyboard open/close)
      const handleResize = () => {
        setMobileSheetHeight(`${Math.round(window.innerHeight * 0.7)}px`)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    } else {
      setMobileSheetHeight(undefined)
    }
  }, [isMobile, open])

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

  const formContent = (
    <>
      <div className="space-y-4">
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
            className="w-full border rounded p-2 min-h-[80px] resize-none"
            placeholder="Describe what response you received or any important info..."
            value={info}
            onChange={e => setInfo(e.target.value)}
            required
          />
        </div>
      </div>
    </>
  )

  const footerContent = (
    <>
      <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
        Cancel
      </Button>
      <Button onClick={handleUpdateStatus} disabled={loading || !canUpdate} className="w-full sm:w-auto">
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleDialogOpenChange}>
        <SheetTrigger asChild>
          <Button disabled={!canUpdate}>Update Status</Button>
        </SheetTrigger>
        <SheetContent side="bottom" style={mobileSheetHeight ? { maxHeight: mobileSheetHeight, height: mobileSheetHeight } : {}} className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Lead Status</SheetTitle>
            <SheetDescription>Change the status of this lead. This will trigger conversion tracking.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {formContent}
          </div>
          <SheetFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {footerContent}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canUpdate}>Update Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Update Lead Status</DialogTitle>
          <DialogDescription>Change the status of this lead. This will trigger conversion tracking.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh] px-6 pb-2">
          {formContent}
        </div>
        <DialogFooter className="px-6 pb-6 pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {footerContent}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
