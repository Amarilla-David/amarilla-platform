"use client"

import { useDeviceContext } from "@/hooks/use-device-context"

export function MobileOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isMobile } = useDeviceContext()
  if (!isMobile) return fallback ? <>{fallback}</> : null
  return <>{children}</>
}
