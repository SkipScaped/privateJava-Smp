"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase, testSupabaseConnection } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type User = {
  id: number
  authId: string
  email: string
  username: string
  bio?: string
  profilePicture?: string
  rank?: string
  isAdmin: boolean
  emailConfirmed: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  resendConfirmation: (email: string) => Promise<boolean>
  updateProfile: (data: { username?: string; bio?: string; profilePicture?: string }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Test Supabase connection on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Test connection first
        const connectionOk = await testSupabaseConnection()
        if (!connectionOk) {
          console.error("Supabase connection failed")
          toast({
            title: "Connection Error",
            description: "Unable to connect to the database. Please try again later.",
            variant: "destructive",
          })
        }

        // Get existing session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          await fetchUserProfile(session.user)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        toast({
          title: "Initialization Error",
          description: "Failed to initialize authentication. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [toast])

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase.from("users").select("*").eq("auth_id", supabaseUser.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return
      }

      if (!profile) {
        // Create profile if it doesn't exist
        const isAdmin = supabaseUser.email === "skipscape.dev@gmail.com"
        const { data: newProfile, error: insertError } = await supabase
          .from("users")
          .insert({
            auth_id: supabaseUser.id,
            email: supabaseUser.email!,
            username: supabaseUser.user_metadata?.username || supabaseUser.email!.split("@")[0],
            bio: isAdmin ? "Server Administrator" : "New member of the Private Java SMP!",
            rank: isAdmin ? "Admin" : "Member",
            is_admin: isAdmin,
            email_confirmed: supabaseUser.email_confirmed_at !== null,
          })
          .select()
          .single()

        if (insertError) {
          console.error("Error creating profile:", insertError)
          return
        }

        const userData: User = {
          id: newProfile.id,
          authId: supabaseUser.id,
          email: supabaseUser.email!,
          username: newProfile.username,
          bio: newProfile.bio,
          profilePicture: newProfile.profile_picture_url,
          rank: newProfile.rank,
          isAdmin: newProfile.is_admin,
          emailConfirmed: supabaseUser.email_confirmed_at !== null,
        }

        setUser(userData)
        return
      }

      const userData: User = {
        id: profile.id,
        authId: supabaseUser.id,
        email: supabaseUser.email!,
        username: profile.username,
        bio: profile.bio,
        profilePicture: profile.profile_picture_url,
        rank: profile.rank,
        isAdmin: profile.is_admin || false,
        emailConfirmed: supabaseUser.email_confirmed_at !== null,
      }

      setUser(userData)
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      if (!email.trim() || !password.trim()) {
        toast({
          title: "Login failed",
          description: "Please enter both email and password",
          variant: "destructive",
        })
        return false
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) {
        console.error("Login error:", error)
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Email not confirmed",
          description: "Please check your email and confirm your account before logging in.",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "default",
      })

      return true
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      if (!username.trim() || !email.trim() || !password.trim()) {
        toast({
          title: "Registration failed",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return false
      }

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("username")
        .eq("username", username.trim())
        .single()

      if (existingUser) {
        toast({
          title: "Registration failed",
          description: "Username already exists. Please choose a different one.",
          variant: "destructive",
        })
        return false
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            username: username.trim(),
          },
        },
      })

      if (error) {
        console.error("Signup error:", error)
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      if (data.user) {
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account before logging in.",
          variant: "default",
        })
      }

      return true
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "default",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const refreshUser = async () => {
    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()
      if (supabaseUser) {
        await fetchUserProfile(supabaseUser)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  const resendConfirmation = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Confirmation email sent",
        description: "Please check your email for the confirmation link.",
        variant: "default",
      })
      return true
    } catch (error) {
      console.error("Resend confirmation error:", error)
      return false
    }
  }

  const updateProfile = async (data: {
    username?: string
    bio?: string
    profilePicture?: string
  }): Promise<boolean> => {
    try {
      if (!user) return false

      // Check if username is taken by another user
      if (data.username && data.username !== user.username) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("username", data.username)
          .neq("id", user.id)
          .single()

        if (existingUser) {
          toast({
            title: "Username taken",
            description: "This username is already taken. Please choose a different one.",
            variant: "destructive",
          })
          return false
        }
      }

      // Update user profile in database
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (data.username !== undefined) updateData.username = data.username
      if (data.bio !== undefined) updateData.bio = data.bio
      if (data.profilePicture !== undefined) updateData.profile_picture_url = data.profilePicture

      const { error } = await supabase.from("users").update(updateData).eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Save Failed",
          description: "Failed to save profile. Please try again.",
          variant: "destructive",
        })
        return false
      }

      // Refresh user data
      await refreshUser()

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
        variant: "default",
      })

      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        resendConfirmation,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
