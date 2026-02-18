"use client"

import { createContext, useContext } from "react"
import type { Project } from "@/lib/data/interfaces/projects"

interface ProjectContextValue {
  project: Project
  airtableBaseId: string
}

export const ProjectContext = createContext<ProjectContextValue | null>(null)

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}

export function useProjectOptional() {
  return useContext(ProjectContext)
}
