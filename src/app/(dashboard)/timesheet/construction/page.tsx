"use client"

import { WizardProvider } from "@/components/construction-timesheet/wizard-provider"
import { DailyReviewPanel } from "@/components/construction-timesheet/daily-review-panel"
import { RegistrationWizard } from "@/components/construction-timesheet/registration-wizard"
import { FloatingAddButton } from "@/components/construction-timesheet/floating-add-button"
import { useTranslations } from "next-intl"

export default function TimesheetConstructionPage() {
  const t = useTranslations("timesheet.construction")

  return (
    <WizardProvider>
      <div className="space-y-4 pb-24">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <DailyReviewPanel />
      </div>

      <FloatingAddButton />
      <RegistrationWizard />
    </WizardProvider>
  )
}
