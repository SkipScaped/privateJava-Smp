"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCart, type VipProduct } from "@/context/cart-context"
import { ShoppingCart, Check, Star, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import SafeImage from "@/components/safe-image"
import { supabase } from "@/lib/supabase"

export default function ShopPage() {
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({})
  const [vipProducts, setVipProducts] = useState<VipProduct[]>([])
  const [vipBenefits, setVipBenefits] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVipData()
  }, [])

  const fetchVipData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch VIP packages
      const { data: packages, error: packagesError } = await supabase
        .from("vip_packages")
        .select("*")
        .order("price", { ascending: true })

      if (packagesError) {
        console.error("Error fetching VIP packages:", packagesError)
        setError("Failed to load VIP packages")
        return
      }

      // Fetch VIP benefits
      const { data: benefits, error: benefitsError } = await supabase
        .from("vip_benefits")
        .select("*")
        .order("id", { ascending: true })

      if (benefitsError) {
        console.error("Error fetching VIP benefits:", benefitsError)
        setError("Failed to load VIP benefits")
        return
      }

      // Transform packages data
      const transformedPackages: VipProduct[] = packages.map((pkg) => ({
        id: pkg.id.toString(),
        name: pkg.name,
        price: Number.parseFloat(pkg.price),
        image: pkg.image_url || "/placeholder.svg",
        tier: pkg.tier as "bronze" | "silver" | "gold",
      }))

      // Group benefits by package ID
      const benefitsMap: Record<string, string[]> = {}
      benefits.forEach((benefit) => {
        const packageId = benefit.package_id.toString()
        if (!benefitsMap[packageId]) {
          benefitsMap[packageId] = []
        }
        benefitsMap[packageId].push(benefit.description)
      })

      setVipProducts(transformedPackages)
      setVipBenefits(benefitsMap)
    } catch (err) {
      console.error("Error fetching VIP data:", err)
      setError("Failed to load VIP data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: VipProduct) => {
    addToCart(product)
    setAddedToCart({ ...addedToCart, [product.id]: true })

    // Reset the "Added to cart" status after 2 seconds
    setTimeout(() => {
      setAddedToCart({ ...addedToCart, [product.id]: false })
    }, 2000)
  }

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "bg-amber-600 hover:bg-amber-700"
      case "silver":
        return "bg-gray-400 hover:bg-gray-500"
      case "gold":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
          <p className="text-lg minecraft-text">Loading VIP packages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-500/20 border-2 border-red-500 rounded-none p-8 max-w-md mx-auto minecraft-border">
          <p className="text-red-400 minecraft-text mb-4">{error}</p>
          <Button onClick={fetchVipData} className="bg-red-600 hover:bg-red-700 minecraft-button rounded-none">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-6 minecraft-title">VIP Packages</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto minecraft-text">
        Enhance your Minecraft experience with our VIP packages. Unlock exclusive perks, discounts, and features!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {vipProducts.map((product) => (
          <Card
            key={product.id}
            className={`bg-gray-800 border-none minecraft-card overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${
              product.tier === "gold" ? "ring-4 ring-yellow-500" : ""
            }`}
          >
            <div className="relative">
              {product.tier === "gold" && (
                <div className="absolute top-0 right-0 z-10 m-2">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1 minecraft-border rounded-none">
                    <Star className="h-3 w-3 fill-current" /> Most Popular
                  </Badge>
                </div>
              )}
              <div className="relative w-40 h-40 mx-auto mt-6 rounded-none overflow-hidden minecraft-border border-4 border-gray-700">
                <SafeImage
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  fallbackText={product.name}
                />
              </div>
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-center text-2xl minecraft-text">{product.name}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center">
              <div className="text-3xl font-bold text-center mb-4 minecraft-text">${product.price}</div>

              <Badge className={`mb-4 ${getBadgeColor(product.tier)} minecraft-border rounded-none`}>
                {product.tier.charAt(0).toUpperCase() + product.tier.slice(1)} Tier
              </Badge>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mb-4 minecraft-button rounded-none bg-transparent">
                    View Benefits
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-white border-none minecraft-card rounded-none">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold minecraft-text flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-none overflow-hidden minecraft-border">
                        <SafeImage
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          fallbackText={product.name}
                        />
                      </div>
                      {product.name} Benefits
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <ul className="space-y-3">
                      {(vipBenefits[product.id] || []).map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="minecraft-text text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>

            <CardFooter>
              <Button
                className={`w-full minecraft-button rounded-none ${
                  product.tier === "bronze"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : product.tier === "silver"
                      ? "bg-gray-400 hover:bg-gray-500 text-gray-900"
                      : "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                }`}
                onClick={() => handleAddToCart(product)}
                disabled={addedToCart[product.id]}
              >
                {addedToCart[product.id] ? (
                  "Added to Cart!"
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-gray-800 rounded-none p-8 max-w-3xl mx-auto minecraft-card">
        <h2 className="text-2xl font-bold mb-4 text-center minecraft-text">Why Choose VIP?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-none flex items-center justify-center mb-4 minecraft-border">
              <Star className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2 minecraft-text">Exclusive Access</h3>
            <p className="text-gray-400 text-sm minecraft-text">
              Get access to exclusive areas, kits, and features unavailable to regular players.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-none flex items-center justify-center mb-4 minecraft-border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2 minecraft-text">Store Discounts</h3>
            <p className="text-gray-400 text-sm minecraft-text">
              Enjoy discounts on all store purchases, saving you money on in-game items.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-none flex items-center justify-center mb-4 minecraft-border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2 minecraft-text">Community Status</h3>
            <p className="text-gray-400 text-sm minecraft-text">
              Stand out with special chat emblems and recognition in our community.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
