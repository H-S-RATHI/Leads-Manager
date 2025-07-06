"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, Edit, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useFeed } from "@/hooks/use-feed"
import { useQueryClient } from "@tanstack/react-query"

interface Post {
  _id: string
  content: string
  author: {
    _id: string
    name: string
    profilePhoto?: string
  }
  likes: any[]
  editHistory?: Array<{
    previousContent: string
    editedBy: {
      _id: string
      name: string
    }
    editedAt: string
  }>
  createdAt: string
  updatedAt: string
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

export function FeedPosts() {
  const { data: session } = useSession()
  const { data: feedData, isLoading } = useFeed()
  const posts = feedData?.posts || []
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/feed/${postId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const updatedPost = await response.json()
        // Update the cache with the new post data
        queryClient.setQueryData(["feed"], (oldData: any) => ({
          ...oldData,
          posts: oldData.posts.map((post: Post) => (post._id === postId ? updatedPost : post))
        }))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      })
    }
  }

  const handleDisabledAction = (action: string) => {
    toast({
      title: "Feature Disabled",
      description: `${action} is disabled by the creator of this app (the original creator is GOD)`,
      variant: "default",
    })
  }

  const handleEditPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/feed/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        const updatedPost = await response.json()
        // Update the cache with the new post data
        queryClient.setQueryData(["feed"], (oldData: any) => ({
          ...oldData,
          posts: oldData.posts.map((post: Post) => (post._id === postId ? updatedPost : post))
        }))
        setEditingPost(null)
        setEditContent("")
        toast({
          title: "Success",
          description: "Post updated successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update post",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      })
    }
  }

  const startEdit = (post: Post) => {
    setEditingPost(post._id)
    setEditContent(post.content)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post._id}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.profilePhoto || "/placeholder.svg"} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{post.content}</p>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post._id)}
                className="flex items-center space-x-1"
              >
                <Heart className="h-4 w-4" />
                <span>{post.likes.length}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisabledAction("Comment")}
                className="flex items-center space-x-1"
                title="Disabled by the creator of this app (the original creator is GOD)"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Comment</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisabledAction("Share")}
                className="flex items-center space-x-1"
                title="Disabled by the creator of this app (the original creator is GOD)"
              >
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
              {session?.user?.id === post.author._id && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(post)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  {post.editHistory && post.editHistory.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <History className="h-4 w-4" />
                          <span>History</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit History</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {post.editHistory.map((edit, index) => (
                            <div key={index} className="border rounded p-3">
                              <div className="text-sm text-gray-500 mb-2">
                                Edited by {edit.editedBy.name} on {formatDate(edit.editedAt)}
                              </div>
                              <div className="text-sm bg-gray-50 p-2 rounded">
                                <Label className="text-xs text-gray-600 mb-1 block">Previous Content:</Label>
                                <p className="whitespace-pre-wrap">{edit.previousContent}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>

            {/* Edit Dialog */}
            {editingPost === post._id && (
              <Dialog open={editingPost === post._id} onOpenChange={() => setEditingPost(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setEditingPost(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleEditPost(post._id)}>Save Changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
