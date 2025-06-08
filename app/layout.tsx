import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { CartProvider } from "@/context/cart-context"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import PWAInstall from "@/components/pwa-install"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Private Java SMP",
  description: "Join our private Java SMP Minecraft server",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Private Java SMP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="msapplication-tap-highlight" content="no" />
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
              <PWAInstall />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
