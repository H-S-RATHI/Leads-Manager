"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getSession, signIn } from "next-auth/react"

interface ProfileFormProps {
  user: any
  onProfileUpdated?: () => void
}

export function ProfileForm({ user, onProfileUpdated }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profilePhoto: user?.profilePhoto || "",
  })
  // Log profile photo on render
  console.log('[ProfileForm] Render: profilePhoto =', formData.profilePhoto);
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    form.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: form,
      })
      const data = await res.json()
      console.log('[ProfileForm] Cloudinary upload response:', data);
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, profilePhoto: data.secure_url }))
        console.log('[ProfileForm] Set profilePhoto to', data.secure_url);
        toast({ title: "Photo uploaded!", description: "Profile photo updated." })
        // Automatically submit the profile update with the new photo
        await handleSubmitAuto({ ...formData, profilePhoto: data.secure_url });
      } else {
        throw new Error("Upload failed")
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  // Helper to submit profile update automatically after photo upload
  const handleSubmitAuto = async (autoFormData: typeof formData) => {
    setLoading(true)
    try {
      console.log('[ProfileForm] Auto-submitting profile update:', autoFormData);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(autoFormData),
      })
      const responseData = await response.json();
      console.log('[ProfileForm] Auto profile update response:', responseData);
      if (response.ok) {
        toast({ title: "Success", description: "Profile updated successfully" })
        setFormData(autoFormData); // Update local state so UI updates everywhere
        if (onProfileUpdated) onProfileUpdated()
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log('[ProfileForm] Submitting profile update:', formData);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const responseData = await response.json();
      console.log('[ProfileForm] Profile update response:', responseData);
      if (response.ok) {
        toast({ title: "Success", description: "Profile updated successfully" })
        await signIn(undefined, { redirect: false })
        if (onProfileUpdated) onProfileUpdated()
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.profilePhoto || "/placeholder.svg"} alt={formData.name} />
              <AvatarFallback className="text-lg">{formData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <label htmlFor="profile-photo-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                </Button>
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={uploading}
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} disabled />
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input value={(() => {
                const d = new Date(user?.createdAt || Date.now())
                const day = String(d.getDate()).padStart(2, '0')
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const year = d.getFullYear()
                return `${day}/${month}/${year}`
              })()} disabled />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
