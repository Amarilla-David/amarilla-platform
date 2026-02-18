import type { ITimesheetProvider } from "./interfaces/timesheet"
import type { IProjectsProvider } from "./interfaces/projects"
import { AirtableTimesheetProvider } from "./providers/airtable/timesheet.provider"
import { SupabaseTimesheetProvider } from "./providers/supabase/timesheet.provider"
import { AirtableProjectsProvider } from "./providers/airtable/projects.provider"
import { SupabaseProjectsProvider } from "./providers/supabase/projects.provider"

type ProviderType = "airtable" | "supabase"

const PROVIDER_CONFIG: Record<string, ProviderType> = {
  timesheet:
    (process.env.NEXT_PUBLIC_TIMESHEET_PROVIDER as ProviderType) || "airtable",
  projects:
    (process.env.NEXT_PUBLIC_PROJECTS_PROVIDER as ProviderType) || "airtable",
}

let timesheetProvider: ITimesheetProvider | null = null
let projectsProvider: IProjectsProvider | null = null

export function getTimesheetProvider(): ITimesheetProvider {
  if (!timesheetProvider) {
    timesheetProvider =
      PROVIDER_CONFIG.timesheet === "supabase"
        ? new SupabaseTimesheetProvider()
        : new AirtableTimesheetProvider()
  }
  return timesheetProvider
}

export function getProjectsProvider(): IProjectsProvider {
  if (!projectsProvider) {
    projectsProvider =
      PROVIDER_CONFIG.projects === "supabase"
        ? new SupabaseProjectsProvider()
        : new AirtableProjectsProvider()
  }
  return projectsProvider
}
