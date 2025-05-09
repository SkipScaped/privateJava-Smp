import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { redis } from "@/lib/redis"

export async function POST() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("sessionId")?.value

    if (sessionId) {
      // Delete session from Redis
      await redis.del(`session:${sessionId}`)

      // Delete session cookie
      cookieStore.delete("sessionId")
    }

    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ success: false, message: "Failed to log out" }, { status: 500 })
  }
}
