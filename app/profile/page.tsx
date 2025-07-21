"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Calendar, Edit, Save, X, Upload, AlertCircle, User, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { uploadImage } from "@/lib/blob"
import Image from "next/image"

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editData, setEditData] = useState({
    username: "",
    bio: "",
    profilePicture: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push("/auth/login?redirect=/profile")
    }
  }, [mounted, isLoading, user, router])

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username,
        bio: user.bio || "New member of the Private Java SMP!",
        profilePicture: user.profilePicture || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user || isSaving) return

    setIsSaving(true)

    const success = await updateProfile({
      username: editData.username,
      bio: editData.bio,
      profilePicture: editData.profilePicture,
    })

    if (success) {
      setIsEditing(false)
    }

    setIsSaving(false)
  }

  const handleCancel = () => {
    if (user) {
      setEditData({
        username: user.username,
        bio: user.bio || "New member of the Private Java SMP!",
        profilePicture: user.profilePicture || "",
      })
    }
    setIsEditing(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Upload to Vercel Blob
      const filename = `profile-pictures/${user.id}-${Date.now()}.${file.name.split(".").pop()}`
      const imageUrl = await uploadImage(file, filename)

      setEditData({ ...editData, profilePicture: imageUrl })

      toast({
        title: "Image uploaded",
        description: "Profile picture uploaded successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Loading state
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

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center max-w-md w-full bg-gray-800 p-6 rounded-none minecraft-card">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 minecraft-text">Authentication Required</h2>
          <p className="text-center minecraft-text mb-4">Please log in to access your profile.</p>
          <Button
            onClick={() => router.push("/auth/login?redirect=/profile")}
            className="bg-green-600 hover:bg-green-700 minecraft-button rounded-none"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  // Email not confirmed
  if (!user.emailConfirmed) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center max-w-md w-full bg-gray-800 p-6 rounded-none minecraft-card">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 minecraft-text">Email Confirmation Required</h2>
          <p className="text-center minecraft-text mb-4">
            Please check your email and confirm your account to access your profile.
          </p>
          <Button
            onClick={() => router.push("/auth/login")}
            className="bg-green-600 hover:bg-green-700 minecraft-button rounded-none"
          >
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-4xl font-bold text-center mb-8 sm:mb-12 minecraft-title">Your Profile</h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Information Card */}
        <Card className="bg-gray-800 border-none minecraft-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="relative w-32 h-32 rounded-none overflow-hidden minecraft-border border-4 border-gray-700">
                  {editData.profilePicture ? (
                    <Image
                      src={editData.profilePicture || "/placeholder.svg"}
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                      onError={() => {
                        setEditData({ ...editData, profilePicture: "" })
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-bold text-2xl">
                      {user.username?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-none">
                    <label htmlFor="profile-upload" className="cursor-pointer hover:opacity-80 transition-opacity">
                      <Upload className="h-8 w-8 text-white" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isSaving || isUploading}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                  <CardTitle className="text-2xl minecraft-text">
                    {isEditing ? (
                      <Input
                        value={editData.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-none minecraft-border minecraft-text text-2xl font-bold"
                        disabled={isSaving}
                        placeholder="Username"
                      />
                    ) : (
                      user.username
                    )}
                  </CardTitle>
                  {user.rank && (
                    <Badge className="bg-yellow-600 text-white rounded-none minecraft-border">{user.rank}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
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
                      disabled={isSaving || isUploading}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="minecraft-button rounded-none bg-transparent"
                      disabled={isSaving || isUploading}
                    >
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
                    maxLength={500}
                    disabled={isSaving}
                  />
                ) : (
                  <p className="text-gray-300 bg-gray-700/50 p-4 minecraft-border border-2 border-gray-600 minecraft-text rounded-none">
                    {editData.bio}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-1 minecraft-text">{editData.bio.length}/500 characters</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="bg-gray-800 border-none minecraft-card">
          <CardHeader>
            <CardTitle className="minecraft-text flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="minecraft-text text-sm text-gray-400">Email Address</Label>
                <div className="bg-gray-700/50 p-3 minecraft-border border-2 border-gray-600 rounded-none">
                  <p className="minecraft-text">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="minecraft-text text-sm text-gray-400">Account Status</Label>
                <div className="bg-gray-700/50 p-3 minecraft-border border-2 border-gray-600 rounded-none">
                  <Badge className="bg-green-600 text-white rounded-none minecraft-border">
                    {user.emailConfirmed ? "Verified" : "Pending Verification"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="minecraft-text text-sm text-gray-400">Rank</Label>
                <div className="bg-gray-700/50 p-3 minecraft-border border-2 border-gray-600 rounded-none">
                  <Badge className="bg-yellow-600 text-white rounded-none minecraft-border">{user.rank}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="minecraft-text text-sm text-gray-400">Member Since</Label>
                <div className="bg-gray-700/50 p-3 minecraft-border border-2 border-gray-600 rounded-none">
                  <p className="minecraft-text">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
