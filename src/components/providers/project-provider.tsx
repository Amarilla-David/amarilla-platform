"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthContext } from "./auth-provider"
import { ProjectContext } from "@/hooks/use-project"
import type { Project } from "@/lib/data/interfaces/projects"

interface ProjectProviderProps {
  projectId: string
  children: React.ReactNode
}

export function ProjectProvider({ projectId, children }: ProjectProviderProps) {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuthContext()
  const supabase = useMemo(() => createClient(), [])
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    const userId = user.id

    async function loadProject() {
      try {
        const { data: projectData, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single()

        if (error || !projectData) {
          router.push("/")
          return
        }

        // Admin has access to all projects
        if (profile?.role === "admin") {
          setProject({
            id: projectData.id,
            name: projectData.name,
            clientName: projectData.client_name,
            status: projectData.status,
            airtableBaseId: projectData.airtable_base_id,
            createdAt: projectData.created_at,
            updatedAt: projectData.updated_at,
          })
          setLoading(false)
          return
        }

        // Check if user has access to this project
        const { data: permission } = await supabase
          .from("user_permissions")
          .select("id")
          .eq("user_id", userId)
          .eq("project_id", projectId)
          .limit(1)
          .maybeSingle()

        if (!permission) {
          router.push("/")
          return
        }

        setProject({
          id: projectData.id,
          name: projectData.name,
          clientName: projectData.client_name,
          status: projectData.status,
          airtableBaseId: projectData.airtable_base_id,
          createdAt: projectData.created_at,
          updatedAt: projectData.updated_at,
        })
      } catch (e) {
        console.error("Project load error:", e)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId, user, profile, authLoading, supabase, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando proyecto...</div>
      </div>
    )
  }

  if (!project) return null

  return (
    <ProjectContext.Provider
      value={{
        project,
        airtableBaseId: project.airtableBaseId || "",
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
