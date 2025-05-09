"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Server, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type ServerStatus = {
  online: boolean
  player_count: number
  max_players: number
  version: string
  last_updated: string
}

export default function ServerStatus() {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchStatus = async () => {
    try {
      setLoading(true)

      // Add a cache-busting query parameter to avoid browser caching
      const response = await fetch(`/api/server-status?t=${Date.now()}`, {
        // Add headers to prevent caching
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStatus(data.data)
        setError(null)
      } else {
        setError(data.message || "Failed to fetch server status")
      }
    } catch (err) {
      console.error("Error fetching server status:", err)
      setError("Error connecting to server")
      // Set a default status on error
      setStatus({
        online: false,
        player_count: 0,
        max_players: 0,
        version: "Unknown",
        last_updated: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    // Refresh status every minute
    const interval = setInterval(fetchStatus, 60000)

    return () => clearInterval(interval)
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">Server Status</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-pulse h-20 w-full bg-gray-700 rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Server Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {error ? (
          <div className="text-center py-2 w-full">
            <Badge variant="destructive">Error</Badge>
            <p className="mt-2 text-gray-400 text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-2 flex items-center gap-1" onClick={handleRetry}>
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-full">
              <Badge className={status?.online ? "bg-green-500" : "bg-red-500"}>
                {status?.online ? "Online" : "Offline"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  {status?.player_count} / {status?.max_players} players
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{status?.version}</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 w-full text-center">
              Last updated: {status ? new Date(status.last_updated).toLocaleString() : "Unknown"}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
