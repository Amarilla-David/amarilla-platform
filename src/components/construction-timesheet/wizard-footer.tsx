"use client"

import { Button } from "@/components/ui/button"
import { useWizard } from "./wizard-provider"
import { useTranslations } from "next-intl"

interface WizardFooterProps {
  onSubmit: () => void
  isSubmitting: boolean
}

export function WizardFooter({ onSubmit, isSubmitting }: WizardFooterProps) {
  const { state, dispatch } = useWizard()
  const { step, selectedWorkerIds, workerEntries } = state
  const t = useTranslations("timesheet.wizard")

  function handleBack() {
    if (step > 1) {
      dispatch({ type: "SET_STEP", step: (step - 1) as 1 | 2 | 3 | 4 })
    }
  }

  // Steps 1 and 2 auto-advance on selection, so no footer needed
  if (step === 1 || step === 2) return null

  if (step === 3) {
    return (
      <div className="sticky bottom-0 z-10 bg-background border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 text-base"
          >
            {t("back")}
          </Button>
          <Button
            onClick={() => dispatch({ type: "SET_STEP", step: 4 })}
            disabled={selectedWorkerIds.length === 0}
            className="flex-1 h-12 text-base"
          >
            {t("nextCount", { count: selectedWorkerIds.length })}
          </Button>
        </div>
      </div>
    )
  }

  // Step 4
  const totalHours = workerEntries.reduce((sum, e) => sum + e.hours, 0)

  return (
    <div className="sticky bottom-0 z-10 bg-background border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          className="h-12 px-6 text-base"
        >
          {t("back")}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || workerEntries.length === 0}
          className="flex-1 h-12 text-base"
        >
          {isSubmitting
            ? t("submitting")
            : t("submitButton", { hours: totalHours, count: workerEntries.length })}
        </Button>
      </div>
    </div>
  )
}
