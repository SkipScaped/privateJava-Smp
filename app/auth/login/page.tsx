"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import SafeImage from "@/components/safe-image"
import Cookies from "js-cookie"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, user, refreshUser } = useAuth()

  useEffect(() => {
    const initPage = async () => {
      setMounted(true)

      // Force refresh auth state on page load
      await refreshUser()

      // Check if already logged in via cookie
      const authCookie = Cookies.get("minecraft_smp_auth")
      const userData = localStorage.getItem("minecraft_smp_user")

      console.log("Login page auth check:", {
        authCookie: !!authCookie,
        userData: !!userData,
        userState: !!user,
      })
    }

    initPage()
  }, [refreshUser])

  useEffect(() => {
    if (mounted && user) {
      const redirect = searchParams.get("redirect")
      const targetUrl = redirect || "/"

      console.log("User already logged in, redirecting to:", targetUrl)

      const timer = setTimeout(() => {
        router.push(targetUrl)
      }, 100)

      return () => clearTimeout(timer)
    }

    const registered = searchParams.get("registered")
    if (registered === "true") {
      setSuccess("Registration successful! Please log in.")
    }

    const redirect = searchParams.get("redirect")
    if (redirect) {
      setError(`You need to log in to access ${redirect}`)
    }
  }, [mounted, searchParams, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting || isLoading) return

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (!formData.username.trim() || !formData.password.trim()) {
        setError("Please enter both username and password")
        setIsSubmitting(false)
        return
      }

      console.log("Attempting login with:", formData.username)
      const loginSuccess = await login(formData.username, formData.password)

      if (loginSuccess) {
        const redirect = searchParams.get("redirect")
        const targetUrl = redirect || "/"

        console.log("Login successful, redirecting to:", targetUrl)

        // Set success message
        setSuccess("Login successful! Redirecting...")

        // Add a delay to ensure auth state is fully updated
        setTimeout(() => {
          router.push(targetUrl)
        }, 500)
      } else {
        setError("Login failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="loading-skeleton w-32 h-8 rounded"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md bg-gray-800 border-none minecraft-card rounded-none animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative rounded-none overflow-hidden minecraft-border border-4 border-gray-700">
            <SafeImage
              src="/logo.png"
              alt="Private Java SMP Logo"
              width={64}
              height={64}
              fallbackText="🎮"
              className="rounded-none"
            />
          </div>
          <CardTitle className="text-2xl text-white minecraft-title">Login</CardTitle>
          <CardDescription className="text-gray-300 minecraft-text">
            Sign in to your Private Java SMP account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="error-state rounded-none p-3 flex items-start minecraft-border">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200 minecraft-text">{error}</p>
              </div>
            )}

            {success && (
              <div className="success-state rounded-none p-3 flex items-start minecraft-border">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-200 minecraft-text">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-white minecraft-text">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="Your Minecraft username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 text-white focus:border-green-500 focus:ring-green-500 rounded-none minecraft-border minecraft-text"
                disabled={isSubmitting || isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white minecraft-text">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border-gray-600 text-white focus:border-green-500 focus:ring-green-500 pr-10 rounded-none minecraft-border minecraft-text"
                  disabled={isSubmitting || isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white minecraft-button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500 minecraft-border"
                disabled={isSubmitting || isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 minecraft-text">
                Remember me
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white minecraft-button rounded-none"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-center text-sm text-gray-300 minecraft-text">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-green-400 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
