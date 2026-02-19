"use client"

import { ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWizard } from "./wizard-provider"
import { useTranslations } from "next-intl"

const STEP_KEYS: Record<number, string> = {
  1: "timesheet.wizard.steps.project",
  2: "timesheet.wizard.steps.plan",
  3: "timesheet.wizard.steps.workers",
  4: "timesheet.wizard.steps.configure",
}

export function WizardHeader() {
  const { state, dispatch, close } = useWizard()
  const { step } = state
  const t = useTranslations()

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
          {t("timesheet.wizard.stepOf", { step })}
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
      <h2 className="text-lg font-semibold">{t(STEP_KEYS[step])}</h2>
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
