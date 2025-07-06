import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Post } from "@/lib/models/Post"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    await connectDB()

    const post = await Post.findById(params.id)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is the author
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own posts" }, { status: 403 })
    }

    // Save previous content to history
    const editEntry = {
      previousContent: post.content,
      editedBy: session.user.id,
      editedAt: new Date(),
    }

    // Update post with new content and add to edit history
    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      {
        content: content.trim(),
        $push: { editHistory: editEntry },
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("author", "name profilePhoto")

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 