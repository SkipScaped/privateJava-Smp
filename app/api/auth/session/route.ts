import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    // Get session ID from cookie
    const cookieStore = cookies()
    const sessionId = cookieStore.get("sessionId")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "No session found" })
    }

    // Get session data from Redis
    const sessionData = await redis.get(`session:${sessionId}`)

    if (!sessionData) {
      // Clear invalid session cookie
      cookieStore.delete("sessionId")
      return NextResponse.json({ success: false, message: "Invalid session" })
    }

    // Get user data from database
    const users = await sql`
      SELECT id, username, email, rank, profile_picture_url 
      FROM users 
      WHERE id = ${sessionData.userId}
      LIMIT 1
    `

    if (users.length === 0) {
      // Clear invalid session
      await redis.del(`session:${sessionId}`)
      cookieStore.delete("sessionId")
      return NextResponse.json({ success: false, message: "User not found" })
    }

    const user = users[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        profilePicture: user.profile_picture_url,
      },
    })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
