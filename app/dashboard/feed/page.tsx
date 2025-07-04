import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { FeedPosts } from "@/components/feed/feed-posts"
import { CreatePost } from "@/components/feed/create-post"

export default async function FeedPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Feed</h1>
        <p className="text-gray-600">Share updates with your team</p>
      </div>

      <CreatePost />
      <FeedPosts />
    </div>
  )
}
