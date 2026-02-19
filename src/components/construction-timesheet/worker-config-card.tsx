"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useWizard } from "./wizard-provider"
import {
  TIPO_DE_HORAS_OPTIONS,
  type TipoDeHoras,
  type DetailOption,
} from "@/types/construction-timesheet"
import { useTranslations } from "next-intl"

interface WorkerConfigCardProps {
  workerId: string
  workerName: string
  hours: number
  detailId: string
  tipoDeHoras: TipoDeHoras
  comments: string
  maxHours: number
  details: DetailOption[]
}

export function WorkerConfigCard({
  workerId,
  workerName,
  hours,
  detailId,
  tipoDeHoras,
  comments,
  maxHours,
  details,
}: WorkerConfigCardProps) {
  const { dispatch } = useWizard()
  const t = useTranslations("timesheet.workerCard")
  const tTipo = useTranslations("tipoDeHoras")

  function updateField(field: string, value: string | number) {
    dispatch({
      type: "UPDATE_WORKER_ENTRY",
      workerId,
      field: field as "hours" | "detailId" | "tipoDeHoras" | "comments",
      value,
    })
  }

  function adjustHours(delta: number) {
    const newVal = Math.round((hours + delta) * 2) / 2 // keep 0.5 increments
    if (newVal >= 0.5 && newVal <= maxHours) {
      updateField("hours", newVal)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      {/* Worker name header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold">{workerName}</span>
        <Badge variant="outline" className="text-xs">
          {t("maxHours", { hours: maxHours })}
        </Badge>
      </div>

      {/* Hours stepper */}
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">{t("hours")}</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustHours(-0.5)}
            disabled={hours <= 0.5}
            className="h-11 w-11 shrink-0"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center text-2xl font-bold tabular-nums">
            {hours}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustHours(0.5)}
            disabled={hours >= maxHours}
            className="h-11 w-11 shrink-0"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Detail select */}
      {details.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">
            {t("detail")}
          </Label>
          <Select
            value={detailId || undefined}
            onValueChange={(v) => updateField("detailId", v)}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder={t("selectDetail")} />
            </SelectTrigger>
            <SelectContent>
              {details.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tipo de Horas */}
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">{t("tipoDeHoras")}</Label>
        <Select
          value={tipoDeHoras}
          onValueChange={(v) => updateField("tipoDeHoras", v)}
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPO_DE_HORAS_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {tTipo(opt)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comments */}
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">
          {t("comments")}
        </Label>
        <Input
          value={comments}
          onChange={(e) => updateField("comments", e.target.value)}
          placeholder={t("writePlaceholder")}
          className="h-11"
        />
      </div>
    </div>
  )
}
