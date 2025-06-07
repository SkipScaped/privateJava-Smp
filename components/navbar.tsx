"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, User, LogOut, Home, Package, Book } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import SafeImage from "@/components/safe-image"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { cartItems } = useCart()
  const { user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Package },
    { name: "Rules", href: "/rules", icon: Book },
  ]

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-gray-900/90 backdrop-blur-sm py-4 sticky top-0 z-50 border-b-4 border-green-800 minecraft-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-none overflow-hidden minecraft-border border-2 border-gray-700">
              <Image src="/logo.png" alt="Private Java SMP Logo" width={40} height={40} className="object-contain" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white minecraft-text">Private Java SMP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors minecraft-text"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}

            {mounted && user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2 minecraft-text">
                  <div className="relative w-8 h-8 rounded-none overflow-hidden minecraft-border border-2 border-gray-700">
                    <SafeImage
                      src={user.profilePicture}
                      alt={user.username || "User"}
                      fill
                      className="object-cover"
                      fallbackText={user.username?.substring(0, 2).toUpperCase() || "U"}
                    />
                  </div>
                  <span className="text-gray-300 hover:text-white">{user.username}</span>
                </Link>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="minecraft-button bg-red-700 hover:bg-red-800"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              mounted && (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white minecraft-button">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="bg-green-700 hover:bg-green-800 minecraft-button">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )
            )}

            <Link
              href="/cart"
              className="relative p-1.5 rounded-none hover:bg-gray-700 minecraft-border border-2 border-gray-700"
            >
              <ShoppingCart className="h-5 w-5 text-gray-300" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-none px-1 minecraft-border">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <Link href="/cart" className="relative mr-4 p-1.5 rounded-none minecraft-border border-2 border-gray-700">
              <ShoppingCart className="h-5 w-5 text-gray-300" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-none px-1 minecraft-border">
                  {totalItems}
                </Badge>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white minecraft-button"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-3 bg-gray-800 rounded-none border-2 minecraft-border border-gray-700 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 py-3 px-4 text-gray-300 hover:bg-gray-700 minecraft-text"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}

            <div className="border-t-2 border-gray-700 my-2"></div>

            {mounted && user ? (
              <>
                <div className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-none overflow-hidden minecraft-border border-2 border-gray-700">
                      <SafeImage
                        src={user.profilePicture}
                        alt={user.username || "User"}
                        fill
                        className="object-cover"
                        fallbackText={user.username?.substring(0, 2).toUpperCase() || "U"}
                      />
                    </div>
                    <div>
                      <p className="font-medium minecraft-text">{user.username}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-3 px-4 text-gray-300 hover:bg-gray-700 minecraft-text"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  View Profile
                </Link>
                <button
                  className="flex items-center gap-2 w-full text-left py-3 px-4 text-red-400 hover:bg-red-900/20 minecraft-text"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              mounted && (
                <div className="flex flex-col gap-2 p-4">
                  <Link href="/auth/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full minecraft-button">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-green-700 hover:bg-green-800 minecraft-button">Sign Up</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
