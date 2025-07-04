"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Post {
  _id: string
  content: string
  author: {
    name: string
    profilePhoto?: string
  }
  likes: any[]
  createdAt: string
}

export function FeedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/feed")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/feed/${postId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(posts.map((post) => (post._id === postId ? updatedPost : post)))
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

  if (loading) {
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
                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
