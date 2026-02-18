"use client"

import { PermissionGate } from "@/components/permissions/permission-gate"
import { useAuthContext } from "@/components/providers/auth-provider"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Clock,
  FolderKanban,
  FileText,
  DollarSign,
  CalendarDays,
  Shield,
} from "lucide-react"
import Link from "next/link"
import type { Resource } from "@/types/permissions"

interface DashboardCard {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  resource: Resource
}

const DASHBOARD_CARDS: DashboardCard[] = [
  {
    title: "Timesheet",
    description: "Registrar y revisar horas trabajadas",
    href: "/timesheet",
    icon: <Clock className="h-8 w-8 text-blue-500" />,
    resource: "timesheet",
  },
  {
    title: "Proyectos",
    description: "Ver proyectos activos",
    href: "/projects",
    icon: <FolderKanban className="h-8 w-8 text-green-500" />,
    resource: "projects",
  },
  {
    title: "Documentos",
    description: "Planos, contratos y permisos",
    href: "/documents",
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    resource: "documents",
  },
  {
    title: "Presupuestos",
    description: "Control de costos y presupuestos",
    href: "/budgets",
    icon: <DollarSign className="h-8 w-8 text-yellow-500" />,
    resource: "budgets",
  },
  {
    title: "Cronograma",
    description: "Calendario y cronograma de obra",
    href: "/schedules",
    icon: <CalendarDays className="h-8 w-8 text-orange-500" />,
    resource: "schedules",
  },
  {
    title: "Administracion",
    description: "Gestion de usuarios y permisos",
    href: "/admin/users",
    icon: <Shield className="h-8 w-8 text-red-500" />,
    resource: "admin",
  },
]

export default function DashboardPage() {
  const { profile } = useAuthContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido{profile ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Panel principal de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DASHBOARD_CARDS.map((card) => (
          <PermissionGate key={card.href} resource={card.resource}>
            <Link href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  {card.icon}
                  <div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </PermissionGate>
        ))}
      </div>
    </div>
  )
}
