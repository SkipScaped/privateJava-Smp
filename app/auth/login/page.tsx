"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, AlertCircle, Loader2, Mail } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import SafeImage from "@/components/safe-image"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, user, resendConfirmation } = useAuth()

  const registered = searchParams.get("registered")
  const redirectPath = searchParams.get("redirect") || "/profile"

  useEffect(() => {
    if (user && user.emailConfirmed) {
      router.push(redirectPath)
    }
  }, [user, router, redirectPath])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setShowResendConfirmation(false)

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter both email and password")
      return
    }

    const success = await login(formData.email, formData.password)

    if (!success) {
      // Check if it's an email confirmation issue
      if (formData.email.trim()) {
        setShowResendConfirmation(true)
      }
    } else {
      router.push(redirectPath)
    }
  }

  const handleResendConfirmation = async () => {
    if (formData.email.trim()) {
      await resendConfirmation(formData.email.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-800 border-none minecraft-card rounded-none">
        <CardHeader className="items-center">
          <div className="w-16 h-16 mb-4 relative rounded-none overflow-hidden minecraft-border border-4 border-gray-700">
            <SafeImage src="/logo.png" alt="Private Java SMP Logo" width={64} height={64} fallbackText="Logo" />
          </div>
          <CardTitle className="text-2xl text-center minecraft-title">Login</CardTitle>
          <CardDescription className="text-center minecraft-text">
            {registered
              ? "Account created! Please confirm your email before logging in."
              : "Welcome back to Private Java SMP"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {registered && (
              <div className="bg-green-500/20 border-2 border-green-500 rounded-none p-3 flex items-start minecraft-border">
                <Mail className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm minecraft-text">
                  Registration successful! Please check your email and confirm your account before logging in.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-none p-3 flex items-start minecraft-border">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm minecraft-text">{error}</p>
              </div>
            )}

            {showResendConfirmation && (
              <div className="bg-blue-500/20 border-2 border-blue-500 rounded-none p-3 minecraft-border">
                <p className="text-sm minecraft-text mb-2">Haven't received the confirmation email?</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendConfirmation}
                  className="minecraft-button rounded-none bg-transparent"
                >
                  Resend Confirmation Email
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="minecraft-text">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-none minecraft-border minecraft-text"
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
                  className="bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 pr-10 rounded-none minecraft-border minecraft-text"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white minecraft-button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 minecraft-button rounded-none"
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
