import type { QueryFilters, PaginatedResult } from "./base"

export interface TimesheetEntry {
  id: string
  userId: string
  projectId: string
  date: string
  hoursWorked: number
  category: string
  notes?: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
}

export interface TimesheetFilters extends QueryFilters {
  dateFrom?: string
  dateTo?: string
  projectId?: string
  userId?: string
  status?: TimesheetEntry["status"]
}

export interface ITimesheetProvider {
  getEntries(
    filters?: TimesheetFilters
  ): Promise<PaginatedResult<TimesheetEntry>>
  getEntryById(id: string): Promise<TimesheetEntry | null>
  createEntry(
    entry: Omit<TimesheetEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<TimesheetEntry>
  updateEntry(
    id: string,
    data: Partial<TimesheetEntry>
  ): Promise<TimesheetEntry>
  deleteEntry(id: string): Promise<void>
}
