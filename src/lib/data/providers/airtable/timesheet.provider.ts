import type {
  ITimesheetProvider,
  TimesheetEntry,
  TimesheetFilters,
} from "@/lib/data/interfaces/timesheet"
import type { PaginatedResult } from "@/lib/data/interfaces/base"
import {
  airtableFetch,
  airtableCreate,
  airtableUpdate,
  airtableDelete,
  type AirtableRecord,
} from "./client"

const BASE_ID = process.env.AIRTABLE_TIMESHEET_BASE_ID!
const TABLE_NAME = "Timesheet"

function mapToEntry(record: AirtableRecord): TimesheetEntry {
  return {
    id: record.id,
    userId: (record.fields["User ID"] as string) ?? "",
    projectId: (record.fields["Project ID"] as string) ?? "",
    date: (record.fields["Date"] as string) ?? "",
    hoursWorked: (record.fields["Hours"] as number) ?? 0,
    category: (record.fields["Category"] as string) ?? "",
    notes: record.fields["Notes"] as string | undefined,
    status: (
      ((record.fields["Status"] as string) ?? "pending").toLowerCase() as TimesheetEntry["status"]
    ),
    createdAt: record.createdTime,
    updatedAt: record.createdTime,
  }
}

export class AirtableTimesheetProvider implements ITimesheetProvider {
  async getEntries(
    filters?: TimesheetFilters
  ): Promise<PaginatedResult<TimesheetEntry>> {
    const formulaParts: string[] = []

    if (filters?.projectId) {
      formulaParts.push(`{Project ID} = '${filters.projectId}'`)
    }
    if (filters?.userId) {
      formulaParts.push(`{User ID} = '${filters.userId}'`)
    }
    if (filters?.dateFrom) {
      formulaParts.push(`IS_AFTER({Date}, '${filters.dateFrom}')`)
    }
    if (filters?.dateTo) {
      formulaParts.push(`IS_BEFORE({Date}, '${filters.dateTo}')`)
    }

    const filterByFormula =
      formulaParts.length > 0
        ? `AND(${formulaParts.join(", ")})`
        : undefined

    const result = await airtableFetch(BASE_ID, TABLE_NAME, {
      filterByFormula,
      sort: [{ field: "Date", direction: "desc" }],
      maxRecords: filters?.pageSize ?? 50,
    })

    const entries = result.records.map(mapToEntry)

    return {
      data: entries,
      total: entries.length,
      page: filters?.page ?? 1,
      pageSize: filters?.pageSize ?? 50,
      hasMore: !!result.offset,
    }
  }

  async getEntryById(id: string): Promise<TimesheetEntry | null> {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
        }
      )
      if (!response.ok) return null
      const record = (await response.json()) as AirtableRecord
      return mapToEntry(record)
    } catch {
      return null
    }
  }

  async createEntry(
    entry: Omit<TimesheetEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<TimesheetEntry> {
    const record = await airtableCreate(BASE_ID, TABLE_NAME, {
      "User ID": entry.userId,
      "Project ID": entry.projectId,
      Date: entry.date,
      Hours: entry.hoursWorked,
      Category: entry.category,
      Notes: entry.notes,
      Status: entry.status,
    })
    return mapToEntry(record)
  }

  async updateEntry(
    id: string,
    data: Partial<TimesheetEntry>
  ): Promise<TimesheetEntry> {
    const fields: Record<string, unknown> = {}
    if (data.hoursWorked !== undefined) fields["Hours"] = data.hoursWorked
    if (data.category) fields["Category"] = data.category
    if (data.notes !== undefined) fields["Notes"] = data.notes
    if (data.status) fields["Status"] = data.status

    const record = await airtableUpdate(BASE_ID, TABLE_NAME, id, fields)
    return mapToEntry(record)
  }

  async deleteEntry(id: string): Promise<void> {
    await airtableDelete(BASE_ID, TABLE_NAME, id)
  }
}
