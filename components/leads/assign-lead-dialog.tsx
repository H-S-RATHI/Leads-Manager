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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import Select from 'react-select'

interface AssignLeadDialogProps {
  lead: any
  userRole: string
}

export function AssignLeadDialog({ lead, userRole }: AssignLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [action, setAction] = useState<'assign' | 'unassign'>('assign')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Only show for admin/super_admin
  if (!(userRole === "admin" || userRole === "super_admin")) return null

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSelectedUsers([]); // Reset selection on open
    }
  }, [open, lead.assignedTo])

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

  // Users currently assigned to this lead (always recalc from latest prop)
  const assignedUserIds = lead.assignedTo ? lead.assignedTo.map((u: any) => (typeof u === 'string' ? u : u._id)) : []
  const availableUsers = users.filter((user: any) => !assignedUserIds.includes(user._id))
  const assignedUsers = users.filter((user: any) => assignedUserIds.includes(user._id))

  // react-select options
  const userOptions = (action === 'assign' ? availableUsers : assignedUsers).map((user: any) => ({
    value: user._id,
    label: `${user.name} (${user.role})`,
  }))

  const handleSubmit = async () => {
    console.log('Submitting assign/unassign:', { action, selectedUsers, note });
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: `Please select at least one user to ${action}.`,
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      console.log('Sending to API:', {
        assign: action === 'assign' ? selectedUsers : [],
        unassign: action === 'unassign' ? selectedUsers : [],
        note,
      });
      const response = await fetch(`/api/leads/${lead._id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assign: action === 'assign' ? selectedUsers : [],
          unassign: action === 'unassign' ? selectedUsers : [],
          note,
        }),
      })
      console.log('API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        // Log the latest assignmentHistory entry for unassigned user(s)
        if (data.assignmentHistory && data.assignmentHistory.length > 0 && action === 'unassign') {
          const lastUnassigned = data.assignmentHistory
            .filter((a: any) => a.action === 'unassigned' && a.unassignedFrom && selectedUsers.includes(a.unassignedFrom._id || a.unassignedFrom))
            .pop();
          console.log('Latest unassigned entry for selected user(s):', lastUnassigned);
          if (lastUnassigned) {
            console.log('Unassigned from user:', lastUnassigned.unassignedFrom);
          }
        }
        await queryClient.invalidateQueries({ queryKey: ["lead", lead._id] })
        await queryClient.invalidateQueries({ queryKey: ["activity-log"] })
        await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
        setOpen(false)
        setSelectedUsers([])
        setNote("")
        toast({
          title: "Success",
          description: `Lead ${action === 'assign' ? 'assigned' : 'unassigned'} successfully`,
        })
      } else {
        const error = await response.json()
        console.error('API error:', error);
        toast({
          title: "Error",
          description: error.error || `Failed to ${action} lead`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Exception during assign/unassign:', error);
      toast({
        title: "Error",
        description: `An error occurred while trying to ${action} the lead`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Assign/Unassign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign/Unassign Lead</DialogTitle>
          <DialogDescription>
            Assign or unassign this lead to one or more team members. Add an optional note.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Action</Label>
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  name="action"
                  value="assign"
                  checked={action === 'assign'}
                  onChange={() => { setAction('assign'); setSelectedUsers([]) }}
                /> Assign
              </label>
              <label>
                <input
                  type="radio"
                  name="action"
                  value="unassign"
                  checked={action === 'unassign'}
                  onChange={() => { setAction('unassign'); setSelectedUsers([]) }}
                /> Unassign
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{action === 'assign' ? 'Assign To' : 'Unassign From'}</Label>
            <Select
              isMulti
              options={userOptions}
              value={userOptions.filter(opt => selectedUsers.includes(opt.value))}
              onChange={opts => setSelectedUsers(opts.map((opt: any) => opt.value))}
              classNamePrefix="react-select"
              placeholder={`Select user(s) to ${action}`}
              styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this assignment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (action === 'assign' ? 'Assigning...' : 'Unassigning...') : (action === 'assign' ? 'Assign' : 'Unassign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
