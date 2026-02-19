"use client"

import { useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UserProfile } from "@/types/auth"
import type { Role } from "@/types/permissions"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface UserListProps {
  users: UserProfile[]
  loading: boolean
  onRefresh: () => void
}

const ROLES: Role[] = ["admin", "manager", "employee", "client", "foreman"]

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  manager: "bg-blue-50 text-blue-700 border-blue-200",
  employee: "bg-green-50 text-green-700 border-green-200",
  client: "bg-purple-50 text-purple-700 border-purple-200",
  foreman: "bg-orange-50 text-orange-700 border-orange-200",
}

export function UserList({ users, loading, onRefresh }: UserListProps) {
  const supabase = useMemo(() => createClient(), [])
  const t = useTranslations("admin.users")
  const tRoles = useTranslations("roles")

  async function updateRole(userId: string, newRole: Role) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", userId)

    if (error) {
      toast.error(t("roleError"))
    } else {
      toast.success(t("roleUpdated"))
      onRefresh()
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("loading")}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noUsers")}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium">{user.full_name}</p>
              <Badge className={ROLE_COLORS[user.role]}>{tRoles(user.role)}</Badge>
            </div>
            <Select
              defaultValue={user.role}
              onValueChange={(value) => updateRole(user.id, value as Role)}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {tRoles(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
