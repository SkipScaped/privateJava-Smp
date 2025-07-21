import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: shopItems, error } = await supabase
      .from("shop_items")
      .select("*")
      .eq("is_available", true)
      .order("price", { ascending: true })

    if (error) {
      console.error("Error fetching shop items:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch shop items",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: shopItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number.parseFloat(item.price),
        imageUrl: item.image_url,
        category: item.category,
        isAvailable: item.is_available,
      })),
    })
  } catch (error) {
    console.error("Error in shop API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
