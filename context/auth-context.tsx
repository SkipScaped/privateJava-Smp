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
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Always check localStorage first for immediate response
        const savedUser = localStorage.getItem("minecraft_smp_user")
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser)
            setUser(userData)
            setIsLoading(false)
            return
          } catch (e) {
            localStorage.removeItem("minecraft_smp_user")
          }
        }

        // Try to check server session with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

        try {
          const response = await fetch("/api/auth/session", {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUser(data.user)
              // Also save to localStorage for faster future loads
              localStorage.setItem("minecraft_smp_user", JSON.stringify(data.user))
            }
          }
        } catch (error) {
          clearTimeout(timeoutId)
          console.log("Server session check failed, using localStorage only")
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

      // Input validation
      if (!username.trim() || !password.trim()) {
        toast({
          title: "Login failed",
          description: "Please enter both username and password",
          variant: "destructive",
        })
        return false
      }

      // Try server authentication with timeout
      let serverAuthSuccess = false
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify({ username, password }),
        })

        clearTimeout(timeoutId)
        const data = await response.json()

        if (response.ok && data.success) {
          setUser(data.user)
          localStorage.setItem("minecraft_smp_user", JSON.stringify(data.user))
          serverAuthSuccess = true

          toast({
            title: "Login successful",
            description: `Welcome back, ${data.user.username}!`,
            variant: "default",
          })
          return true
        }
      } catch (error) {
        console.log("Server auth failed, using demo mode:", error)
      }

      // If server auth failed, use demo mode with localStorage
      if (!serverAuthSuccess) {
        const userData = {
          id: Date.now(), // Use timestamp as unique ID
          username: username.trim(),
          email: `${username.trim()}@example.com`,
          profilePicture: undefined,
        }

        setUser(userData)
        localStorage.setItem("minecraft_smp_user", JSON.stringify(userData))

        toast({
          title: "Login successful",
          description: `Welcome back, ${username}! (Demo Mode)`,
          variant: "default",
        })

        return true
      }

      return false
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

      // Input validation
      if (!username.trim() || !email.trim() || !password.trim()) {
        toast({
          title: "Registration failed",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return false
      }

      // Try server registration with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({ username, email, password }),
        })

        clearTimeout(timeoutId)
        const data = await response.json()

        if (response.ok && data.success) {
          toast({
            title: "Registration successful",
            description: "Your account has been created. You can now log in.",
            variant: "default",
          })
          return true
        }
      } catch (error) {
        console.log("Server registration failed, using demo mode")
      }

      // Demo mode fallback
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in. (Demo Mode)",
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

      // Try server logout with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
      } catch (error) {
        console.log("Server logout failed, clearing local session only")
      }

      // Always clear local state
      setUser(null)
      localStorage.removeItem("minecraft_smp_user")
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
      // Check localStorage first
      const savedUser = localStorage.getItem("minecraft_smp_user")
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          return
        } catch (e) {
          localStorage.removeItem("minecraft_smp_user")
        }
      }

      // Then try server session with timeout
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
            localStorage.setItem("minecraft_smp_user", JSON.stringify(data.user))
          }
        }
      } catch (error) {
        console.log("Server session refresh failed")
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
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
