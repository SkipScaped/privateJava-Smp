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

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Check if user is already logged in
    if (mounted && user) {
      const redirect = searchParams.get("redirect")
      router.push(redirect || "/profile")
      return
    }

    // Check if user just registered
    const registered = searchParams.get("registered")
    if (registered === "true") {
      setSuccess("Registration successful! Please log in.")
    }

    // Check if there's a redirect URL
    const redirect = searchParams.get("redirect")
    if (redirect) {
      setError(`You need to log in to access ${redirect}`)
    }
  }, [mounted, searchParams, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.username || !formData.password) {
      setError("Please enter both username and password")
      return
    }

    const loginSuccess = await login(formData.username, formData.password)

    if (!loginSuccess) {
      setError("Incorrect password or username")
    }

    if (loginSuccess) {
      // Check if there's a redirect URL
      const redirect = searchParams.get("redirect")
      router.push(redirect || "/profile")
    }
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-none minecraft-card">
        <CardHeader className="items-center">
          <div className="w-16 h-16 mb-4 relative rounded-none overflow-hidden minecraft-border border-4 border-gray-700">
            <SafeImage src="/logo.png" alt="Private Java SMP Logo" width={64} height={64} fallbackText="Logo" />
          </div>
          <CardTitle className="text-2xl text-center minecraft-title">Login</CardTitle>
          <CardDescription className="text-center minecraft-text">
            Sign in to your Private Java SMP account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-none p-3 flex items-start minecraft-border">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm minecraft-text">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border-2 border-green-500 rounded-none p-3 flex items-start minecraft-border">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm minecraft-text">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="minecraft-text">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="Your Minecraft username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-none minecraft-border"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="minecraft-text">
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
                  className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 pr-10 rounded-none minecraft-border"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
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
                className="h-4 w-4 rounded-none border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500 minecraft-border"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 minecraft-text">
                Remember me
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 minecraft-button rounded-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-center text-sm minecraft-text">
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
