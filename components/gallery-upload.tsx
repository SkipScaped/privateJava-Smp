"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadImage } from "@/lib/blob"
import { ImagePlus, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function GalleryUpload({ userId }: { userId: number }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(selectedFile.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF)")
      return
    }

    if (selectedFile.size > maxSize) {
      setError("Image is too large. Maximum size is 5MB")
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title) {
      setError("Please provide a title and image")
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Generate a unique filename
      const filename = `gallery/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

      // Upload to Blob storage
      const imageUrl = await uploadImage(file, filename)

      // Save to database
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          title,
          description,
          image_url: imageUrl,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTitle("")
        setDescription("")
        setFile(null)
        setPreview(null)

        toast({
          title: "Image uploaded successfully!",
          description: "Your image has been added to the gallery.",
          variant: "default",
        })

        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.message || "Failed to upload image")
        toast({
          title: "Upload failed",
          description: data.message || "There was a problem uploading your image.",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("Error uploading image")
      console.error(err)
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setFile(null)
    setPreview(null)
    setError(null)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle>Share Your Minecraft Creation</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your image"
              className="bg-gray-700 border-gray-600"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your creation"
              className="bg-gray-700 border-gray-600"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md p-4 hover:border-gray-500 transition-colors">
              <label htmlFor="image" className="cursor-pointer w-full">
                {preview ? (
                  <div className="relative w-full h-48">
                    <img
                      src={preview ? preview : "/placeholder.svg?height=200&width=200&text=Preview"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Click to upload an image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF up to 5MB</p>
                  </div>
                )}
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500 rounded-md p-3 text-sm">{error}</div>}

          {success && (
            <div className="bg-green-500/20 border border-green-500 rounded-md p-3 text-sm">
              Image uploaded successfully!
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {file && (
            <Button type="button" variant="outline" onClick={resetForm} disabled={uploading} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={uploading || !file}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Image"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
