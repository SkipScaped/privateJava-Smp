"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import SafeImage from "@/components/safe-image"

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (!token_hash || type !== "email") {
          setStatus("error")
          setMessage("Invalid confirmation link")
          return
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        })

        if (error) {
          console.error("Confirmation error:", error)
          setStatus("error")
          setMessage(error.message)
        } else {
          setStatus("success")
          setMessage("Email confirmed successfully! You can now log in.")
        }
      } catch (error) {
        console.error("Confirmation error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred")
      }
    }

    confirmEmail()
  }, [searchParams])

  const handleContinue = () => {
    if (status === "success") {
      router.push("/auth/login")
    } else {
      router.push("/auth/signup")
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-800 border-none minecraft-card rounded-none">
        <CardHeader className="items-center">
          <div className="w-16 h-16 mb-4 relative rounded-none overflow-hidden minecraft-border border-4 border-gray-700">
            <SafeImage src="/logo.png" alt="Private Java SMP Logo" width={64} height={64} fallbackText="Logo" />
          </div>
          <CardTitle className="text-2xl text-center minecraft-title">Email Confirmation</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
              <p className="minecraft-text">Confirming your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="minecraft-text text-green-400 mb-4">{message}</p>
              <Button
                onClick={handleContinue}
                className="bg-green-600 hover:bg-green-700 minecraft-button rounded-none"
              >
                Continue to Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="minecraft-text text-red-400 mb-4">{message}</p>
              <Button
                onClick={handleContinue}
                variant="outline"
                className="minecraft-button rounded-none bg-transparent"
              >
                Back to Sign Up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
