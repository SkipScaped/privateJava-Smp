import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const images = await sql`
      SELECT g.*, u.username 
      FROM gallery g
      LEFT JOIN users u ON g.user_id = u.id
      ORDER BY g.created_at DESC
    `

    return NextResponse.json({ success: true, data: images })
  } catch (error) {
    console.error("Error fetching gallery images:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch gallery images" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user_id, title, description, image_url } = await request.json()

    // Validate input
    if (!user_id || !title || !image_url) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Insert into database
    const result = await sql`
      INSERT INTO gallery (user_id, title, description, image_url)
      VALUES (${user_id}, ${title}, ${description}, ${image_url})
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      data: result[0],
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ success: false, message: "Failed to upload image" }, { status: 500 })
  }
}
