"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthContext } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import type { UserProfile } from "@/types/auth"
import type { UserPermission, Resource, AccessLevel } from "@/types/permissions"
import { useTranslations } from "next-intl"

const RESOURCES: Resource[] = [
  "timesheet",
  "budgets",
  "documents",
  "schedules",
  "projects",
  "admin",
]
const ACCESS_LEVELS: AccessLevel[] = ["read", "write", "admin"]

interface PermissionEditorProps {
  users: UserProfile[]
  selectedUserId: string | null
  onSelectUser: (userId: string | null) => void
  permissions: UserPermission[]
  loading: boolean
  onRefresh: () => void
}

export function PermissionEditor({
  users,
  selectedUserId,
  onSelectUser,
  permissions,
  loading,
  onRefresh,
}: PermissionEditorProps) {
  const { user: currentUser } = useAuthContext()
  const supabase = useMemo(() => createClient(), [])
  const [newResource, setNewResource] = useState<Resource>("timesheet")
  const [newLevel, setNewLevel] = useState<AccessLevel>("read")
  const t = useTranslations("admin.permissions")
  const tCommon = useTranslations("common")
  const tResources = useTranslations("resources")
  const tAccess = useTranslations("accessLevels")
  const tRoles = useTranslations("roles")

  async function addPermission() {
    if (!selectedUserId || !currentUser) return

    const { error } = await supabase.from("user_permissions").upsert(
      {
        user_id: selectedUserId,
        resource: newResource,
        access_level: newLevel,
        granted_by: currentUser.id,
        project_id: null,
      },
      { onConflict: "user_id,resource,project_id" }
    )

    if (error) {
      toast.error(t("assignError"))
    } else {
      toast.success(t("assignSuccess"))
      onRefresh()
    }
  }

  async function removePermission(permissionId: string) {
    const { error } = await supabase
      .from("user_permissions")
      .delete()
      .eq("id", permissionId)

    if (error) {
      toast.error(t("revokeError"))
    } else {
      toast.success(t("revokeSuccess"))
      onRefresh()
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">{tCommon("loading")}</div>
    )
  }

  return (
    <div className="space-y-4">
      <Select
        value={selectedUserId ?? ""}
        onValueChange={(val) => onSelectUser(val || null)}
      >
        <SelectTrigger className="w-full sm:w-[300px]">
          <SelectValue placeholder={t("selectUser")} />
        </SelectTrigger>
        <SelectContent>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.full_name} ({tRoles(u.role)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("assigned")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {permissions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("noExplicit")}
              </p>
            )}
            {permissions.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{tResources(p.resource)}</Badge>
                  <Badge>{tAccess(p.access_level)}</Badge>
                  {p.project_id && (
                    <span className="text-xs text-muted-foreground">
                      {t("project")} {p.project_id}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePermission(p.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Select
                value={newResource}
                onValueChange={(v) => setNewResource(v as Resource)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {tResources(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newLevel}
                onValueChange={(v) => setNewLevel(v as AccessLevel)}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {tAccess(l)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={addPermission} className="min-w-[44px]">
                <Plus className="h-4 w-4 mr-1" />
                {tCommon("add")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
