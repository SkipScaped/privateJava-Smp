import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { CartProvider } from "@/context/cart-context"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Private Java SMP",
  description: "Join our private Java SMP Minecraft server",
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />
                <main>{children}</main>
                <footer className="bg-gray-800 py-6 mt-12">
                  <div className="container mx-auto px-4 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} Private Java SMP. All rights reserved.</p>
                  </div>
                </footer>
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
