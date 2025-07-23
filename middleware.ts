import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes
    const protectedRoutes = ["/profile", "/gallery/upload"]
    const adminRoutes = ["/admin"]

    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute || isAdminRoute) {
      if (!session) {
        // Redirect to login with return URL
        const redirectUrl = new URL("/auth/login", req.url)
        redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check if email is confirmed
      if (!session.user.email_confirmed_at) {
        const redirectUrl = new URL("/auth/login", req.url)
        redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check admin access for admin routes
      if (isAdminRoute) {
        // Get user profile to check admin status
        const { data: profile } = await supabase
          .from("users")
          .select("is_admin")
          .eq("auth_id", session.user.id)
          .single()

        if (!profile?.is_admin && session.user.email !== "skipscape.dev@gmail.com") {
          // Redirect non-admin users away from admin routes
          return NextResponse.redirect(new URL("/", req.url))
        }
      }
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/profile/:path*", "/gallery/upload", "/admin/:path*"],
}
