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

interface UserListProps {
  users: UserProfile[]
  loading: boolean
  onRefresh: () => void
}

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  employee: "bg-green-100 text-green-800",
  client: "bg-purple-100 text-purple-800",
}

export function UserList({ users, loading, onRefresh }: UserListProps) {
  const supabase = useMemo(() => createClient(), [])

  async function updateRole(userId: string, newRole: Role) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", userId)

    if (error) {
      toast.error("Error al actualizar rol")
    } else {
      toast.success("Rol actualizado")
      onRefresh()
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando usuarios...
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay usuarios registrados
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
              <Badge className={ROLE_COLORS[user.role]}>{user.role}</Badge>
            </div>
            <Select
              defaultValue={user.role}
              onValueChange={(value) => updateRole(user.id, value as Role)}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
