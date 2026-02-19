"use client"

import { Users, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { TimesheetRecord } from "@/types/construction-timesheet"
import { useTranslations } from "next-intl"

interface DailySummaryCardProps {
  entries: TimesheetRecord[]
}

export function DailySummaryCard({ entries }: DailySummaryCardProps) {
  const uniqueWorkers = new Set(entries.map((e) => e.personId)).size
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)
  const t = useTranslations("timesheet.summary")

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{uniqueWorkers}</p>
              <p className="text-xs text-muted-foreground">{t("workers")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{totalHours}</p>
              <p className="text-xs text-muted-foreground">{t("totalHours")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
