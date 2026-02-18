import type { Project } from "@/lib/data/interfaces/projects"

export interface ProjectContext {
  project: Project
  airtableBaseId: string
}

export type ProjectStatus = "active" | "completed" | "archived"

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "En Construccion",
  completed: "Completado",
  archived: "Archivado",
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  archived: "bg-gray-50 text-gray-700 border-gray-200",
}
