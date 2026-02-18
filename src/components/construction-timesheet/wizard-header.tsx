"use client"

import { ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWizard } from "./wizard-provider"

const STEP_LABELS: Record<number, string> = {
  1: "Seleccionar Obra",
  2: "Seleccionar Tarea",
  3: "Seleccionar Obreros",
  4: "Configurar Horas",
}

export function WizardHeader() {
  const { state, dispatch, close } = useWizard()
  const { step } = state

  function handleBack() {
    if (step > 1) {
      dispatch({ type: "SET_STEP", step: (step - 1) as 1 | 2 | 3 | 4 })
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background border-b px-4 pb-3 pt-4">
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          disabled={step === 1}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Paso {step} de 4
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          className="h-10 w-10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <h2 className="text-lg font-semibold">{STEP_LABELS[step]}</h2>
      {/* Progress bar */}
      <div className="mt-2 h-1 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    </div>
  )
}
