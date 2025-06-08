"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Server, Gift, Copy, Check } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function Home() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const serverIP = "private-java-smp.aternos.me:42323"

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(serverIP)
      setCopied(true)
      toast({
        title: "Server IP Copied!",
        description: "The server IP has been copied to your clipboard.",
        variant: "default",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy server IP. Please copy it manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>
        <div className="relative h-[500px] w-full overflow-hidden bg-gradient-to-r from-green-900/50 to-blue-900/50">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
        </div>

        <div className="container mx-auto px-4 absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
          {/* Fixed logo display */}
          {/* Much bigger logo that actually shows */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mb-6 sm:mb-8 relative minecraft-border border-8 border-gray-600 bg-gray-800/80 p-4 rounded-none">
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-green-500 bg-white/10">
              <Image
                src="/logo.png"
                alt="Private Java SMP Logo"
                width={256}
                height={256}
                className="object-contain w-full h-full"
                priority
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold animate-text-gradient bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-300% bg-clip-text text-transparent mb-4 minecraft-title">
            Private Java SMP
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mb-6 sm:mb-8 minecraft-text">
            Join our private Java SMP server and experience Minecraft like never before. Build, explore, and make new
            friends in our growing community!
          </p>

          {/* Server IP Section */}
          <div className="bg-gray-800/90 p-4 sm:p-6 rounded-none mb-6 sm:mb-8 minecraft-card border-4 border-gray-700 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2 minecraft-text">Server IP</h3>
            <div className="flex items-center gap-2 bg-gray-700 p-2 sm:p-3 rounded-none minecraft-border border-2 border-gray-600">
              <code className="text-green-400 font-mono flex-1 minecraft-text text-sm sm:text-base overflow-auto">
                {serverIP}
              </code>
              <Button
                size="sm"
                onClick={copyToClipboard}
                className="bg-green-700 hover:bg-green-800 minecraft-button rounded-none"
                disabled={copied}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 minecraft-text">
              Note: You need to login to access the server
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop">
              <Button size="lg" className="bg-green-700 hover:bg-green-800 minecraft-button rounded-none">
                Get VIP Access
              </Button>
            </Link>
            {mounted && !user ? (
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 minecraft-button rounded-none"
                >
                  Sign Up Now
                </Button>
              </Link>
            ) : (
              <Link href="/profile">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 minecraft-button rounded-none"
                >
                  View Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 minecraft-title">Why Join Our Server?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto minecraft-text">
            Experience Minecraft in a friendly community with amazing features and regular events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-gray-800 rounded-none p-6 shadow-lg transform hover:scale-105 transition-transform minecraft-card">
            <div className="w-12 h-12 bg-green-500/20 rounded-none flex items-center justify-center mb-4 minecraft-border">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 minecraft-text">Friendly Community</h2>
            <p className="text-gray-300 minecraft-text">
              Join a friendly and active community of Minecraft enthusiasts. Make new friends and create amazing builds
              together!
            </p>
          </div>

          <div className="bg-gray-800 rounded-none p-6 shadow-lg transform hover:scale-105 transition-transform minecraft-card">
            <div className="w-12 h-12 bg-blue-500/20 rounded-none flex items-center justify-center mb-4 minecraft-border">
              <Gift className="h-6 w-6 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 minecraft-text">Exclusive Perks</h2>
            <p className="text-gray-300 minecraft-text">
              Unlock special features and benefits with our VIP packages. Get discounts, exclusive kits, and more!
            </p>
          </div>

          <div className="bg-gray-800 rounded-none p-6 shadow-lg transform hover:scale-105 transition-transform minecraft-card">
            <div className="w-12 h-12 bg-purple-500/20 rounded-none flex items-center justify-center mb-4 minecraft-border">
              <Server className="h-6 w-6 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 minecraft-text">Regular Events</h2>
            <p className="text-gray-300 minecraft-text">
              Participate in server-wide events, competitions, and minigames with awesome rewards for winners!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-900 to-blue-900 py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 minecraft-title">Ready to Join?</h2>
          <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto minecraft-text">
            {mounted && user
              ? "Explore more features and connect with the community!"
              : "Sign up now and start your adventure on our Private Java SMP server!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {mounted && !user ? (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-200 minecraft-button rounded-none">
                    Create Account
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white hover:bg-white/10 minecraft-button rounded-none"
                  >
                    View Shop
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/shop">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-200 minecraft-button rounded-none">
                    View Shop
                  </Button>
                </Link>
                <Link href="/rules">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white hover:bg-white/10 minecraft-button rounded-none"
                  >
                    View Rules
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
