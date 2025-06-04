"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import SafeImage from "@/components/safe-image"
import { Calendar, User } from "lucide-react"
import { useAuth } from "@/context/auth-context"

// Mock gallery images
const mockGalleryImages = [
  {
    id: 1,
    title: "My Castle Build",
    description: "A medieval castle I built on the server",
    image_url: "/placeholder.svg?height=300&width=400&text=Castle",
    username: "DiamondMiner42",
    created_at: "2023-05-15T12:00:00Z",
  },
  {
    id: 2,
    title: "Redstone Contraption",
    description: "Automatic farm with sorting system",
    image_url: "/placeholder.svg?height=300&width=400&text=Redstone",
    username: "RedstoneWizard",
    created_at: "2023-06-20T14:30:00Z",
  },
  {
    id: 3,
    title: "Underwater Base",
    description: "My underwater glass dome base",
    image_url: "/placeholder.svg?height=300&width=400&text=Underwater",
    username: "BuildMaster99",
    created_at: "2023-07-10T09:15:00Z",
  },
  {
    id: 4,
    title: "Mountain Village",
    description: "Village built into the side of a mountain",
    image_url: "/placeholder.svg?height=300&width=400&text=Mountain",
    username: "ExplorerKing",
    created_at: "2023-08-05T16:45:00Z",
  },
]

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setImages(mockGalleryImages)
      setIsLoading(false)
    }, 500)
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6">Server Gallery</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Share screenshots of your amazing builds and adventures on our Minecraft server!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Want to share your builds?</h3>
              <p className="text-gray-400 mb-4">
                {user
                  ? "Gallery uploads are temporarily disabled for maintenance."
                  : "Please log in to upload images to the gallery."}
              </p>
              {!user && (
                <a href="/auth/login" className="text-green-400 hover:underline">
                  Login to contribute
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Recent Uploads</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 animate-pulse">
                  <div className="h-48 w-full bg-gray-700"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="bg-gray-800 border-gray-700 overflow-hidden hover:border-green-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-green-500/20"
                >
                  <div className="relative h-48 w-full">
                    <SafeImage
                      src={image.image_url}
                      alt={image.title}
                      fill
                      className="object-cover"
                      fallbackText="No Image"
                    />
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{image.title}</h3>

                    {image.description && <p className="text-gray-400 text-sm mb-3">{image.description}</p>}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {image.username || "Unknown user"}
                      </div>

                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(image.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
