import { NextResponse } from "next/server"
import { vipTiers } from "@/lib/data"

export async function GET() {
  try {
    // In a real app, this would fetch products from a database
    return NextResponse.json({ success: true, data: vipTiers })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, productId, quantity = 1 } = body

    // Validate input
    if (!userId || !productId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Find the product
    const product = vipTiers.find((tier) => tier.id === productId)

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    // In a real app, this would create an order in the database
    const order = {
      id: Math.floor(Math.random() * 1000000),
      userId,
      productId,
      quantity,
      totalPrice: product.price * quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 })
  }
}
