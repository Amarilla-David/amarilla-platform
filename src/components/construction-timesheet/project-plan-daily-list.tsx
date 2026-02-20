"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TimesheetRecord } from "@/types/construction-timesheet"
import { useTranslations } from "next-intl"

interface ProjectPlanDailyListProps {
  entries: TimesheetRecord[]
}

interface GroupedPlan {
  planId: string
  planName: string
  status: string
  workerCount: number
  totalHours: number
}

export function ProjectPlanDailyList({ entries }: ProjectPlanDailyListProps) {
  const t = useTranslations("timesheet.planList")

  const grouped: GroupedPlan[] = []
  const map = new Map<string, { workers: Set<string>; hours: number; name: string; status: string }>()

  for (const entry of entries) {
    const key = entry.projectPlanId
    if (!key) continue
    if (!map.has(key)) {
      map.set(key, {
        workers: new Set(),
        hours: 0,
        name: entry.projectPlanName,
        status: entry.projectPlanStatus,
      })
    }
    const g = map.get(key)!
    g.workers.add(entry.personId)
    g.hours += entry.hours
  }

  for (const [planId, data] of map) {
    grouped.push({
      planId,
      planName: data.name,
      status: data.status,
      workerCount: data.workers.size,
      totalHours: data.hours,
    })
  }

  if (grouped.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        {t("title")}
      </h3>
      {grouped.map((plan) => (
        <div
          key={plan.planId}
          className="flex items-center justify-between p-3 rounded-xl border bg-card"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium truncate">
              {plan.planName}
            </span>
            {plan.status && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] shrink-0 px-1.5 py-0",
                  plan.status === "Active" && "border-green-500 text-green-600",
                  plan.status === "Completed" && "border-blue-500 text-blue-600",
                  plan.status === "On Hold" && "border-yellow-500 text-yellow-600",
                )}
              >
                {plan.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
            <span className="tabular-nums">{plan.workerCount} {t("workers")}</span>
            <span>&middot;</span>
            <span className="tabular-nums">{plan.totalHours}h</span>
          </div>
        </div>
      ))}
    </div>
  )
}
