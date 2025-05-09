import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string
// Add error handling for the connection
let sql
try {
  sql = neon(process.env.DATABASE_URL!)
  console.log("Database connection initialized")
} catch (error) {
  console.error("Failed to initialize database connection:", error)
  // Create a mock SQL function that returns empty arrays for queries
  sql = async () => []
}

// Export the SQL client for raw queries
export { sql }
