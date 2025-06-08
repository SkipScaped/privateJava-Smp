"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/context/cart-context"
import { Trash2, Plus, Minus, CreditCard, AlertCircle, ShoppingCart, LogIn, User, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

// Discord invite link
const DISCORD_INVITE_URL = "https://discord.gg/fvmA4jph"
// Default logo image
const DEFAULT_LOGO = "/logo.png"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [mounted, setMounted] = useState(false)
  const [showUsernameVerification, setShowUsernameVerification] = useState(false)
  const [minecraftUsername, setMinecraftUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleUsernameVerification = () => {
    setIsVerifying(true)
    setUsernameError("")

    // Simulate verification delay
    setTimeout(() => {
      if (!minecraftUsername.trim()) {
        setUsernameError("Please enter your Minecraft username")
        setIsVerifying(false)
        return
      }

      // Check if the entered username matches the logged-in user's username
      if (minecraftUsername.trim().toLowerCase() !== user?.username?.toLowerCase()) {
        setUsernameError("Incorrect")
        setIsVerifying(false)
        return
      }

      // Username matches - proceed with checkout
      setIsVerifying(false)
      setShowUsernameVerification(false)
      handleCheckout()
    }, 1500)
  }

  const handleCheckout = () => {
    // Process the checkout
    setCheckoutComplete(true)
    clearCart()
  }

  const initiateCheckout = () => {
    setShowUsernameVerification(true)
    setMinecraftUsername("")
    setUsernameError("")
  }

  useEffect(() => {
    if (checkoutComplete) {
      setIsRedirecting(true)

      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // Redirect to Discord
            window.location.href = DISCORD_INVITE_URL
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [checkoutComplete])

  if (checkoutComplete) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="bg-green-500/20 border-4 border-green-800 rounded-none p-8 max-w-md w-full text-center minecraft-card">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-700 rounded-none flex items-center justify-center mx-auto mb-4 minecraft-border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 minecraft-title">Purchase Successful!</h2>
            <p className="text-gray-300 minecraft-text">
              Thank you for your purchase! Your VIP benefits will be activated soon.
            </p>
          </div>

          <div className="bg-gray-700 p-4 rounded-none mb-6 minecraft-border">
            <p className="text-sm mb-2 minecraft-text">
              Redirecting you to our Discord server in <span className="font-bold text-white">{countdown}</span>{" "}
              seconds...
            </p>
            <p className="text-xs text-gray-400 minecraft-text">
              You'll need to join our Discord server to complete the setup process and receive your VIP benefits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={DISCORD_INVITE_URL} className="w-full">
              <Button className="w-full bg-indigo-700 hover:bg-indigo-800 minecraft-button rounded-none">
                Join Discord Now
              </Button>
            </a>
            <Link href="/shop" className="w-full">
              <Button variant="outline" className="w-full minecraft-button rounded-none">
                Return to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="bg-gray-800 rounded-none p-8 max-w-md w-full text-center minecraft-card">
          <div className="flex justify-center mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4 minecraft-title">Your Cart is Empty</h2>
          <p className="mb-6 text-gray-400 minecraft-text">
            Looks like you haven't added any items to your cart yet. Check out our VIP packages!
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-green-700 hover:bg-green-800 minecraft-button rounded-none">
              Browse Shop
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6 minecraft-title">Your Cart</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto minecraft-text">
        Review your items and proceed to checkout to unlock your VIP benefits on our Minecraft server.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card
                key={item.id}
                className="bg-gray-800 border-none minecraft-card overflow-hidden hover:border-gray-600 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0 minecraft-border rounded-none">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-xl font-semibold minecraft-text">{item.name}</h3>
                      <p className="text-gray-400 minecraft-text">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-none minecraft-button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-8 text-center font-medium minecraft-text">{item.quantity}</span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-none minecraft-button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right font-semibold w-20 minecraft-text">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-none minecraft-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="bg-gray-800 border-none minecraft-card sticky top-24">
            <CardHeader>
              <CardTitle className="minecraft-text">Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between minecraft-text">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t-2 border-gray-700 pt-4 flex justify-between font-bold text-lg minecraft-text">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {mounted && !user ? (
                <div className="w-full space-y-4">
                  <div className="flex items-start gap-2 bg-blue-500/20 border-2 border-blue-500 rounded-none p-3 minecraft-border">
                    <LogIn className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm minecraft-text">
                      Please log in to complete your purchase and receive your VIP benefits.
                    </p>
                  </div>
                  <Link href="/auth/login?redirect=/cart" className="w-full">
                    <Button className="w-full bg-blue-700 hover:bg-blue-800 minecraft-button rounded-none">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login to Checkout
                    </Button>
                  </Link>
                </div>
              ) : (
                <Dialog open={showUsernameVerification} onOpenChange={setShowUsernameVerification}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-green-700 hover:bg-green-800 minecraft-button rounded-none"
                      onClick={initiateCheckout}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Checkout via Discord
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-white border-none minecraft-card rounded-none max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold minecraft-text flex items-center gap-2">
                        <Shield className="h-6 w-6 text-yellow-500" />
                        Verify Minecraft Username
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start gap-2 bg-yellow-500/20 border-2 border-yellow-500 rounded-none p-3 minecraft-border">
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm minecraft-text">
                          Please confirm your Minecraft username to proceed with the purchase. This ensures VIP benefits
                          are applied to the correct account.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minecraft-username" className="minecraft-text">
                          <User className="inline h-4 w-4 mr-1" />
                          Your Minecraft Username
                        </Label>
                        <Input
                          id="minecraft-username"
                          type="text"
                          placeholder="Enter your Minecraft username"
                          value={minecraftUsername}
                          onChange={(e) => {
                            setMinecraftUsername(e.target.value)
                            setUsernameError("")
                          }}
                          className="bg-gray-700 border-gray-600 text-white rounded-none minecraft-border"
                          disabled={isVerifying}
                        />
                        {usernameError && <p className="text-red-400 text-sm minecraft-text">{usernameError}</p>}
                      </div>

                      <div className="bg-gray-700 p-3 rounded-none minecraft-border">
                        <p className="text-xs text-gray-400 minecraft-text">
                          <strong>Account:</strong> {user?.username}
                        </p>
                        <p className="text-xs text-gray-400 minecraft-text mt-1">
                          Enter the same username to verify your identity.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-700 hover:bg-green-800 minecraft-button rounded-none"
                          onClick={handleUsernameVerification}
                          disabled={isVerifying || !minecraftUsername.trim()}
                        >
                          {isVerifying ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Verify & Checkout
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="minecraft-button rounded-none"
                          onClick={() => setShowUsernameVerification(false)}
                          disabled={isVerifying}
                        >
                          Cancel
                        </Button>
                      </div>

                      <p className="text-xs text-center text-gray-400 minecraft-text">
                        Total: ${getTotalPrice().toFixed(2)}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Button variant="outline" className="w-full minecraft-button rounded-none" onClick={clearCart}>
                Clear Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
