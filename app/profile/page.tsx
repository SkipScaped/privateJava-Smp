"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Calendar, Edit, Save, X, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    bio: "I love building redstone contraptions and exploring new biomes! Welcome to our Private Java SMP server.",
    profilePicture: "",
  })
  const [savedData, setSavedData] = useState({
    bio: "I love building redstone contraptions and exploring new biomes! Welcome to our Private Java SMP server.",
    profilePicture: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only redirect if we're mounted and not loading and no user
    if (mounted && !isLoading && !user) {
      router.push("/auth/login?redirect=/profile")
    }
  }, [mounted, isLoading, user, router])

  useEffect(() => {
    if (user) {
      const initialBio =
        "I love building redstone contraptions and exploring new biomes! Welcome to our Private Java SMP server."
      const initialProfilePicture = user.profilePicture || ""

      setEditData({
        bio: initialBio,
        profilePicture: initialProfilePicture,
      })

      setSavedData({
        bio: initialBio,
        profilePicture: initialProfilePicture,
      })
    }
  }, [user])

  const handleSave = () => {
    // Save the edited data
    setSavedData({
      bio: editData.bio,
      profilePicture: editData.profilePicture,
    })

    // In a real app, this would save to the database
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated!",
      variant: "default",
    })

    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset to the saved data
    setEditData({
      bio: savedData.bio,
      profilePicture: savedData.profilePicture,
    })

    setIsEditing(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditData({ ...editData, profilePicture: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Show loading while checking authentication
  if (!mounted || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
          <p className="text-lg minecraft-text">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show loading if no user (will redirect)
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
          <p className="text-lg minecraft-text">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 minecraft-title">Your Profile</h1>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-none minecraft-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="relative w-32 h-32 rounded-none overflow-hidden minecraft-border border-4 border-gray-700">
                  {isEditing && editData.profilePicture ? (
                    <Image
                      src={editData.profilePicture || "/placeholder.svg"}
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                    />
                  ) : savedData.profilePicture ? (
                    <Image
                      src={savedData.profilePicture || "/placeholder.svg"}
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-bold">
                      {user.username?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-none">
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-white" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                  <CardTitle className="text-2xl minecraft-text">{user.username}</CardTitle>
                  {user.rank && (
                    <Badge className="bg-yellow-600 text-white rounded-none minecraft-border">{user.rank}</Badge>
                  )}
                </div>
                <CardDescription className="minecraft-text">{user.email}</CardDescription>
                <div className="flex items-center gap-1 text-sm text-gray-400 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-700 hover:bg-blue-800 minecraft-button rounded-none"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-green-700 hover:bg-green-800 minecraft-button rounded-none"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="minecraft-button rounded-none">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-medium mb-2 minecraft-text">About Me</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-none minecraft-border minecraft-text"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-300 bg-gray-700/50 p-4 minecraft-border border-2 border-gray-600 minecraft-text">
                    {savedData.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
