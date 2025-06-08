import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center max-w-md">
        {/* Minecraft-style 404 */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-red-500 minecraft-text mb-4 animate-pulse">404</div>
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-800 border-4 border-gray-600 minecraft-border relative">
            <div className="absolute inset-2 bg-gray-700 minecraft-border border-2 border-gray-500">
              <div className="flex items-center justify-center h-full">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 minecraft-text">🚫 Page Not Found</h1>
        <h2 className="text-xl font-semibold mb-6 text-gray-300 minecraft-text">
          This chunk hasn't been generated yet!
        </h2>

        <p className="text-gray-400 mb-8 minecraft-text leading-relaxed">
          The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
          Let's get you back to spawn!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="flex items-center gap-2 bg-green-700 hover:bg-green-800 minecraft-button">
              <Home className="h-4 w-4" />🏠 Return to Spawn
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" className="flex items-center gap-2 minecraft-button">
              🛒 Visit Shop
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500 minecraft-text">
          <p>Error Code: CHUNK_NOT_FOUND</p>
          <p>Server: Private Java SMP</p>
        </div>
      </div>
    </div>
  )
}
