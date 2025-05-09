import { NextResponse } from "next/server"
import { players } from "@/lib/data"

export async function GET() {
  try {
    // In a real app, this would fetch users from a database
    return NextResponse.json({ success: true, data: players })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // In a real app, this would create a new user in the database
    const newUser = {
      id: players.length + 1,
      username,
      profilePicture: `/placeholder.svg?height=100&width=100&text=${username.substring(0, 2).toUpperCase()}`,
      joinDate: new Date().toISOString().split("T")[0],
      rank: "Member" as const,
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: newUser,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 })
  }
}
