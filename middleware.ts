import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define which routes require authentication
const protectedRoutes = ["/profile", "/gallery/upload"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Get the auth cookie
    const authCookie = request.cookies.get("minecraft_smp_auth")?.value

    // If no auth cookie, redirect to login
    if (!authCookie) {
      console.log("Middleware: No auth cookie found, redirecting to login")
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // Auth cookie exists, allow access
    console.log("Middleware: Auth cookie found, allowing access")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/gallery/upload"],
}
