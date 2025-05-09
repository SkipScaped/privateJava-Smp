import { cookies } from "next/headers"
import { redis } from "@/lib/redis"
import { sql } from "@/lib/db"

export type SessionUser = {
  id: number
  username: string
  email: string
  rank?: string
  profilePicture?: string
}

export type Session = {
  user: SessionUser | null
}

export async function getServerSession(): Promise<Session | null> {
  try {
    // Get session ID from cookie
    const cookieStore = cookies()
    const sessionId = cookieStore.get("sessionId")?.value

    if (!sessionId) {
      return { user: null }
    }

    // Get session data from Redis
    const sessionData = await redis.get(`session:${sessionId}`)

    if (!sessionData) {
      // Clear invalid session cookie
      cookieStore.delete("sessionId")
      return { user: null }
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
      return { user: null }
    }

    const user = users[0]

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        profilePicture: user.profile_picture_url,
      },
    }
  } catch (error) {
    console.error("Error checking session:", error)
    return { user: null }
  }
}
