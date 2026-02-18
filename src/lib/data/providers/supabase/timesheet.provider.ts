import type {
  ITimesheetProvider,
  TimesheetEntry,
  TimesheetFilters,
} from "@/lib/data/interfaces/timesheet"
import type { PaginatedResult } from "@/lib/data/interfaces/base"

export class SupabaseTimesheetProvider implements ITimesheetProvider {
  async getEntries(
    _filters?: TimesheetFilters
  ): Promise<PaginatedResult<TimesheetEntry>> {
    throw new Error("Supabase timesheet provider not yet implemented")
  }

  async getEntryById(_id: string): Promise<TimesheetEntry | null> {
    throw new Error("Supabase timesheet provider not yet implemented")
  }

  async createEntry(
    _entry: Omit<TimesheetEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<TimesheetEntry> {
    throw new Error("Supabase timesheet provider not yet implemented")
  }

  async updateEntry(
    _id: string,
    _data: Partial<TimesheetEntry>
  ): Promise<TimesheetEntry> {
    throw new Error("Supabase timesheet provider not yet implemented")
  }

  async deleteEntry(_id: string): Promise<void> {
    throw new Error("Supabase timesheet provider not yet implemented")
  }
}
