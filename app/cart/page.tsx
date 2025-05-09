"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { Trash2, Plus, Minus, CreditCard, AlertCircle, ShoppingCart } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Discord invite link
const DISCORD_INVITE_URL = "https://discord.com/invite/Dku5n2nWB9"
// Default logo image
const DEFAULT_LOGO = "/logo.webp"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  const handleCheckout = () => {
    // Process the checkout
    setCheckoutComplete(true)
    clearCart()
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
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
            <p className="text-gray-300">Thank you for your purchase! Your VIP benefits will be activated soon.</p>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <p className="text-sm mb-2">
              Redirecting you to our Discord server in <span className="font-bold text-white">{countdown}</span>{" "}
              seconds...
            </p>
            <p className="text-xs text-gray-400">
              You'll need to join our Discord server to complete the setup process and receive your VIP benefits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={DISCORD_INVITE_URL} className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Join Discord Now</Button>
            </a>
            <Link href="/shop" className="w-full">
              <Button variant="outline" className="w-full">
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
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <ShoppingCart className="h-16 w-16 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="mb-6 text-gray-400">
            Looks like you haven't added any items to your cart yet. Check out our VIP packages!
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Browse Shop
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6">Your Cart</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Review your items and proceed to checkout to unlock your VIP benefits on our Minecraft server.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card
                key={item.id}
                className="bg-gray-800 border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg?height=96&width=96&text=Product"}
                        alt={item.name}
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="text-gray-400">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-8 text-center font-medium">{item.quantity}</span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right font-semibold w-20">${(item.price * item.quantity).toFixed(2)}</div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full"
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
          <Card className="bg-gray-800 border-gray-700 sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-gray-700 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Checkout via Discord
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Checkout via Discord</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="relative w-full h-48 mb-4 flex items-center justify-center">
                      <Image
                        src={DEFAULT_LOGO || "/placeholder.svg"}
                        alt="Discord Checkout"
                        width={120}
                        height={120}
                        className="rounded-md"
                      />
                    </div>

                    <div className="flex items-start gap-2 bg-yellow-500/20 border border-yellow-500 rounded-md p-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        After clicking "Complete Purchase", you'll be redirected to our Discord server to complete the
                        payment process and receive your VIP benefits.
                      </p>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCheckout}>
                      Complete Purchase (${getTotalPrice().toFixed(2)})
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full" onClick={clearCart}>
                Clear Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
