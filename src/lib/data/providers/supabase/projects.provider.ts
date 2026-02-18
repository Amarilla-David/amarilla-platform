import type {
  IProjectsProvider,
  Project,
  ProjectFilters,
} from "@/lib/data/interfaces/projects"
import type { PaginatedResult } from "@/lib/data/interfaces/base"

export class SupabaseProjectsProvider implements IProjectsProvider {
  async getProjects(
    _filters?: ProjectFilters
  ): Promise<PaginatedResult<Project>> {
    throw new Error("Supabase projects provider not yet implemented")
  }

  async getProjectById(_id: string): Promise<Project | null> {
    throw new Error("Supabase projects provider not yet implemented")
  }

  async createProject(
    _project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    throw new Error("Supabase projects provider not yet implemented")
  }

  async updateProject(
    _id: string,
    _data: Partial<Project>
  ): Promise<Project> {
    throw new Error("Supabase projects provider not yet implemented")
  }
}
