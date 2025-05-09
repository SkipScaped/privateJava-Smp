import { Redis } from "@upstash/redis"

// Create a Redis client with the connection string
let redis
try {
  redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
  console.log("Redis connection initialized")
} catch (error) {
  console.error("Failed to initialize Redis connection:", error)
  // Create a mock Redis client that doesn't throw errors
  redis = {
    get: async () => null,
    set: async () => null,
  }
}

export { redis }
