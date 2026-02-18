"use client"

import { useDeviceContext } from "@/hooks/use-device-context"

export function DesktopOnly({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isDesktop } = useDeviceContext()
  if (!isDesktop) return fallback ? <>{fallback}</> : null
  return <>{children}</>
}
