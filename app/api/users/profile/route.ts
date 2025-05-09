import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getServerSession } from "@/lib/session"

export async function PUT(request: Request) {
  try {
    // Get the current user's session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const { email, bio, profilePicture } = await request.json()

    // Validate the input
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Update user profile
    await sql`
      UPDATE users
      SET 
        email = ${email},
        bio = ${bio || null},
        profile_picture_url = ${profilePicture || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get the current user's session
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get user profile data
    const users = await sql`
      SELECT id, username, email, bio, profile_picture_url, rank, created_at
      FROM users
      WHERE id = ${session.user.id}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const user = users[0]

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profile_picture_url,
        rank: user.rank,
        joinDate: user.created_at,
      },
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch profile" }, { status: 500 })
  }
}
