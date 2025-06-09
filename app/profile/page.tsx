"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Calendar, Edit, Save, X, Upload, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import Cookies from "js-cookie"

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    bio: "I love building redstone contraptions and exploring new biomes! Welcome to our Private Java SMP server.",
    profilePicture: "",
  })
  const [savedData, setSavedData] = useState({
    bio: "I love building redstone contraptions and exploring new biomes! Welcome to our Private Java SMP server.",
    profilePicture: "",
  })

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setMounted(true)

      // Double-check auth status
      await refreshUser()

      // Check for auth cookie directly
      const authCookie = Cookies.get("minecraft_smp_auth")
      const userData = localStorage.getItem("minecraft_smp_user")

      console.log("Profile page auth check:", {
        authCookie: !!authCookie,
        userData: !!userData,
        userState: !!user,
      })

      if (!authCookie || !userData) {
        setAuthError("Your session has expired. Please log in again.")
        setRedirecting(true)

        // Delay redirect to show error message
        setTimeout(() => {
          router.push("/auth/login?redirect=/profile")
        }, 2000)
      } else {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [refreshUser, router])

  // Load profile data once authenticated
  useEffect(() => {
    if (user && mounted && authChecked) {
      const savedProfileKey = `profile_${user.username}`

      try {
        const savedProfileData = localStorage.getItem(savedProfileKey)

        if (savedProfileData) {
          const parsedData = JSON.parse(savedProfileData)
          setEditData(parsedData)
          setSavedData(parsedData)
        } else {
          const initialData = {
            bio: "I love building redstone contraptions and exploring new biomes! Welcome to our Private Java SMP server.",
            profilePicture: user.profilePicture || "",
          }
          setEditData(initialData)
          setSavedData(initialData)
        }
      } catch (error) {
        console.error("Error loading profile data:", error)
        const fallbackData = {
          bio: "I love building redstone contraptions and exploring new biomes! Welcome to our Private Java SMP server.",
          profilePicture: user.profilePicture || "",
        }
        setEditData(fallbackData)
        setSavedData(fallbackData)
      }
    }
  }, [user, mounted, authChecked])

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (mounted && !isLoading && !user && !redirecting) {
      console.log("No user found after loading complete, redirecting to login")
      setRedirecting(true)
      const timer = setTimeout(() => {
        router.push("/auth/login?redirect=/profile")
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [mounted, isLoading, user, router, redirecting])

  const handleSave = async () => {
    if (isSaving) return

    setIsSaving(true)

    try {
      // Simulate save delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSavedData({
        bio: editData.bio,
        profilePicture: editData.profilePicture,
      })

      if (user) {
        const savedProfileKey = `profile_${user.username}`
        localStorage.setItem(
          savedProfileKey,
          JSON.stringify({
            bio: editData.bio,
            profilePicture: editData.profilePicture,
          }),
        )
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
        variant: "default",
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      bio: savedData.bio,
      profilePicture: savedData.profilePicture,
    })
    setIsEditing(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

      const reader = new FileReader()
      reader.onloadend = () => {
        setEditData({ ...editData, profilePicture: reader.result as string })
      }
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to read the image file.",
          variant: "destructive",
        })
      }
      reader.readAsDataURL(file)
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

  // Auth error state
  if (authError) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center max-w-md w-full bg-gray-800 p-6 rounded-none minecraft-card">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 minecraft-text">Authentication Error</h2>
          <p className="text-center minecraft-text mb-4">{authError}</p>
          <p className="text-center text-gray-400 minecraft-text mb-6">Redirecting to login page...</p>
          <div className="w-full bg-gray-700 h-2">
            <div className="bg-red-500 h-2 animate-pulse-green" style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Redirecting state
  if (redirecting || (!user && mounted && !isLoading)) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
          <p className="text-lg minecraft-text">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // No user state
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-4xl font-bold text-center mb-8 sm:mb-12 minecraft-title">Your Profile</h1>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-none minecraft-card animate-fade-in">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="relative w-32 h-32 rounded-none overflow-hidden minecraft-border border-4 border-gray-700">
                  {isEditing && editData.profilePicture ? (
                    <Image
                      src={editData.profilePicture || "/placeholder.svg?height=128&width=128"}
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                      onError={() => {
                        setEditData({ ...editData, profilePicture: "" })
                      }}
                    />
                  ) : savedData.profilePicture ? (
                    <Image
                      src={savedData.profilePicture || "/placeholder.svg?height=128&width=128"}
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                      onError={() => {
                        setSavedData({ ...savedData, profilePicture: "" })
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white font-bold text-2xl">
                      {user.username?.substring(0, 2).toUpperCase() || "U"}
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
                        disabled={isSaving}
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
                      disabled={isSaving}
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
                      className="minecraft-button rounded-none"
                      disabled={isSaving}
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
                    {savedData.bio}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-1 minecraft-text">{editData.bio.length}/500 characters</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
