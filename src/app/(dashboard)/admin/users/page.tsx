"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserList } from "@/components/admin/user-list"
import type { UserProfile } from "@/types/auth"
import { useTranslations } from "next-intl"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const t = useTranslations("admin.users")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    setUsers((data as UserProfile[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <UserList users={users} loading={loading} onRefresh={fetchUsers} />
    </div>
  )
}
