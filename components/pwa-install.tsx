"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Hide for this session
    sessionStorage.setItem("pwa-install-dismissed", "true")
  }

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem("pwa-install-dismissed")) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gray-800 border-2 border-green-600 rounded-none p-4 shadow-lg minecraft-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-400" />
            <h3 className="font-bold text-white minecraft-text">Install App</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-gray-300 text-sm mb-4 minecraft-text">
          Install Private Java SMP for quick access and offline features!
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-green-700 hover:bg-green-800 minecraft-button"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Install
          </Button>
          <Button variant="outline" onClick={handleDismiss} className="minecraft-button" size="sm">
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}
