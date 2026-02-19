"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDeleteEntry } from "@/hooks/use-construction-timesheet"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { TimesheetRecord } from "@/types/construction-timesheet"
import { useTranslations } from "next-intl"

interface WorkerDailyListProps {
  entries: TimesheetRecord[]
}

interface GroupedWorker {
  personId: string
  personName: string
  totalHours: number
  entries: TimesheetRecord[]
}

export function WorkerDailyList({ entries }: WorkerDailyListProps) {
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null)
  const deleteEntry = useDeleteEntry()
  const t = useTranslations("timesheet.workerList")

  // Group entries by worker
  const grouped: GroupedWorker[] = []
  const map = new Map<string, GroupedWorker>()

  for (const entry of entries) {
    const key = entry.personId
    if (!map.has(key)) {
      const worker: GroupedWorker = {
        personId: key,
        personName: entry.personName,
        totalHours: 0,
        entries: [],
      }
      map.set(key, worker)
      grouped.push(worker)
    }
    const w = map.get(key)!
    w.totalHours += entry.hours
    w.entries.push(entry)
  }

  if (grouped.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">{t("noRecords")}</p>
        <p className="text-sm mt-1">
          {t("noRecordsCTA")}
        </p>
      </div>
    )
  }

  function handleDelete(recordId: string) {
    deleteEntry.mutate(recordId, {
      onSuccess: () => toast.success(t("deleted")),
      onError: () => toast.error(t("deleteError")),
    })
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        {t("title")}
      </h3>
      {grouped.map((worker) => {
        const isExpanded = expandedWorker === worker.personId
        return (
          <div
            key={worker.personId}
            className="rounded-xl border bg-card overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedWorker(
                  isExpanded ? null : worker.personId
                )
              }
              className="w-full flex items-center justify-between p-3 text-left active:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {worker.personName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="font-medium text-sm truncate">
                  {worker.personName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="tabular-nums">
                  {worker.totalHours}h
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t px-3 py-2 space-y-2">
                {worker.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30"
                    )}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium truncate">
                        {entry.projectPlanName}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {entry.hours}h
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {entry.tipoDeHoras}
                        </Badge>
                        {entry.detailName && (
                          <Badge variant="outline" className="text-xs">
                            {entry.detailName}
                          </Badge>
                        )}
                      </div>
                      {entry.comments && (
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.comments}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteEntry.isPending}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
