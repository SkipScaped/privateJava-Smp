"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Camera, Save, User, Settings, Shield, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { uploadImage } from "@/lib/blob"

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "I love building redstone contraptions and exploring new biomes!",
    profilePicture: "/placeholder.svg?height=200&width=200",
    rank: "Member",
    joinDate: new Date().toISOString().split("T")[0],
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If not logged in, redirect to login
    if (!isLoading && !user) {
      router.push("/auth/login?redirect=/profile")
    }

    // Update profile with user data when available
    if (user) {
      setProfile({
        username: user.username,
        email: user.email,
        bio: profile.bio,
        profilePicture:
          user.profilePicture ||
          `/placeholder.svg?height=200&width=200&text=${user.username.substring(0, 2).toUpperCase()}`,
        rank: user.rank || "Member",
        joinDate: profile.joinDate,
      })
      setEditedProfile({
        username: user.username,
        email: user.email,
        bio: profile.bio,
        profilePicture:
          user.profilePicture ||
          `/placeholder.svg?height=200&width=200&text=${user.username.substring(0, 2).toUpperCase()}`,
        rank: user.rank || "Member",
        joinDate: profile.joinDate,
      })
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      // Make API call to update profile
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: editedProfile.email,
          bio: editedProfile.bio,
          profilePicture: editedProfile.profilePicture,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProfile(editedProfile)
        setIsEditing(false)
        await refreshUser()

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
          variant: "default",
        })
      } else {
        setError(data.message || "Failed to update profile")
        toast({
          title: "Update failed",
          description: data.message || "There was a problem updating your profile.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("There was a problem updating your profile. Please try again.")
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
    setError(null)
  }

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const maxSize = 2 * 1024 * 1024 // 2MB

    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image (JPEG, PNG, GIF)")
      return
    }

    if (file.size > maxSize) {
      setError("Image is too large. Maximum size is 2MB")
      return
    }

    try {
      setUploadingImage(true)
      setError(null)

      // Create local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedProfile((prev) => ({ ...prev, profilePicture: reader.result as string }))
      }
      reader.readAsDataURL(file)

      // Upload to Blob storage
      const filename = `profiles/${user!.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      const imageUrl = await uploadImage(file, filename)

      // Update profile picture in editedProfile
      setEditedProfile((prev) => ({ ...prev, profilePicture: imageUrl }))

      toast({
        title: "Image uploaded",
        description: "Your profile picture has been uploaded.",
        variant: "default",
      })
    } catch (err) {
      console.error("Error uploading image:", err)
      setError("Failed to upload image. Please try again.")

      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Gold VIP":
        return "bg-yellow-500 text-black"
      case "Silver VIP":
        return "bg-gray-300 text-black"
      case "Bronze VIP":
        return "bg-amber-600 text-white"
      default:
        return "bg-green-600 text-white"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Your Profile</h1>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <div
                      className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 ${isEditing ? "cursor-pointer" : ""}`}
                      onClick={handleImageClick}
                    >
                      {uploadingImage ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      ) : (
                        <Image
                          src={
                            (isEditing ? editedProfile.profilePicture : profile.profilePicture) ||
                            `/placeholder.svg?height=200&width=200&text=${profile.username.substring(0, 2).toUpperCase()}`
                          }
                          alt="Profile Picture"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {isEditing && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                        <Button
                          size="icon"
                          className="absolute bottom-0 right-0 rounded-full bg-green-600 hover:bg-green-700"
                          onClick={handleImageClick}
                          disabled={uploadingImage}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                      <CardTitle className="text-2xl">
                        {isEditing ? (
                          <Input
                            name="username"
                            value={editedProfile.username}
                            onChange={handleChange}
                            className="bg-gray-700 border-gray-600 text-xl font-bold"
                            disabled
                          />
                        ) : (
                          profile.username
                        )}
                      </CardTitle>
                      <Badge className={`${getRankColor(profile.rank)}`}>{profile.rank}</Badge>
                    </div>
                    <CardDescription>
                      {isEditing ? (
                        <Input
                          name="email"
                          value={editedProfile.email}
                          onChange={handleChange}
                          className="bg-gray-700 border-gray-600 mt-2"
                        />
                      ) : (
                        profile.email
                      )}
                    </CardDescription>
                    <p className="text-sm text-gray-400 mt-1">
                      Joined: {new Date(profile.joinDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="ml-auto">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="bg-red-500/20 border border-red-500 rounded-md p-3 flex items-start mb-4">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">About Me</Label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        name="bio"
                        value={editedProfile.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full mt-2 p-2 rounded-md bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500"
                      />
                    ) : (
                      <p className="mt-2 text-gray-300 bg-gray-700/50 p-4 rounded-md">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account settings and preferences</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </CardContent>

              <CardFooter>
                <Button className="bg-green-600 hover:bg-green-700">Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
