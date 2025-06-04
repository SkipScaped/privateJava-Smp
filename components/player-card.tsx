import { Card, CardContent } from "@/components/ui/card"
import SafeImage from "@/components/safe-image"
import type { Player } from "@/lib/data"

interface PlayerCardProps {
  player: Player
}

export default function PlayerCard({ player }: PlayerCardProps) {
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
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-500 transition-colors">
      <CardContent className="p-6 flex flex-col items-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4">
          <SafeImage
            src={player.profilePicture}
            alt={player.username}
            fill
            className="object-cover"
            fallbackText={player.username.substring(0, 2).toUpperCase()}
          />
        </div>

        <h3 className="text-xl font-semibold text-center">{player.username}</h3>

        <p className={`text-sm ${getRankColor(player.rank)} font-medium mt-1`}>{player.rank}</p>

        <p className="text-xs text-gray-400 mt-2">Joined: {new Date(player.joinDate).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  )
}
