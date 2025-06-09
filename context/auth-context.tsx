"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

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

// Cookie name for authentication
const AUTH_COOKIE_NAME = "minecraft_smp_auth"
// Local storage key for user data
const USER_STORAGE_KEY = "minecraft_smp_user"
// Cookie expiration in days
const COOKIE_EXPIRATION = 7

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check for existing session on mount - using both cookies and localStorage
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Wait for client-side hydration
        await new Promise((resolve) => setTimeout(resolve, 100))

        // First check for auth cookie
        const authCookie = Cookies.get(AUTH_COOKIE_NAME)
        console.log("Auth cookie check:", !!authCookie)

        if (authCookie) {
          // If cookie exists, try to get user data from localStorage
          const savedUser = localStorage.getItem(USER_STORAGE_KEY)

          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              if (userData && userData.username && userData.id) {
                console.log("Auth restored from cookie and localStorage")
                setUser(userData)
              } else {
                // Invalid user data but valid cookie - clear both
                console.log("Invalid user data in localStorage, clearing auth")
                Cookies.remove(AUTH_COOKIE_NAME)
                localStorage.removeItem(USER_STORAGE_KEY)
              }
            } catch (e) {
              // Invalid JSON in localStorage - clear both
              console.error("Invalid user data format in localStorage:", e)
              Cookies.remove(AUTH_COOKIE_NAME)
              localStorage.removeItem(USER_STORAGE_KEY)
            }
          } else {
            // Cookie exists but no localStorage data - clear cookie
            console.log("Auth cookie exists but no localStorage data, clearing cookie")
            Cookies.remove(AUTH_COOKIE_NAME)
          }
        } else {
          // No auth cookie - clear localStorage as well for consistency
          console.log("No auth cookie found, clearing localStorage")
          localStorage.removeItem(USER_STORAGE_KEY)
        }
      } catch (error) {
        console.error("Error checking session:", error)
        // Clear potentially corrupted data
        try {
          Cookies.remove(AUTH_COOKIE_NAME)
          localStorage.removeItem(USER_STORAGE_KEY)
        } catch (e) {
          console.error("Error removing auth data:", e)
        }
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    checkSession()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Validation
      if (!username?.trim() || !password?.trim()) {
        toast({
          title: "Login failed",
          description: "Please enter both username and password",
          variant: "destructive",
        })
        return false
      }

      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create user data - accept ANY username/password for demo purposes
      const userData = {
        id: Date.now(),
        username: username.trim(),
        email: `${username.trim().toLowerCase()}@minecraft-smp.com`,
        profilePicture: undefined,
      }

      // Save to both localStorage and cookies for better persistence
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
        console.log("User data saved to localStorage")
      } catch (e) {
        console.error("Failed to save to localStorage:", e)
      }

      try {
        Cookies.set(AUTH_COOKIE_NAME, "authenticated", {
          expires: COOKIE_EXPIRATION,
          path: "/",
          sameSite: "lax",
        })
        console.log("Auth cookie set")
      } catch (e) {
        console.error("Failed to set cookie:", e)
      }

      // Update state
      setUser(userData)

      console.log("Login successful, auth data saved")

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

      // Validation
      if (!username?.trim() || !email?.trim() || !password?.trim()) {
        toast({
          title: "Registration failed",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return false
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        toast({
          title: "Registration failed",
          description: "Please enter a valid email address",
          variant: "destructive",
        })
        return false
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

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

  const logout = () => {
    try {
      // Clear user state
      setUser(null)

      // Clear both localStorage and cookies
      try {
        localStorage.removeItem(USER_STORAGE_KEY)
        console.log("Cleared localStorage")
      } catch (e) {
        console.error("Failed to clear localStorage:", e)
      }

      try {
        Cookies.remove(AUTH_COOKIE_NAME, { path: "/" })
        console.log("Cleared auth cookie")
      } catch (e) {
        console.error("Failed to clear cookie:", e)
      }

      // Clear any profile data
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("profile_")) {
            localStorage.removeItem(key)
          }
        })
      } catch (e) {
        console.error("Failed to clear profile data:", e)
      }

      console.log("Logout successful, auth data cleared")

      router.push("/")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "default",
      })
    } catch (error) {
      console.error("Logout error:", error)

      // Force clear in case of error
      try {
        localStorage.removeItem(USER_STORAGE_KEY)
        Cookies.remove(AUTH_COOKIE_NAME, { path: "/" })
      } catch (e) {
        console.error("Error force clearing auth data:", e)
      }
    }
  }

  const refreshUser = async () => {
    try {
      // Check for auth cookie first
      const authCookie = Cookies.get(AUTH_COOKIE_NAME)
      console.log("refreshUser - auth cookie check:", !!authCookie)

      if (!authCookie) {
        // No auth cookie, clear user state and localStorage
        setUser(null)
        localStorage.removeItem(USER_STORAGE_KEY)
        return
      }

      // Auth cookie exists, try to get user data from localStorage
      const savedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          if (userData && userData.username && userData.id) {
            setUser(userData)
          } else {
            // Invalid user data but valid cookie - clear both
            setUser(null)
            Cookies.remove(AUTH_COOKIE_NAME)
            localStorage.removeItem(USER_STORAGE_KEY)
          }
        } catch (e) {
          // Invalid JSON in localStorage - clear both
          console.error("Invalid user data format in localStorage:", e)
          setUser(null)
          Cookies.remove(AUTH_COOKIE_NAME)
          localStorage.removeItem(USER_STORAGE_KEY)
        }
      } else {
        // Cookie exists but no localStorage data - clear cookie
        setUser(null)
        Cookies.remove(AUTH_COOKIE_NAME)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
      try {
        Cookies.remove(AUTH_COOKIE_NAME)
        localStorage.removeItem(USER_STORAGE_KEY)
      } catch (e) {
        console.error("Error clearing auth data:", e)
      }
    }
  }

  // Don't render children until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loading-skeleton w-32 h-8 rounded"></div>
      </div>
    )
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
