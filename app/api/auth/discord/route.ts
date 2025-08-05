import { type NextRequest, NextResponse } from "next/server"
import { getDiscordAuthUrl } from "@/lib/discord"

export function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const redirectPath = searchParams.get("redirect") || "/profile"

    // Create state parameter with redirect path
    const state = redirectPath ? Buffer.from(JSON.stringify({ redirectPath })).toString("base64") : undefined

    // Generate Discord OAuth URL
    const discordAuthUrl = getDiscordAuthUrl(state)

    // Return the URL in the response instead of redirecting directly
    return NextResponse.json({
      success: true,
      url: discordAuthUrl,
    })
  } catch (error) {
    console.error("Discord auth error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate Discord authentication URL",
      },
      { status: 500 },
    )
  }
}
