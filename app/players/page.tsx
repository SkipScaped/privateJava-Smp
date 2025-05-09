"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Search, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// This would be replaced with a real API call to get registered users
export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch users from your database
    const fetchPlayers = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // In the real implementation, this would be an API call
        // const response = await fetch('/api/users')
        // const data = await response.json()
        // setPlayers(data.users)

        // For now, we'll just set an empty array since we want to show only real users
        setPlayers([])
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch players:", error)
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const filteredPlayers =
    searchTerm.trim() === ""
      ? players
      : players.filter((player) => player.username.toLowerCase().includes(searchTerm.toLowerCase()))

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Gold VIP":
        return "text-yellow-400"
      case "Silver VIP":
        return "text-gray-300"
      case "Bronze VIP":
        return "text-amber-600"
      default:
        return "text-green-400"
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6">Server Players</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Meet the players who have joined our Private Java SMP community. Sign up to see your name here!
      </p>

      <div className="max-w-xl mx-auto mb-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardContent className="p-6 h-40"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              {searchTerm ? (
                <p className="text-xl">No players found matching "{searchTerm}"</p>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <UserPlus className="h-16 w-16 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xl mb-4">No players have signed up yet</p>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      Be the first to join our community! Sign up to see your profile displayed here.
                    </p>
                    <Link href="/auth/signup">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700">
                        Sign Up Now
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="bg-gray-800 border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-gray-700">
                      <Image
                        src={player.profilePicture || "/placeholder.svg?height=100&width=100"}
                        alt={player.username}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>

                    <h3 className="text-xl font-semibold text-center">{player.username}</h3>

                    <p className={`text-sm ${getRankColor(player.rank)} font-medium mt-1`}>{player.rank}</p>

                    <p className="text-xs text-gray-400 mt-2">
                      Joined: {new Date(player.joinDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
