import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { redis } from "@/lib/redis"

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300

// Default server status object
const defaultStatus = {
  online: false,
  player_count: 0,
  max_players: 0,
  version: "Unknown",
  last_updated: new Date().toISOString(),
}

export async function GET() {
  try {
    // Try to get server status from Redis cache first
    let cachedStatus = null
    try {
      cachedStatus = await redis.get("server_status")
    } catch (redisError) {
      console.error("Redis error:", redisError)
      // Continue without cache if Redis fails
    }

    if (cachedStatus) {
      return NextResponse.json({
        success: true,
        data: cachedStatus,
        source: "cache",
      })
    }

    // If not in cache, fetch from database
    let result = []
    try {
      result = await sql`
        SELECT * FROM server_status 
        ORDER BY last_updated DESC 
        LIMIT 1
      `
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Continue with default status if database fails
    }

    // Create a default status if no records exist
    const serverStatus = result[0] || defaultStatus

    // Try to store in Redis cache, but don't fail if Redis is unavailable
    try {
      await redis.set("server_status", serverStatus, { ex: CACHE_TTL })
    } catch (redisError) {
      console.error("Redis set error:", redisError)
      // Continue without caching if Redis fails
    }

    return NextResponse.json({
      success: true,
      data: serverStatus,
      source: "database",
    })
  } catch (error) {
    console.error("Error fetching server status:", error)

    // Always return a valid JSON response with default status
    return NextResponse.json({
      success: true,
      data: defaultStatus,
      source: "default",
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { online, player_count, max_players, version } = body

    // Update database
    let serverStatus
    try {
      const result = await sql`
        INSERT INTO server_status (online, player_count, max_players, version)
        VALUES (${online}, ${player_count}, ${max_players}, ${version})
        RETURNING *
      `
      serverStatus = result[0]
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update server status in database",
        },
        { status: 500 },
      )
    }

    // Try to update Redis cache, but don't fail if Redis is unavailable
    try {
      await redis.set("server_status", serverStatus, { ex: CACHE_TTL })
    } catch (redisError) {
      console.error("Redis set error:", redisError)
      // Continue without caching if Redis fails
    }

    return NextResponse.json({
      success: true,
      data: serverStatus,
    })
  } catch (error) {
    console.error("Error updating server status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update server status",
      },
      { status: 500 },
    )
  }
}
