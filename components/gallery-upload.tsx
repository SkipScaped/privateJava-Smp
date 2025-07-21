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
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function GalleryUpload() {
  const { user } = useAuth()
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
      setError("Please select a valid image file (JPEG, PNG, GIF, WEBP)")
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

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload images.",
        variant: "destructive",
      })
      return
    }

    if (!user.emailConfirmed) {
      toast({
        title: "Email confirmation required",
        description: "Please confirm your email before uploading images.",
        variant: "destructive",
      })
      return
    }

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

      // Save to Supabase database
      const { error: dbError } = await supabase.from("gallery").insert({
        user_id: user.id,
        title,
        description,
        image_url: imageUrl,
      })

      if (dbError) {
        console.error("Database error:", dbError)
        toast({
          title: "Upload failed",
          description: "Failed to save image to database. Please try again.",
          variant: "destructive",
        })
        return
      }

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

      // Refresh the page to show the new image
      window.location.reload()
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

  if (!user) {
    return (
      <Card className="bg-gray-800 border-none minecraft-card rounded-none">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-2 minecraft-text">Want to share your builds?</h3>
          <p className="text-gray-400 mb-4 minecraft-text">Please log in to upload images to the gallery.</p>
          <Link href="/auth/login?redirect=/gallery">
            <Button className="bg-green-600 hover:bg-green-700 minecraft-button rounded-none">Login to Upload</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (!user.emailConfirmed) {
    return (
      <Card className="bg-gray-800 border-none minecraft-card rounded-none">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-2 minecraft-text">Email Confirmation Required</h3>
          <p className="text-gray-400 mb-4 minecraft-text">
            Please confirm your email address before uploading images.
          </p>
          <Link href="/auth/login">
            <Button className="bg-yellow-600 hover:bg-yellow-700 minecraft-button rounded-none">Confirm Email</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-none minecraft-card rounded-none">
      <CardHeader>
        <CardTitle className="minecraft-text">Share Your Minecraft Creation</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="minecraft-text">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your image"
              className="bg-gray-700 border-gray-600 rounded-none minecraft-border minecraft-text"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="minecraft-text">
              Description (optional)
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your creation"
              className="bg-gray-700 border-gray-600 rounded-none minecraft-border minecraft-text"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="minecraft-text">
              Image
            </Label>
            <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-none p-4 hover:border-gray-500 transition-colors minecraft-border">
              <label htmlFor="image" className="cursor-pointer w-full">
                {preview ? (
                  <div className="relative w-full h-48">
                    <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400 minecraft-text">Click to upload an image</p>
                    <p className="text-xs text-gray-500 mt-1 minecraft-text">PNG, JPG, GIF, or WEBP up to 5MB</p>
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

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 rounded-none p-3 text-sm minecraft-border minecraft-text">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border-2 border-green-500 rounded-none p-3 text-sm minecraft-border minecraft-text">
              Image uploaded successfully!
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {file && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={uploading}
              className="flex-1 minecraft-button rounded-none bg-transparent"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 minecraft-button rounded-none"
            disabled={uploading || !file}
          >
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
