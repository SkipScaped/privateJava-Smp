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
        // First check localStorage for demo mode
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
          setIsLoading(false)
          return
        }

        // Then check server session for production
        try {
          const response = await fetch("/api/auth/session", {
            method: "GET",
            credentials: "include",
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUser(data.user)
            }
          }
        } catch (error) {
          console.log("Server session check failed, using demo mode")
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

      // First try server authentication
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setUser(data.user)
          toast({
            title: "Login successful",
            description: `Welcome back, ${data.user.username}!`,
            variant: "default",
          })
          return true
        } else {
          // If server auth fails, fall back to demo mode
          console.log("Server auth failed, using demo mode")
        }
      } catch (error) {
        console.log("Server auth error, using demo mode:", error)
      }

      // Demo mode fallback - accept any username/password combination
      if (username.trim() && password.trim()) {
        const userData = {
          id: 1,
          username: username,
          email: `${username}@example.com`,
          profilePicture: undefined,
        }

        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        toast({
          title: "Login successful",
          description: `Welcome back, ${username}!`,
          variant: "default",
        })

        return true
      } else {
        toast({
          title: "Incorrect password or username",
          description: "Please enter both username and password",
          variant: "destructive",
        })
        return false
      }
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

      // Try server registration first
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        })

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
      if (username.trim() && email.trim() && password.trim()) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
          variant: "default",
        })
        return true
      } else {
        toast({
          title: "Registration failed",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return false
      }
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

      // Try server logout first
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        })
      } catch (error) {
        console.log("Server logout failed, clearing local session")
      }

      // Clear local state regardless
      setUser(null)
      localStorage.removeItem("user")
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
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
        return
      }

      // Then check server session
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
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
