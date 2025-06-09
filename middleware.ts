import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define which routes require authentication
const protectedRoutes = ["/profile", "/gallery/upload"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Get the session ID from cookies
    const sessionId = request.cookies.get("sessionId")?.value

    // If no session ID, redirect to login
    if (!sessionId) {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // In a real app, you would verify the session with Redis here
    // For now, we'll just check if the session ID exists
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/gallery/upload"],
}
