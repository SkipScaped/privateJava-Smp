import { createClient } from "@supabase/supabase-js"

/**
 * -----------------------------------------------------------------------------
 * Environment-variable discovery
 * -----------------------------------------------------------------------------
 * 1. First try the canonical “SUPABASE_NEXT_PUBLIC_…” names that v0 integrations
 *    create automatically.
 * 2. Fall back to plain “NEXT_PUBLIC_…” (some older guides use this).
 * 3. Finally fall back to the original “SUPABASE_URL / SUPABASE_ANON_KEY”.
 * -----------------------------------------------------------------------------
 */
const supabaseUrl =
  process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL

const supabaseAnonKey =
  process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables", {
    SUPABASE_NEXT_PUBLIC_SUPABASE_URL: !!process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
  })
  throw new Error(
    "Supabase env vars missing. Add SUPABASE_NEXT_PUBLIC_SUPABASE_URL and SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Project → Settings → Environment Variables.",
  )
}

/**
 * Browser / client-side Supabase instance (Anon key)
 * -----------------------------------------------------------------------------
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Server-side helper that uses the service-role key for Admin logic.
 * Never expose this on the client.
 * -----------------------------------------------------------------------------
 */
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY env var")
    throw new Error("Add SUPABASE_SERVICE_ROLE_KEY in Vercel Project → Settings → Environment Variables.")
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

/**
 * Simple connection check you can call from a server action or route
 * -----------------------------------------------------------------------------
 */
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from("users").select("id").limit(1)
    if (error) {
      console.error("❌ Supabase health-check failed:", error)
      return false
    }
    console.log("✅ Supabase connection OK")
    return true
  } catch (err) {
    console.error("❌ Supabase health-check threw:", err)
    return false
  }
}
