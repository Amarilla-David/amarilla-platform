"use client"

import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { useWizard } from "./wizard-provider"
import { WizardHeader } from "./wizard-header"
import { WizardFooter } from "./wizard-footer"
import { StepProject } from "./steps/step-project"
import { StepProjectPlan } from "./steps/step-project-plan"
import { StepWorkers } from "./steps/step-workers"
import { StepWorkerDetails } from "./steps/step-worker-details"
import { useCreateEntries } from "@/hooks/use-construction-timesheet"
import type { CreateTimesheetPayload } from "@/types/construction-timesheet"

export function RegistrationWizard() {
  const { state, isOpen, close, dispatch } = useWizard()
  const createEntries = useCreateEntries()

  async function handleSubmit() {
    if (
      !state.selectedProjectTrackerId ||
      !state.selectedProjectPlanId ||
      state.workerEntries.length === 0
    ) {
      return
    }

    const entries: CreateTimesheetPayload[] = state.workerEntries.map(
      (we) => ({
        date: state.date,
        personId: we.workerId,
        hours: we.hours,
        projectId: state.selectedProjectTrackerId!,
        projectPlanId: state.selectedProjectPlanId!,
        detailId: we.detailId || undefined,
        tipoDeHoras: we.tipoDeHoras,
        comments: we.comments || undefined,
      })
    )

    try {
      const result = await createEntries.mutateAsync(entries)
      toast.success(
        `${result.created} registro${result.created !== 1 ? "s" : ""} creado${result.created !== 1 ? "s" : ""}`
      )
      dispatch({ type: "RESET" })
      close()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al registrar horas"
      )
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[100dvh] !w-full !max-w-full !border-t-0 p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">Registrar Horas</SheetTitle>
        <WizardHeader />

        <div className="flex-1 overflow-y-auto">
          {state.step === 1 && <StepProject />}
          {state.step === 2 && <StepProjectPlan />}
          {state.step === 3 && <StepWorkers />}
          {state.step === 4 && <StepWorkerDetails />}
        </div>

        <WizardFooter
          onSubmit={handleSubmit}
          isSubmitting={createEntries.isPending}
        />
      </SheetContent>
    </Sheet>
  )
}
