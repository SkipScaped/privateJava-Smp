"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: number
  username: string
  email: string
  rank?: string
  profilePicture?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Changed to false by default to avoid loading state issues
  const router = useRouter()
  const { toast } = useToast()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/auth/session")
        const data = await response.json()

        if (data.success && data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simplified login - just set a mock user for testing
      setUser({
        id: 1,
        username: username,
        email: `${username}@example.com`,
        rank: "Member",
        profilePicture: `/placeholder.svg?height=200&width=200&text=${username.substring(0, 2).toUpperCase()}`,
      })

      toast({
        title: "Login successful",
        description: `Welcome back, ${username}!`,
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

      // Simplified signup - just return success
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
        variant: "default",
      })

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
      setIsLoading(true)
      setUser(null)
      router.push("/")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "default",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      // Just return the current user - simplified
      setIsLoading(false)
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
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
