"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  username: string
  email: string
  rank?: string
  avatar_url?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
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

  useEffect(() => {
    const checkSession = () => {
      try {
        const savedUser = localStorage.getItem("minecraft_smp_user")
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          if (userData && userData.id) {
            setUser(userData)
          } else {
            localStorage.removeItem("minecraft_smp_user")
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
        localStorage.removeItem("minecraft_smp_user")
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

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

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Login failed",
          description: data.error || "Invalid email or password",
          variant: "destructive",
        })
        return false
      }

      const userData = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        rank: data.user.rank,
        avatar_url: data.user.avatar_url,
      }

      localStorage.setItem("minecraft_smp_user", JSON.stringify(userData))
      setUser(userData)

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      })

      return true
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
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

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Registration failed",
          description: data.error || "An error occurred",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      })
      return true
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Registration error",
        description: "An unexpected error occurred",
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
