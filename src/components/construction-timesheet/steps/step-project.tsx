"use client"

import { useState } from "react"
import { Search, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useConstructionProjects } from "@/hooks/use-construction-timesheet"
import { useWizard } from "../wizard-provider"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function StepProject() {
  const { dispatch } = useWizard()
  const { data, isLoading } = useConstructionProjects()
  const [search, setSearch] = useState("")
  const t = useTranslations("timesheet.wizard")

  const projects = (data?.projects ?? []).filter((p) =>
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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchProject")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() =>
              dispatch({
                type: "SELECT_PROJECT",
                projectId: project.id,
                trackerId: project.trackerId,
                projectName: project.name,
              })
            }
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border bg-card",
              "hover:border-primary hover:shadow-sm transition-all",
              "active:scale-[0.98] text-left min-h-[56px]"
            )}
          >
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <span className="font-medium">{project.name}</span>
          </button>
        ))}

        {projects.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {t("noProjects")}
          </p>
        )}
      </div>
    </div>
  )
}
