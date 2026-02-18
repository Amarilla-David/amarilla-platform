"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { PermissionEditor } from "@/components/admin/permission-editor"
import type { UserProfile } from "@/types/auth"
import type { UserPermission } from "@/types/permissions"

export default function AdminPermissionsPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [usersRes, permissionsRes] = await Promise.all([
      supabase.from("user_profiles").select("*").order("full_name"),
      supabase.from("user_permissions").select("*"),
    ])
    setUsers((usersRes.data as UserProfile[]) ?? [])
    setPermissions((permissionsRes.data as UserPermission[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const userPermissions = selectedUserId
    ? permissions.filter((p) => p.user_id === selectedUserId)
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Permisos</h1>
        <p className="text-muted-foreground">
          Asignar permisos por recurso y proyecto
        </p>
      </div>

      <PermissionEditor
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        permissions={userPermissions}
        loading={loading}
        onRefresh={fetchData}
      />
    </div>
  )
}
