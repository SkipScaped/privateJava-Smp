"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, User, LogOut, Home, Package, Users, Book } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cartItems } = useCart()
  const { user, logout } = useAuth()

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Package },
    { name: "Players", href: "/players", icon: Users },
    { name: "Rules", href: "/rules", icon: Book },
    { name: "Gallery", href: "/gallery", icon: Image },
  ]

  // Helper function to get user profile picture with guaranteed fallback
  const getUserProfilePicture = (user: any) => {
    if (user?.profilePicture && user.profilePicture.trim() !== "") {
      return user.profilePicture
    }
    return `/placeholder.svg?height=32&width=32&text=${user?.username?.substring(0, 2).toUpperCase() || "U"}`
  }

  return (
    <nav className="bg-gray-800/90 backdrop-blur-sm py-4 sticky top-0 z-50 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="Private Java SMP Logo"
                width={32}
                height={32}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=32&width=32&text=Logo"
                }}
              />
            </div>
            <span className="text-xl font-bold text-white">Private Java SMP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-600">
                      <Image
                        src={getUserProfilePicture(user) || "/placeholder.svg"}
                        alt={user.username || "User"}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=32&width=32&text=${user?.username?.substring(0, 2).toUpperCase() || "U"}`
                        }}
                      />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{user.username}</span>
                      {user.rank && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          {user.rank}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-700">View Profile</DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <Link href="/cart" className="relative p-1.5 rounded-full hover:bg-gray-700">
              <ShoppingCart className="h-5 w-5 text-gray-300" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full px-1">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <Link href="/cart" className="relative mr-4 p-1.5 rounded-full">
              <ShoppingCart className="h-5 w-5 text-gray-300" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full px-1">
                  {totalItems}
                </Badge>
              )}
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-3 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 py-3 px-4 text-gray-300 hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}

            <div className="border-t border-gray-700 my-2"></div>

            {user ? (
              <>
                <div className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-600">
                      <Image
                        src={getUserProfilePicture(user) || "/placeholder.svg"}
                        alt={user.username || "User"}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=32&width=32&text=${user?.username?.substring(0, 2).toUpperCase() || "U"}`
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      {user.rank && (
                        <Badge variant="outline" className="text-xs">
                          {user.rank}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-3 px-4 text-gray-300 hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  View Profile
                </Link>
                <button
                  className="flex items-center gap-2 w-full text-left py-3 px-4 text-red-400 hover:bg-red-900/20"
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 p-4">
                <Link href="/auth/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
