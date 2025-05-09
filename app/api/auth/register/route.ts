import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Check if username or email already exists
    const existingUser = await sql`
      SELECT * FROM users 
      WHERE username = ${username} OR email = ${email}
      LIMIT 1
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, message: "Username or email already exists" }, { status: 409 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING id, username, email, created_at
    `

    const user = result[0]

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user,
    })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ success: false, message: "Failed to register user" }, { status: 500 })
  }
}
