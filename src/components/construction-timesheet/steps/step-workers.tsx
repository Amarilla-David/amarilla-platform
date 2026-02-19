"use client"

import { useState } from "react"
import { Search, UserCheck, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  useWorkers,
  useDailyEntries,
} from "@/hooks/use-construction-timesheet"
import { useWizard } from "../wizard-provider"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function StepWorkers() {
  const { state, dispatch } = useWizard()
  const { data: workersData, isLoading } = useWorkers(
    state.selectedProjectId,
    state.selectedProjectName
  )
  const { data: entriesData } = useDailyEntries(state.date)
  const [search, setSearch] = useState("")
  const t = useTranslations("timesheet.wizard")

  const workers = (workersData?.workers ?? []).filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  // Calculate existing hours per worker
  const hoursByWorker: Record<string, number> = {}
  for (const entry of entriesData?.entries ?? []) {
    if (entry.personId) {
      hoursByWorker[entry.personId] =
        (hoursByWorker[entry.personId] ?? 0) + entry.hours
    }
  }

  const selectableWorkers = workers.filter(
    (w) => (hoursByWorker[w.id] ?? 0) < 10
  )
  const allSelected =
    selectableWorkers.length > 0 &&
    selectableWorkers.every((w) =>
      state.selectedWorkerIds.includes(w.id)
    )

  function toggleAll() {
    if (allSelected) {
      dispatch({ type: "DESELECT_ALL_WORKERS" })
    } else {
      dispatch({
        type: "SELECT_ALL_WORKERS",
        workers: selectableWorkers.map((w) => ({ id: w.id, name: w.name })),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="text-sm text-muted-foreground space-y-0.5">
        <p>
          {t("projectLabel")} <span className="font-medium text-foreground">{state.selectedProjectName}</span>
        </p>
        <p>
          {t("planLabel")} <span className="font-medium text-foreground">{state.selectedProjectPlanName}</span>
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchWorker")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleAll}
        className="self-start gap-2"
      >
        {allSelected ? (
          <>
            <Users className="h-4 w-4" />
            {t("deselectAll")}
          </>
        ) : (
          <>
            <UserCheck className="h-4 w-4" />
            {t("selectAll")}
          </>
        )}
      </Button>

      <div className="space-y-1">
        {workers.map((worker) => {
          const existingHours = hoursByWorker[worker.id] ?? 0
          const isFull = existingHours >= 10
          const isSelected = state.selectedWorkerIds.includes(worker.id)

          return (
            <div
              key={worker.id}
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isFull}
              tabIndex={isFull ? -1 : 0}
              onClick={() =>
                !isFull &&
                dispatch({
                  type: "TOGGLE_WORKER",
                  workerId: worker.id,
                  workerName: worker.name,
                })
              }
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault()
                  if (!isFull) {
                    dispatch({
                      type: "TOGGLE_WORKER",
                      workerId: worker.id,
                      workerName: worker.name,
                    })
                  }
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left min-h-[52px] cursor-pointer select-none",
                isFull && "opacity-50 cursor-not-allowed bg-muted",
                !isFull && "active:scale-[0.98]",
                isSelected && !isFull && "border-primary bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input"
                )}
              >
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="flex-1 font-medium text-sm">
                {worker.name}
              </span>
              {existingHours > 0 && (
                <Badge
                  variant={isFull ? "destructive" : "outline"}
                  className="text-xs shrink-0"
                >
                  {t("existingHours", { hours: existingHours })}
                </Badge>
              )}
            </div>
          )
        })}

        {workers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {t("noWorkers")}
          </p>
        )}
      </div>
    </div>
  )
}
