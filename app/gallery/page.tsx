import { supabase } from "@/lib/supabase"
import GalleryUpload from "@/components/gallery-upload"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User, AlertCircle } from "lucide-react"
import SafeImage from "@/components/safe-image"

async function getGalleryImages() {
  try {
    const { data: images, error } = await supabase
      .from("gallery")
      .select(`
        *,
        users (
          username
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching gallery images:", error)
      return { success: false, error: "Failed to load gallery images" }
    }

    return { success: true, data: images }
  } catch (error) {
    console.error("Error fetching gallery images:", error)
    return { success: false, error: "Failed to load gallery images" }
  }
}

export default async function GalleryPage() {
  const galleryResult = await getGalleryImages()

  // Show error if gallery failed to load
  const errorMessage = !galleryResult.success
    ? "There was a problem loading the gallery. Please try again later."
    : null

  const images = galleryResult.success ? galleryResult.data : []

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6 minecraft-title">Server Gallery</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto minecraft-text">
        Share screenshots of your amazing builds and adventures on our Minecraft server!
      </p>

      {errorMessage && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-none p-4 flex items-start max-w-2xl mx-auto mb-8 minecraft-border">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="minecraft-text">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <GalleryUpload />
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 minecraft-text">Recent Uploads</h2>

          {images.length === 0 ? (
            <div className="bg-gray-800 rounded-none p-8 text-center minecraft-card">
              <p className="text-gray-400 minecraft-text">No images have been uploaded yet. Be the first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.map((image: any) => (
                <Card
                  key={image.id}
                  className="bg-gray-800 border-none minecraft-card overflow-hidden hover:border-gray-600 transition-colors"
                >
                  <div className="relative h-48 w-full">
                    <SafeImage
                      src={image.image_url}
                      alt={image.title}
                      fill
                      className="object-cover"
                      fallbackText="IMG"
                    />
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2 minecraft-text">{image.title}</h3>

                    {image.description && (
                      <p className="text-gray-400 text-sm mb-3 minecraft-text">{image.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span className="minecraft-text">{image.users?.username || "Unknown user"}</span>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="minecraft-text">{new Date(image.created_at).toLocaleDateString()}</span>
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
