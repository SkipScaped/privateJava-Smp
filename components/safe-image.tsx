"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackText?: string
}

export default function SafeImage({ src, alt, fallbackText, fill, width, height, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
  }

  if (error || !src) {
    // Create a fallback with the first letter of alt text or provided fallback
    const text = fallbackText || alt?.charAt(0) || "?"
    const bgColor = stringToColor(text)
    const textColor = getContrastColor(bgColor)

    return (
      <div
        className="flex items-center justify-center bg-gray-700 text-white font-bold"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          width: fill ? "100%" : width,
          height: fill ? "100%" : height,
        }}
        {...(props as any)}
      >
        {text}
      </div>
    )
  }

  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      onError={handleError}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      {...props}
    />
  )
}

// Function to generate a color based on a string
function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = "#"
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ("00" + value.toString(16)).substr(-2)
  }
  return color
}

// Function to determine if text should be white or black based on background color
function getContrastColor(hexColor: string) {
  // Convert hex to RGB
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#ffffff"
}
