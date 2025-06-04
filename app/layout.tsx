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
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  generator: "v0.dev",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Private Java SMP",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Private Java SMP",
    title: "Private Java SMP",
    description: "Join our private Java SMP Minecraft server",
  },
  twitter: {
    card: "summary",
    title: "Private Java SMP",
    description: "Join our private Java SMP Minecraft server",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Private Java SMP" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
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
