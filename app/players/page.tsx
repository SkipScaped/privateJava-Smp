"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import SafeImage from "@/components/safe-image"

type Player = {
  id: number
  username: string
  profile_picture_url?: string
  rank: string
  created_at: string
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("id, username, profile_picture_url, rank, created_at")
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Error fetching players:", fetchError)
        setError("Failed to load players")
        return
      }

      setPlayers(data || [])
    } catch (err) {
      console.error("Error fetching players:", err)
      setError("Failed to load players")
    } finally {
      setIsLoading(false)
    }
  }

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
      <h1 className="text-4xl font-bold text-center mb-6 minecraft-title">Server Players</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto minecraft-text">
        Meet the players who have joined our Private Java SMP community. Sign up to see your name here!
      </p>

      <div className="max-w-xl mx-auto mb-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 minecraft-border rounded-none minecraft-text"
        />
      </div>

      {error && (
        <div className="text-center py-8">
          <div className="bg-red-500/20 border-2 border-red-500 rounded-none p-4 max-w-md mx-auto minecraft-border">
            <p className="text-red-400 minecraft-text">{error}</p>
            <Button onClick={fetchPlayers} className="mt-4 bg-red-600 hover:bg-red-700 minecraft-button rounded-none">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
            <p className="text-lg minecraft-text">Loading players...</p>
          </div>
        </div>
      ) : (
        <>
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-none minecraft-card">
              {searchTerm ? (
                <div>
                  <p className="text-xl mb-4 minecraft-text">No players found matching "{searchTerm}"</p>
                  <Button
                    onClick={() => setSearchTerm("")}
                    className="bg-green-600 hover:bg-green-700 minecraft-button rounded-none"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : players.length === 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <UserPlus className="h-16 w-16 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xl mb-4 minecraft-text">No players have signed up yet</p>
                    <p className="text-gray-400 max-w-md mx-auto mb-6 minecraft-text">
                      Be the first to join our community! Sign up to see your profile displayed here.
                    </p>
                    <Link href="/auth/signup">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 minecraft-button rounded-none">
                        Sign Up Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-xl minecraft-text">No players match your search</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="bg-gray-800 border-none minecraft-card hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="relative w-20 h-20 rounded-none overflow-hidden mb-4 minecraft-border border-2 border-gray-700">
                      {player.profile_picture_url ? (
                        <SafeImage
                          src={player.profile_picture_url}
                          alt={player.username}
                          fill
                          className="object-cover"
                          fallbackText={player.username.substring(0, 2).toUpperCase()}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-bold">
                          {player.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-center minecraft-text">{player.username}</h3>

                    <p className={`text-sm ${getRankColor(player.rank)} font-medium mt-1 minecraft-text`}>
                      {player.rank}
                    </p>

                    <p className="text-xs text-gray-400 mt-2 minecraft-text">
                      Joined: {new Date(player.created_at).toLocaleDateString()}
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
