import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Post } from "@/lib/models/Post"
import { Activity } from "@/lib/models/Activity"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const posts = await Post.find()
      .populate("author", "name profilePhoto")
      .populate("likes.user", "name")
      .sort({ createdAt: -1 })
      .limit(20)

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    await connectDB()

    const post = await Post.create({
      author: session.user.id,
      content: content.trim(),
    })

    // Log activity
    await Activity.create({
      user: session.user.id,
      action: "feed_post_created",
      details: {
        postId: post._id,
        content: content.substring(0, 100),
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
