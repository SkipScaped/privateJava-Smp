// Discord OAuth configuration
const DISCORD_CLIENT_ID = "1369229027864350761"
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ""
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "http://localhost:3000/api/auth/discord/callback"
const DISCORD_API_ENDPOINT = "https://discord.com/api/v10"

// Scopes required for Discord authentication
const DISCORD_SCOPES = ["identify", "email"]

// Generate the Discord OAuth URL
export function getDiscordAuthUrl(state?: string) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: DISCORD_SCOPES.join(" "),
  })

  if (state) {
    params.append("state", state)
  }

  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

// Exchange code for Discord access token
export async function getDiscordToken(code: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}> {
  const response = await fetch(`${DISCORD_API_ENDPOINT}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }).toString(),
  })

  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Get Discord user information
export async function getDiscordUser(token: string): Promise<{
  id: string
  username: string
  avatar: string
  discriminator: string
  email: string
}> {
  const response = await fetch(`${DISCORD_API_ENDPOINT}/users/@me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Get Discord user avatar URL
export function getDiscordAvatarUrl(userId: string, avatarId: string) {
  if (!avatarId) return null
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`
}
