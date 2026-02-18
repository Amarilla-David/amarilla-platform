"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "@/types/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (error) {
          console.error("Profile fetch error:", error.message)
          return null
        }
        return data as UserProfile
      } catch (e) {
        console.error("Profile fetch exception:", e)
        return null
      }
    },
    [supabase]
  )

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Auth getUser error:", error.message)
        }

        if (!mounted) return

        setUser(currentUser)

        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id)
          if (mounted) {
            setProfile(profileData)
          }
        }
      } catch (e) {
        console.error("Auth init error:", e)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        try {
          const profileData = await fetchProfile(sessionUser.id)
          if (mounted) {
            setProfile(profileData)
          }
        } catch {
          // Ignore errors in auth state change listener
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }, [supabase])

  return { user, profile, loading, signOut }
}
