import type { QueryFilters, PaginatedResult } from "./base"

export interface Project {
  id: string
  name: string
  clientName: string | null
  status: "active" | "completed" | "archived"
  airtableBaseId: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectFilters extends QueryFilters {
  status?: Project["status"]
}

export interface IProjectsProvider {
  getProjects(filters?: ProjectFilters): Promise<PaginatedResult<Project>>
  getProjectById(id: string): Promise<Project | null>
  createProject(
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project>
  updateProject(id: string, data: Partial<Project>): Promise<Project>
}
