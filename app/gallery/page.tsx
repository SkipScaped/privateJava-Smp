import { sql } from "@/lib/db"
import GalleryUpload from "@/components/gallery-upload"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Calendar, User, AlertCircle } from "lucide-react"
import { getServerSession } from "@/lib/session"

async function getGalleryImages() {
  try {
    const images = await sql`
      SELECT g.*, u.username 
      FROM gallery g
      LEFT JOIN users u ON g.user_id = u.id
      ORDER BY g.created_at DESC
    `
    return { success: true, data: images }
  } catch (error) {
    console.error("Error fetching gallery images:", error)
    return { success: false, error: "Failed to load gallery images" }
  }
}

export default async function GalleryPage() {
  const galleryResult = await getGalleryImages()
  const session = await getServerSession()

  // Show error if gallery failed to load
  const errorMessage = !galleryResult.success
    ? "There was a problem loading the gallery. Please try again later."
    : null

  const images = galleryResult.success ? galleryResult.data : []

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6">Server Gallery</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Share screenshots of your amazing builds and adventures on our Minecraft server!
      </p>

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500 rounded-md p-4 flex items-start max-w-2xl mx-auto mb-8">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          {session?.user ? (
            <GalleryUpload userId={session.user.id} />
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">Want to share your builds?</h3>
                <p className="text-gray-400 mb-4">Please log in to upload images to the gallery.</p>
                <a href="/auth/login" className="text-green-400 hover:underline">
                  Login to contribute
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Recent Uploads</h2>

          {images.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">No images have been uploaded yet. Be the first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.map((image: any) => (
                <Card
                  key={image.id}
                  className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={image.image_url || "/placeholder.svg?height=200&width=200&text=No+Image"}
                      alt={image.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=No+Image"
                      }}
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
