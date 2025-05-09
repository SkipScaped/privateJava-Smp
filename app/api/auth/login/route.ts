import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { redis } from "@/lib/redis"
import { v4 as uuidv4 } from "uuid"

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Find user
    const users = await sql`
      SELECT * FROM users 
      WHERE username = ${username}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    await sql`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `

    // Create session
    const sessionId = uuidv4()
    const sessionData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      rank: user.rank,
    }

    // Store session in Redis
    await redis.set(`session:${sessionId}`, sessionData, { ex: SESSION_TTL })

    // Set session cookie
    cookies().set({
      name: "sessionId",
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL,
      path: "/",
    })

    // Remove password from response
    delete user.password_hash

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rank: user.rank,
        profilePicture: user.profile_picture_url,
      },
    })
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ success: false, message: "Failed to log in" }, { status: 500 })
  }
}
