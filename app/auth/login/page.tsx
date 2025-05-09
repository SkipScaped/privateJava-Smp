"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import DiscordLoginButton from "@/components/discord-login-button"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, user } = useAuth()

  // Define a fallback logo image
  const logoImage = "/logo.webp"

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      router.push("/profile")
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
  }, [searchParams, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.username || !formData.password) {
      setError("Please enter both username and password")
      return
    }

    const success = await login(formData.username, formData.password)

    if (success) {
      // Check if there's a redirect URL
      const redirect = searchParams.get("redirect")
      if (redirect) {
        router.push(redirect)
      } else {
        router.push("/profile")
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="items-center">
          <div className="w-16 h-16 mb-4 relative">
            {logoImage && (
              <Image src={logoImage || "/placeholder.svg"} alt="Private Java SMP Logo" width={64} height={64} />
            )}
          </div>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">Sign in to your Private Java SMP account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500 rounded-md p-3 flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Your Minecraft username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 pr-10"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="#" className="text-green-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <div className="relative w-full flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative bg-gray-800 px-4 text-sm text-gray-400">or</div>
            </div>

            <DiscordLoginButton redirectPath={searchParams.get("redirect") || "/profile"} />

            <div className="text-center text-sm">
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
