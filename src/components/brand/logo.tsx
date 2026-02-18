"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "dark" | "white"
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZES = {
  sm: { width: 100, height: 32 },
  md: { width: 140, height: 45 },
  lg: { width: 200, height: 64 },
}

export function Logo({ variant = "dark", size = "md", className }: LogoProps) {
  const src = variant === "white" ? "/logo-white.webp" : "/logo-dark.webp"
  const { width, height } = SIZES[size]

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Amarilla"
      width={width}
      height={height}
      className={cn("object-contain", className)}
    />
  )
}
