"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthContext } from "@/components/providers/auth-provider"
import type { UserPermission, Resource, AccessLevel } from "@/types/permissions"
import {
  ACCESS_LEVEL_HIERARCHY,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/permissions/constants"

export function usePermissions() {
  const { user, profile } = useAuthContext()
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function fetchPermissions() {
      if (!user) {
        setPermissions([])
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("user_permissions")
        .select("*")
        .eq("user_id", user.id)

      setPermissions((data as UserPermission[]) ?? [])
      setLoading(false)
    }

    fetchPermissions()
  }, [user, supabase])

  const hasPermission = useCallback(
    (
      resource: Resource,
      requiredLevel: AccessLevel = "read",
      projectId?: string | null
    ): boolean => {
      if (!profile) return false

      if (profile.role === "admin") return true

      const defaults = DEFAULT_ROLE_PERMISSIONS[profile.role]
      if (defaults.resources.includes(resource)) {
        if (
          ACCESS_LEVEL_HIERARCHY[defaults.defaultLevel] >=
          ACCESS_LEVEL_HIERARCHY[requiredLevel]
        ) {
          return true
        }
      }

      return permissions.some((p) => {
        const resourceMatch = p.resource === resource
        const levelMatch =
          ACCESS_LEVEL_HIERARCHY[p.access_level] >=
          ACCESS_LEVEL_HIERARCHY[requiredLevel]
        const projectMatch =
          !projectId || p.project_id === null || p.project_id === projectId
        return resourceMatch && levelMatch && projectMatch
      })
    },
    [profile, permissions]
  )

  const accessibleResources = useCallback((): Resource[] => {
    if (!profile) return []
    if (profile.role === "admin") {
      return [
        "timesheet",
        "budgets",
        "documents",
        "schedules",
        "admin",
        "projects",
      ]
    }

    const resources = new Set<Resource>(
      DEFAULT_ROLE_PERMISSIONS[profile.role].resources
    )
    permissions.forEach((p) => resources.add(p.resource as Resource))
    return Array.from(resources)
  }, [profile, permissions])

  return { permissions, loading, hasPermission, accessibleResources }
}
