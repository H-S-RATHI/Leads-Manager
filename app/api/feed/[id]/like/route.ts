import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Post } from "@/lib/models/Post"
import { Activity } from "@/lib/models/Activity"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const post = await Post.findById(params.id)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const existingLike = post.likes.find((like: any) => like.user.toString() === session.user.id)

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter((like: any) => like.user.toString() !== session.user.id)
    } else {
      // Like
      post.likes.push({
        user: session.user.id,
        likedAt: new Date(),
      })

      // Log activity
      await Activity.create({
        user: session.user.id,
        action: "feed_post_liked",
        details: {
          postId: post._id,
        },
      })
    }

    await post.save()
    await post.populate("author", "name profilePhoto")

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
