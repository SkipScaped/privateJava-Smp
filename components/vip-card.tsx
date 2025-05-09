"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ShoppingCart, Check } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useCart, type VipProduct } from "@/context/cart-context"

interface VipCardProps {
  product: VipProduct
  benefits: string[]
}

export default function VipCard({ product, benefits }: VipCardProps) {
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
    setAddedToCart(true)

    // Reset the "Added to cart" status after 2 seconds
    setTimeout(() => {
      setAddedToCart(false)
    }, 2000)
  }

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-2xl">{product.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <div className="relative w-full h-48 mb-4">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover rounded-md"
          />
        </div>

        <div className="text-3xl font-bold text-center mb-4">${product.price}</div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              View Benefits
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{product.name} Benefits</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={handleAddToCart} disabled={addedToCart}>
          {addedToCart ? (
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
  )
}
