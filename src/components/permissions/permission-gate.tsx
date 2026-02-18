"use client"

import { usePermissions } from "@/hooks/use-permissions"
import type { Resource, AccessLevel } from "@/types/permissions"

interface PermissionGateProps {
  resource: Resource
  requiredLevel?: AccessLevel
  projectId?: string | null
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({
  resource,
  requiredLevel = "read",
  projectId,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, loading } = usePermissions()

  if (loading) return null

  if (!hasPermission(resource, requiredLevel, projectId)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
