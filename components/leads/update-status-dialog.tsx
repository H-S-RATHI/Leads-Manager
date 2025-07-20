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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useMediaQuery } from "@/hooks/use-mobile"
import { CategorySelector } from "./category-selector"
import { Sparkles } from "lucide-react"

interface UpdateStatusDialogProps {
  lead: any
  onStatusUpdated?: () => void
}

export function UpdateStatusDialog({ lead, onStatusUpdated }: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(lead.status)
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [mobileSheetHeight, setMobileSheetHeight] = useState<string | undefined>(undefined)
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)

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
        return ["Contacted", "Visited"]
      case "Visited":
        return ["Visited", "Qualified"]
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
    if (lead.status === "New" && status === "New") {
      toast({
        title: "Invalid Update",
        description: "You must select 'Contacted' to update the status for the first time.",
        variant: "destructive",
      });
      return;
    }
    if (!info.trim()) {
      toast({
        title: "Info Required",
        description: "Please provide information about this status update.",
        variant: "destructive",
      })
      return
    }
    // Prevent backward transitions
    const statusOrder = ["New", "Contacted", "Visited", "Qualified", "Purchased"]
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
        if (onStatusUpdated) onStatusUpdated();
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

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch("/api/gemini-summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: info }),
      })
      const data = await res.json()
      if (data.summary) {
        setInfo(data.summary)
        setGenerated(true)
      }
    } catch (e) {
      toast({ title: "AI Error", description: "Failed to generate summary.", variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  const formContent = (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Client Category</Label>
          <CategorySelector 
            leadId={lead._id} 
            currentCategory={lead.category || "none"} 
            onCategoryUpdated={() => {
              if (onStatusUpdated) onStatusUpdated()
            }}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={s => { setStatus(s); setGenerated(false); }} disabled={!canUpdate}>
            <SelectTrigger>
              <SelectValue>{status}</SelectValue>
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
          <div className="relative">
            <textarea
              id="status-info"
              className="w-full border rounded p-2 min-h-[80px] resize-none pr-10"
              placeholder="Describe what response you received or any important info..."
              value={info}
              onChange={e => { setInfo(e.target.value); setGenerated(false); }}
              required
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!info.trim() || generating}
              className="absolute bottom-2 right-2 p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Generate with AI"
              tabIndex={0}
            >
              <Sparkles className={`h-5 w-5 ${generating ? 'animate-spin text-blue-400' : 'text-gray-400'}`} />
            </button>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={handleUpdateStatus} disabled={loading || !canUpdate} type="button">
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  const footerContent = (
    <>
      <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
        Cancel
      </Button>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!canUpdate}>Update Status</Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-sm mx-auto rounded-2xl p-0 overflow-y-auto">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Update Lead Status</DialogTitle>
          <DialogDescription>Change the status of this lead. This will trigger conversion tracking.</DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-2">
          {formContent}
        </div>
        <DialogFooter className="bg-white px-4 pb-4 pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end z-10 border-t">
          {footerContent}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
