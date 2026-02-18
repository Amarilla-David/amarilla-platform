"use client"

import { useProject } from "@/hooks/use-project"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  Building2,
  FileText,
  DollarSign,
  CalendarDays,
  Users,
} from "lucide-react"
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "@/types/project"
import type { ProjectStatus } from "@/types/project"

const OVERVIEW_CARDS = [
  {
    title: "Documentos",
    icon: FileText,
    value: "—",
    description: "Planos y contratos",
    color: "text-purple-600",
  },
  {
    title: "Presupuesto",
    icon: DollarSign,
    value: "—",
    description: "Control de costos",
    color: "text-yellow-600",
  },
  {
    title: "Cronograma",
    icon: CalendarDays,
    value: "—",
    description: "Hitos del proyecto",
    color: "text-orange-600",
  },
  {
    title: "Equipo",
    icon: Users,
    value: "—",
    description: "Miembros asignados",
    color: "text-blue-600",
  },
]

export default function ProjectDashboardPage() {
  const { project } = useProject()

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">
            {project.name}
          </h1>
          <Badge
            variant="outline"
            className={
              PROJECT_STATUS_COLORS[project.status as ProjectStatus] ??
              "bg-gray-50 text-gray-700 border-gray-200"
            }
          >
            {PROJECT_STATUS_LABELS[project.status as ProjectStatus] ??
              project.status}
          </Badge>
        </div>
      </div>

      {/* Project Review */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Informacion General
          </p>
          <h2 className="text-xl font-bold">Resumen del Proyecto</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.clientName && (
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Cliente
                </p>
                <p className="text-sm font-medium">{project.clientName}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Ubicacion
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                Por definir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_CARDS.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
