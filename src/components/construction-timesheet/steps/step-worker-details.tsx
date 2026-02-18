"use client"

import { useState } from "react"
import { Minus, Plus, CopyCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useDetails,
  useDailyEntries,
} from "@/hooks/use-construction-timesheet"
import { useWizard } from "../wizard-provider"
import { WorkerConfigCard } from "../worker-config-card"
import {
  TIPO_DE_HORAS_OPTIONS,
  type TipoDeHoras,
} from "@/types/construction-timesheet"

export function StepWorkerDetails() {
  const { state, dispatch } = useWizard()
  const { data: detailsData } = useDetails(state.selectedProjectPlanId)
  const { data: entriesData } = useDailyEntries(state.date)
  const [showApplyAll, setShowApplyAll] = useState(false)
  const [bulkHours, setBulkHours] = useState(8)
  const [bulkTipo, setBulkTipo] = useState<TipoDeHoras>("Horas normales")

  const details = detailsData?.details ?? []

  // Calculate existing hours per worker
  const hoursByWorker: Record<string, number> = {}
  for (const entry of entriesData?.entries ?? []) {
    if (entry.personId) {
      hoursByWorker[entry.personId] =
        (hoursByWorker[entry.personId] ?? 0) + entry.hours
    }
  }

  function applyToAll() {
    for (const entry of state.workerEntries) {
      const maxH = 10 - (hoursByWorker[entry.workerId] ?? 0)
      const hours = Math.min(bulkHours, maxH)
      dispatch({
        type: "UPDATE_WORKER_ENTRY",
        workerId: entry.workerId,
        field: "hours",
        value: hours,
      })
      dispatch({
        type: "UPDATE_WORKER_ENTRY",
        workerId: entry.workerId,
        field: "tipoDeHoras",
        value: bulkTipo,
      })
    }
    setShowApplyAll(false)
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="text-sm text-muted-foreground space-y-0.5">
        <p>
          Obra: <span className="font-medium text-foreground">{state.selectedProjectName}</span>
        </p>
        <p>
          Tarea: <span className="font-medium text-foreground">{state.selectedProjectPlanName}</span>
        </p>
        <p>
          Trabajadores: <span className="font-medium text-foreground">{state.workerEntries.length}</span>
        </p>
      </div>

      {/* Apply to all toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowApplyAll(!showApplyAll)}
        className="self-start gap-2"
      >
        <CopyCheck className="h-4 w-4" />
        Aplicar a todos
      </Button>

      {showApplyAll && (
        <div className="rounded-xl border bg-primary/5 p-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Horas para todos</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setBulkHours(Math.max(0.5, bulkHours - 0.5))
                }
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-bold w-12 text-center tabular-nums">
                {bulkHours}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setBulkHours(Math.min(10, bulkHours + 0.5))
                }
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Tipo de Horas para todos</Label>
            <Select
              value={bulkTipo}
              onValueChange={(v) => setBulkTipo(v as TipoDeHoras)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_DE_HORAS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={applyToAll} size="sm" className="w-full">
            Aplicar
          </Button>
        </div>
      )}

      {/* Individual worker cards */}
      <div className="space-y-3">
        {state.workerEntries.map((entry) => {
          const existing = hoursByWorker[entry.workerId] ?? 0
          const maxHours = 10 - existing

          return (
            <WorkerConfigCard
              key={entry.workerId}
              workerId={entry.workerId}
              workerName={entry.workerName}
              hours={entry.hours}
              detailId={entry.detailId}
              tipoDeHoras={entry.tipoDeHoras}
              comments={entry.comments}
              maxHours={maxHours}
              details={details}
            />
          )
        })}
      </div>
    </div>
  )
}
