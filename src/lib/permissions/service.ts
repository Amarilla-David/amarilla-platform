import { createClient } from "@/lib/supabase/server"
import type { Resource, AccessLevel, UserPermission } from "@/types/permissions"
import { ACCESS_LEVEL_HIERARCHY, DEFAULT_ROLE_PERMISSIONS } from "./constants"

export async function getUserPermissions(
  userId: string
): Promise<UserPermission[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_permissions")
    .select("*")
    .eq("user_id", userId)

  if (error) throw new Error(`Failed to fetch permissions: ${error.message}`)
  return (data as UserPermission[]) ?? []
}

export async function checkPermission(
  userId: string,
  resource: Resource,
  requiredLevel: AccessLevel = "read",
  projectId?: string | null
): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single()

  if (!profile) return false

  if (profile.role === "admin") return true

  const defaults =
    DEFAULT_ROLE_PERMISSIONS[
      profile.role as keyof typeof DEFAULT_ROLE_PERMISSIONS
    ]
  if (defaults?.resources.includes(resource)) {
    if (
      ACCESS_LEVEL_HIERARCHY[defaults.defaultLevel] >=
      ACCESS_LEVEL_HIERARCHY[requiredLevel]
    ) {
      return true
    }
  }

  let query = supabase
    .from("user_permissions")
    .select("access_level")
    .eq("user_id", userId)
    .eq("resource", resource)

  if (projectId) {
    query = query.or(`project_id.is.null,project_id.eq.${projectId}`)
  }

  const { data: permissions } = await query

  if (!permissions || permissions.length === 0) return false

  return permissions.some(
    (p) =>
      ACCESS_LEVEL_HIERARCHY[p.access_level as AccessLevel] >=
      ACCESS_LEVEL_HIERARCHY[requiredLevel]
  )
}
