"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SafeImage from "@/components/safe-image"
import { Save, User, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

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

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProfile(editedProfile)
      setIsEditing(false)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      })
    } catch (err) {
      console.error("Error updating profile:", err)
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
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700">
                      <SafeImage
                        src={isEditing ? editedProfile.profilePicture : profile.profilePicture}
                        alt="Profile Picture"
                        fill
                        className="object-cover"
                        fallbackText={profile.username?.substring(0, 2).toUpperCase() || "U"}
                      />
                    </div>
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
        </Tabs>
      </div>
    </div>
  )
}
