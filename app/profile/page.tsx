"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Upload, User, Mail, Calendar, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [profilePicture, setProfilePicture] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Load profile data from localStorage
    const savedProfilePicture = localStorage.getItem(`profile_picture_${user.username}`)
    const savedDescription = localStorage.getItem(`profile_description_${user.username}`)

    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture)
    }
    if (savedDescription) {
      setDescription(savedDescription)
    }
  }, [user, router])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      const imageUrl = data.url

      setProfilePicture(imageUrl)
      localStorage.setItem(`profile_picture_${user.username}`, imageUrl)

      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been successfully uploaded.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDescriptionSave = () => {
    if (!user) return

    setSaving(true)

    try {
      localStorage.setItem(`profile_description_${user.username}`, description)

      toast({
        title: "Description saved!",
        description: "Your profile description has been updated.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save description. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white minecraft-text">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold minecraft-title mb-2">Player Profile</h1>
          <p className="text-gray-400 minecraft-text">Manage your profile information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Card */}
          <Card className="bg-gray-800 border-gray-700 minecraft-card rounded-none">
            <CardHeader>
              <CardTitle className="minecraft-text text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 relative rounded-none overflow-hidden minecraft-border border-4 border-gray-600 bg-gray-700">
                  {profilePicture ? (
                    <Image
                      src={profilePicture || "/placeholder.svg"}
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="mt-4 w-full">
                  <Label htmlFor="profile-picture" className="minecraft-text text-white">
                    Upload New Picture
                  </Label>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="mt-2 bg-gray-700 border-gray-600 text-white minecraft-border rounded-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 minecraft-text">Max size: 5MB. Supported: JPG, PNG, GIF</p>
                </div>

                {uploading && (
                  <Button disabled className="mt-4 w-full minecraft-button rounded-none">
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card className="bg-gray-800 border-gray-700 minecraft-card rounded-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="minecraft-text text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="minecraft-text text-white flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    value={user.username || ""}
                    disabled
                    className="mt-2 bg-gray-700 border-gray-600 text-white minecraft-border rounded-none"
                  />
                </div>

                <div>
                  <Label className="minecraft-text text-white flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    value={user.email || ""}
                    disabled
                    className="mt-2 bg-gray-700 border-gray-600 text-white minecraft-border rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="minecraft-text text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </Label>
                  <Input
                    value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    disabled
                    className="mt-2 bg-gray-700 border-gray-600 text-white minecraft-border rounded-none"
                  />
                </div>

                <div>
                  <Label className="minecraft-text text-white flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    VIP Status
                  </Label>
                  <Input
                    value={user.vipRank || "None"}
                    disabled
                    className="mt-2 bg-gray-700 border-gray-600 text-white minecraft-border rounded-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="minecraft-text text-white">
                  Profile Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell other players about yourself..."
                  maxLength={500}
                  className="mt-2 bg-gray-700 border-gray-600 text-white minecraft-border rounded-none min-h-[100px]"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400 minecraft-text">{description.length}/500 characters</p>
                  <Button
                    onClick={handleDescriptionSave}
                    disabled={saving}
                    className="bg-green-700 hover:bg-green-800 minecraft-button rounded-none"
                  >
                    {saving ? "Saving..." : "Save Description"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
