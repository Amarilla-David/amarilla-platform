"use client"

import { useState } from "react"
import { Search, ClipboardList } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  useConstructionProjects,
  useProjectPlans,
} from "@/hooks/use-construction-timesheet"
import { useWizard } from "../wizard-provider"
import { cn } from "@/lib/utils"

export function StepProjectPlan() {
  const { state, dispatch } = useWizard()
  const { data: projectsData } = useConstructionProjects()
  const [search, setSearch] = useState("")

  // Get the plan IDs for the selected project from the projectPlanMap
  const planIds: string[] =
    (state.selectedProjectId
      ? projectsData?.projectPlanMap?.[state.selectedProjectId]
      : undefined) ?? []

  const { data, isLoading } = useProjectPlans(planIds)

  const plans = (data?.projectPlans ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm text-muted-foreground">
        Obra: <span className="font-medium text-foreground">{state.selectedProjectName}</span>
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tarea..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      <div className="space-y-2">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() =>
              dispatch({
                type: "SELECT_PROJECT_PLAN",
                planId: plan.id,
                planName: plan.name,
              })
            }
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border bg-card",
              "hover:border-primary hover:shadow-sm transition-all",
              "active:scale-[0.98] text-left min-h-[56px]"
            )}
          >
            <ClipboardList className="h-5 w-5 text-primary shrink-0" />
            <span className="font-medium">{plan.name}</span>
          </button>
        ))}

        {plans.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No se encontraron tareas para esta obra
          </p>
        )}
      </div>
    </div>
  )
}
