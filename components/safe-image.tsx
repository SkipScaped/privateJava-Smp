"use client"

import Image from "next/image"

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  fallbackText?: string
  onError?: () => void
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  fallbackText,
  onError,
}: SafeImageProps) {
  // Create a safe source - never allow empty strings
  const getSafeSrc = () => {
    if (!src || src.trim() === "") {
      if (fallbackText) {
        return `/placeholder.svg?height=${height || 200}&width=${width || 200}&text=${encodeURIComponent(fallbackText)}`
      }
      return `/placeholder.svg?height=${height || 200}&width=${width || 200}&text=No+Image`
    }
    return src
  }

  const safeSrc = getSafeSrc()

  const handleError = (e: any) => {
    // Set a fallback image on error
    if (fallbackText) {
      e.target.src = `/placeholder.svg?height=${height || 200}&width=${width || 200}&text=${encodeURIComponent(fallbackText)}`
    } else {
      e.target.src = `/placeholder.svg?height=${height || 200}&width=${width || 200}&text=Error`
    }
    if (onError) {
      onError()
    }
  }

  const imageProps = {
    src: safeSrc,
    alt,
    className,
    priority,
    onError: handleError,
  }

  if (fill) {
    return <Image {...imageProps} fill />
  }

  return <Image {...imageProps} width={width || 200} height={height || 200} />
}
