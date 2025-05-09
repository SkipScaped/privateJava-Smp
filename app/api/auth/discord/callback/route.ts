import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { getDiscordToken, getDiscordUser, getDiscordAvatarUrl } from "@/lib/discord"
import { sql } from "@/lib/db"
import { redis } from "@/lib/redis"

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code) {
      return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
    }

    // Get Discord access token
    const tokenData = await getDiscordToken(code)

    // Get Discord user data
    const discordUser = await getDiscordUser(tokenData.access_token)

    // Get Discord profile picture
    const avatarUrl = getDiscordAvatarUrl(discordUser.id, discordUser.avatar)

    // Check if user exists in database
    const existingUsers = await sql`
      SELECT * FROM users 
      WHERE discord_id = ${discordUser.id}
      LIMIT 1
    `

    let user

    if (existingUsers.length === 0) {
      // Create new user
      const username = discordUser.username

      // Check if username already exists
      const usernameExists = await sql`
        SELECT id FROM users WHERE username = ${username} LIMIT 1
      `

      // If username exists, add random suffix
      const finalUsername = usernameExists.length > 0 ? `${username}_${Math.floor(Math.random() * 1000)}` : username

      // Create user
      const newUsers = await sql`
        INSERT INTO users (
          username, 
          email, 
          discord_id,
          profile_picture_url
        )
        VALUES (
          ${finalUsername}, 
          ${discordUser.email}, 
          ${discordUser.id},
          ${avatarUrl}
        )
        RETURNING id, username, email, rank, profile_picture_url
      `

      user = newUsers[0]
    } else {
      // Update existing user
      user = existingUsers[0]

      // Update profile picture if needed
      if (avatarUrl && user.profile_picture_url !== avatarUrl) {
        await sql`
          UPDATE users
          SET profile_picture_url = ${avatarUrl},
              email = ${discordUser.email}
          WHERE id = ${user.id}
        `
      }
    }

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

    // Get redirect path from state if available
    let redirectPath = "/"
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, "base64").toString())
        if (stateData.redirectPath) {
          redirectPath = stateData.redirectPath
        }
      } catch (error) {
        console.error("Error parsing state:", error)
      }
    }

    return NextResponse.redirect(new URL(redirectPath, request.url))
  } catch (error) {
    console.error("Discord auth error:", error)
    return NextResponse.redirect(new URL("/auth/login?error=auth_error", request.url))
  }
}
