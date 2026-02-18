"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthContext } from "@/components/providers/auth-provider"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, ArrowRight, FolderKanban } from "lucide-react"
import Link from "next/link"
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "@/types/project"
import type { ProjectStatus } from "@/types/project"

interface ProjectRow {
  id: string
  name: string
  client_name: string | null
  status: string
}

export default function ProjectsListPage() {
  const { user, profile } = useAuthContext()
  const supabase = useMemo(() => createClient(), [])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return

      if (profile?.role === "admin") {
        const { data } = await supabase
          .from("projects")
          .select("id, name, client_name, status")
          .order("name")
        setProjects(data ?? [])
      } else {
        const { data: permissions } = await supabase
          .from("user_permissions")
          .select("project_id")
          .eq("user_id", user.id)
          .not("project_id", "is", null)

        const projectIds = [
          ...new Set(
            (permissions ?? []).map((p) => p.project_id).filter(Boolean)
          ),
        ]

        if (projectIds.length > 0) {
          const { data } = await supabase
            .from("projects")
            .select("id, name, client_name, status")
            .in("id", projectIds)
            .order("name")
          setProjects(data ?? [])
        }
      }
      setLoading(false)
    }

    load()
  }, [user, profile, supabase])

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando proyectos...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderKanban className="h-6 w-6 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay proyectos disponibles
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {project.name}
                      </CardTitle>
                      {project.client_name && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          {project.client_name}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant="outline"
                    className={
                      PROJECT_STATUS_COLORS[
                        project.status as ProjectStatus
                      ] ?? "bg-gray-50 text-gray-700 border-gray-200"
                    }
                  >
                    {PROJECT_STATUS_LABELS[
                      project.status as ProjectStatus
                    ] ?? project.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
