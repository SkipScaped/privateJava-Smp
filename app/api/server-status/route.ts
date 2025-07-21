import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { redis } from "@/lib/redis"

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300

// Default server status object
const defaultStatus = {
  serverName: "Unknown",
  serverIp: "Unknown",
  isOnline: false,
  playerCount: 0,
  maxPlayers: 0,
  version: "Unknown",
  lastUpdated: new Date().toISOString(),
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
        data: JSON.parse(cachedStatus),
        source: "cache",
      })
    }

    // If not in cache, fetch from database
    const { data: serverStatus, error } = await supabase
      .from("server_status")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching server status:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch server status",
        },
        { status: 500 },
      )
    }

    // Try to store in Redis cache, but don't fail if Redis is unavailable
    try {
      await redis.set("server_status", JSON.stringify(serverStatus), { ex: CACHE_TTL })
    } catch (redisError) {
      console.error("Redis set error:", redisError)
      // Continue without caching if Redis fails
    }

    return NextResponse.json({
      success: true,
      data: {
        online: serverStatus.is_online,
        player_count: serverStatus.player_count,
        max_players: serverStatus.max_players,
        version: serverStatus.version,
        last_updated: serverStatus.updated_at,
      },
      source: "database",
    })
  } catch (error) {
    console.error("Error in server status API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { server_name, server_ip, is_online, player_count, max_players, version } = body

    // Update database
    let serverStatus
    try {
      const { data, error } = await supabase
        .from("server_status")
        .insert([{ server_name, server_ip, is_online, player_count, max_players, version }])
        .select()
        .single()

      if (error) {
        console.error("Database error:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update server status in database",
          },
          { status: 500 },
        )
      }

      serverStatus = data
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
      await redis.set("server_status", JSON.stringify(serverStatus), { ex: CACHE_TTL })
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
