import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { FeedPosts } from "@/components/feed/feed-posts"
import { CreatePost } from "@/components/feed/create-post"

export default async function FeedPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">

      <CreatePost />
      <FeedPosts />
    </div>
  )
}
