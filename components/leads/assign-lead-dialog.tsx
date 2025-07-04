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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface AssignLeadDialogProps {
  lead: any
  onUpdate: (lead: any) => void
  userRole: string
}

export function AssignLeadDialog({ lead, onUpdate, userRole }: AssignLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState("")
  const [note, setNote] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const requiresPassword = userRole === "sales_rep"

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

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

  const handleAssign = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user to assign the lead to",
        variant: "destructive",
      })
      return
    }

    if (requiresPassword && !password) {
      toast({
        title: "Error",
        description: "Password is required for reassignment",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/leads/${lead._id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: selectedUser,
          note,
          password: requiresPassword ? password : undefined,
        }),
      })

      if (response.ok) {
        const updatedLead = await response.json()
        onUpdate(updatedLead)
        setOpen(false)
        setSelectedUser("")
        setNote("")
        setPassword("")
        toast({
          title: "Success",
          description: "Lead assigned successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to assign lead",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while assigning the lead",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Assign Lead</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
          <DialogDescription>Assign this lead to a team member with an optional note.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user: any) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Assignment Note</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this assignment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {requiresPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? "Assigning..." : "Assign Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
