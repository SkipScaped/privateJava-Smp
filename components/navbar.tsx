"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, ShoppingCart, Shield } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import SafeImage from "@/components/safe-image"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const { items } = useCart()

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="bg-gray-800 border-b-4 border-green-500 minecraft-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 relative rounded-none overflow-hidden minecraft-border border-2 border-gray-600">
              <SafeImage src="/logo.png" alt="Private Java SMP Logo" width={40} height={40} fallbackText="SMP" />
            </div>
            <span className="text-xl font-bold minecraft-title hidden sm:block">Private Java SMP</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="minecraft-text hover:text-green-400 transition-colors">
              Home
            </Link>
            <Link href="/players" className="minecraft-text hover:text-green-400 transition-colors">
              Players
            </Link>
            <Link href="/gallery" className="minecraft-text hover:text-green-400 transition-colors">
              Gallery
            </Link>
            <Link href="/shop" className="minecraft-text hover:text-green-400 transition-colors">
              Shop
            </Link>
            <Link href="/rules" className="minecraft-text hover:text-green-400 transition-colors">
              Rules
            </Link>

            {/* Admin Link */}
            {user?.isAdmin && (
              <Link href="/admin" className="minecraft-text hover:text-red-400 transition-colors">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin
                </div>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="outline" size="sm" className="minecraft-button rounded-none bg-transparent">
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="minecraft-button rounded-none bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    {user.username}
                    {user.isAdmin && <Shield className="h-3 w-3 ml-1 text-red-400" />}
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="minecraft-button rounded-none hover:bg-red-600 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="minecraft-button rounded-none bg-transparent">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 minecraft-button rounded-none">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="minecraft-button rounded-none"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="minecraft-text hover:text-green-400 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/players"
                className="minecraft-text hover:text-green-400 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Players
              </Link>
              <Link
                href="/gallery"
                className="minecraft-text hover:text-green-400 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Gallery
              </Link>
              <Link
                href="/shop"
                className="minecraft-text hover:text-green-400 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/rules"
                className="minecraft-text hover:text-green-400 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                Rules
              </Link>

              {/* Mobile Admin Link */}
              {user?.isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 minecraft-text hover:text-red-400 transition-colors px-2 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}

              {/* Mobile Cart */}
              <Link
                href="/cart"
                className="flex items-center minecraft-text hover:text-green-400 transition-colors px-2 py-1"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>

              {/* Mobile Auth */}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center minecraft-text hover:text-green-400 transition-colors px-2 py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile ({user.username}){user.isAdmin && <Shield className="h-3 w-3 ml-1 text-red-400" />}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center minecraft-text hover:text-red-400 transition-colors px-2 py-1 text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-2">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full minecraft-button rounded-none bg-transparent">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 minecraft-button rounded-none">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
