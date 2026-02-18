"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PermissionGate } from "@/components/permissions/permission-gate"
import { useAuthContext } from "@/components/providers/auth-provider"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Shield,
  Building2,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import type { Resource } from "@/types/permissions"
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "@/types/project"
import type { ProjectStatus } from "@/types/project"

interface DashboardCard {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  resource: Resource
}

const ADMIN_CARDS: DashboardCard[] = [
  {
    title: "Timesheet",
    description: "Registrar y revisar horas trabajadas",
    href: "/timesheet",
    icon: <Clock className="h-8 w-8 text-blue-500" />,
    resource: "timesheet",
  },
  {
    title: "Administracion",
    description: "Gestion de usuarios y permisos",
    href: "/admin/users",
    icon: <Shield className="h-8 w-8 text-red-500" />,
    resource: "admin",
  },
]

interface ProjectRow {
  id: string
  name: string
  client_name: string | null
  status: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuthContext()
  const supabase = useMemo(() => createClient(), [])
  const [projects, setProjects] = useState<ProjectRow[]>([])

  useEffect(() => {
    if (authLoading || !user) return
    if (!profile) return

    const userId = user.id

    async function loadProjects() {
      if (profile?.role === "admin") {
        // Admin: fetch all projects
        const { data } = await supabase
          .from("projects")
          .select("id, name, client_name, status")
          .order("name")
        setProjects(data ?? [])
      } else if (profile?.role === "foreman") {
        router.push("/timesheet/construction")
        return
      } else if (profile?.role === "client") {
        // Client: fetch assigned projects and redirect
        const { data: permissions } = await supabase
          .from("user_permissions")
          .select("project_id")
          .eq("user_id", userId)
          .not("project_id", "is", null)

        const projectIds = [
          ...new Set(
            (permissions ?? [])
              .map((p) => p.project_id)
              .filter(Boolean)
          ),
        ]

        if (projectIds.length === 1) {
          router.push(`/projects/${projectIds[0]}`)
          return
        }

        if (projectIds.length > 0) {
          const { data } = await supabase
            .from("projects")
            .select("id, name, client_name, status")
            .in("id", projectIds)
          setProjects(data ?? [])
        }
      } else {
        // Employee/Manager: fetch assigned projects
        const { data: permissions } = await supabase
          .from("user_permissions")
          .select("project_id")
          .eq("user_id", userId)
          .not("project_id", "is", null)

        const projectIds = [
          ...new Set(
            (permissions ?? [])
              .map((p) => p.project_id)
              .filter(Boolean)
          ),
        ]

        if (projectIds.length > 0) {
          const { data } = await supabase
            .from("projects")
            .select("id, name, client_name, status")
            .in("id", projectIds)
          setProjects(data ?? [])
        }
      }
    }

    loadProjects()
  }, [user, profile, authLoading, supabase, router])

  if (authLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido{profile ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Panel principal de la plataforma
        </p>
      </div>

      {/* Projects grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Proyectos</h2>
          {profile?.role === "admin" && (
            <span className="text-sm text-muted-foreground">
              {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay proyectos asignados
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

      {/* Admin quick links */}
      {profile?.role === "admin" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Administracion</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADMIN_CARDS.map((card) => (
              <PermissionGate key={card.href} resource={card.resource}>
                <Link href={card.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      {card.icon}
                      <div>
                        <CardTitle className="text-lg">
                          {card.title}
                        </CardTitle>
                        <CardDescription>
                          {card.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </PermissionGate>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
