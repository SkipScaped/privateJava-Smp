import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Server, Gift } from "lucide-react"
import Image from "next/image"
import ServerStatus from "@/components/server-status"

export default function Home() {
  // Define fallback images to avoid empty strings
  const heroImage = "/placeholder.svg?height=500&width=1920&text=Minecraft+World"
  const logoImage = "/logo.webp"

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>
        <div className="relative h-[500px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/50 to-blue-900/50 z-10"></div>
          {/* Use the defined fallback image */}
          <Image src={heroImage || "/placeholder.svg"} alt="Minecraft World" fill className="object-cover" priority />
        </div>

        <div className="container mx-auto px-4 absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 mb-6">
            {/* Use the defined logo image */}
            <Image
              src={logoImage || "/placeholder.svg"}
              alt="Private Java SMP Logo"
              width={128}
              height={128}
              className="rounded-lg"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Private Java SMP
          </h1>

          <p className="text-xl text-gray-200 max-w-2xl mb-8">
            Join our private Java SMP server and experience Minecraft like never before. Build, explore, and make new
            friends in our growing community!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get VIP Access
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Server Status Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <ServerStatus />
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Our Server?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience Minecraft in a friendly community with amazing features and regular events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Friendly Community</h2>
            <p className="text-gray-300">
              Join a friendly and active community of Minecraft enthusiasts. Make new friends and create amazing builds
              together!
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Gift className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Exclusive Perks</h2>
            <p className="text-gray-300">
              Unlock special features and benefits with our VIP packages. Get discounts, exclusive kits, and more!
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Server className="h-6 w-6 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Regular Events</h2>
            <p className="text-gray-300">
              Participate in server-wide events, competitions, and minigames with awesome rewards for winners!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-900 to-blue-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Sign up now and start your adventure on our Private Java SMP server!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-200">
                Create Account
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="border-white hover:bg-white/10">
                View Gallery
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
