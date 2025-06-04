export const DISCORD_CONFIG = {
  CLIENT_ID: process.env.DISCORD_CLIENT_ID || "1369229027864350761",
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "",
  REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || "http://localhost:3000/api/auth/discord/callback",
  INVITE_URL: "https://discord.gg/2DEx6pR3rv",
  API_ENDPOINT: "https://discord.com/api/v10",
  OAUTH_URL: "https://discord.com/api/oauth2/authorize",
  TOKEN_URL: "https://discord.com/api/oauth2/token",
  SCOPE: "identify email",
}

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email: string
  verified: boolean
}

// Get Discord user information - New implementation
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_CONFIG.API_ENDPOINT}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Discord user")
  }

  return response.json()
}

// Generate Discord OAuth URL - New implementation
export function getDiscordAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.CLIENT_ID,
    redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
    response_type: "code",
    scope: DISCORD_CONFIG.SCOPE,
  })

  if (state) {
    params.append("state", state)
  }

  return `${DISCORD_CONFIG.OAUTH_URL}?${params.toString()}`
}

// Exchange code for token - New implementation
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch(DISCORD_CONFIG.TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: DISCORD_CONFIG.CLIENT_ID,
      client_secret: DISCORD_CONFIG.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to exchange code for token")
  }

  const data = await response.json()
  return data.access_token
}

// LEGACY FUNCTIONS - Adding back for backward compatibility

// Exchange code for Discord access token - Legacy function
export async function getDiscordToken(code: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}> {
  const response = await fetch(`${DISCORD_CONFIG.API_ENDPOINT}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: DISCORD_CONFIG.CLIENT_ID,
      client_secret: DISCORD_CONFIG.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
    }).toString(),
  })

  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Get Discord user avatar URL - Legacy function
export function getDiscordAvatarUrl(userId: string, avatarId: string) {
  if (!avatarId) return null
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`
}
