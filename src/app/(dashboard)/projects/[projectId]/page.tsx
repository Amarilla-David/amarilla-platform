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
import { PROJECT_STATUS_COLORS } from "@/types/project"
import type { ProjectStatus } from "@/types/project"
import { useTranslations } from "next-intl"
import type { LucideIcon } from "lucide-react"

interface OverviewCard {
  titleKey: string
  descKey: string
  icon: LucideIcon
  value: string
  color: string
}

const OVERVIEW_CARDS: OverviewCard[] = [
  {
    titleKey: "overviewCards.documentsTitle",
    icon: FileText,
    value: "—",
    descKey: "overviewCards.documentsDesc",
    color: "text-purple-600",
  },
  {
    titleKey: "overviewCards.budgetTitle",
    icon: DollarSign,
    value: "—",
    descKey: "overviewCards.budgetDesc",
    color: "text-yellow-600",
  },
  {
    titleKey: "overviewCards.scheduleTitle",
    icon: CalendarDays,
    value: "—",
    descKey: "overviewCards.scheduleDesc",
    color: "text-orange-600",
  },
  {
    titleKey: "overviewCards.teamTitle",
    icon: Users,
    value: "—",
    descKey: "overviewCards.teamDesc",
    color: "text-blue-600",
  },
]

export default function ProjectDashboardPage() {
  const { project } = useProject()
  const t = useTranslations("projects")

  const statusKey = `status.${project.status}`

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
            {t.has(statusKey)
              ? t(statusKey)
              : project.status}
          </Badge>
        </div>
      </div>

      {/* Project Review */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("generalInfo")}
          </p>
          <h2 className="text-xl font-bold">{t("overview")}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.clientName && (
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  {t("client")}
                </p>
                <p className="text-sm font-medium">{project.clientName}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                {t("location")}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {t("tbd")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_CARDS.map((card) => (
          <Card key={card.titleKey}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t(card.titleKey)}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">
                {t(card.descKey)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
