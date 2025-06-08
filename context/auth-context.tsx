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

  // Check for existing session on mount - ONLY localStorage
  useEffect(() => {
    const checkSession = () => {
      try {
        const savedUser = localStorage.getItem("minecraft_smp_user")
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error("Error checking session:", error)
        localStorage.removeItem("minecraft_smp_user")
      } finally {
        setIsLoading(false)
      }
    }

    // Small delay to ensure localStorage is available
    setTimeout(checkSession, 100)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simple validation
      if (!username.trim() || !password.trim()) {
        toast({
          title: "Login failed",
          description: "Please enter both username and password",
          variant: "destructive",
        })
        return false
      }

      // Create user data - accept ANY username/password
      const userData = {
        id: Date.now(),
        username: username.trim(),
        email: `${username.trim()}@minecraft-smp.com`,
        profilePicture: undefined,
      }

      // Save to localStorage
      localStorage.setItem("minecraft_smp_user", JSON.stringify(userData))
      setUser(userData)

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

      if (!username.trim() || !email.trim() || !password.trim()) {
        toast({
          title: "Registration failed",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return false
      }

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
    }
  }

  const refreshUser = async () => {
    try {
      const savedUser = localStorage.getItem("minecraft_smp_user")
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
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
