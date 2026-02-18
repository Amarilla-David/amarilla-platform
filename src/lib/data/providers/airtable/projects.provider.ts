import type {
  IProjectsProvider,
  Project,
  ProjectFilters,
} from "@/lib/data/interfaces/projects"
import type { PaginatedResult } from "@/lib/data/interfaces/base"
import {
  airtableFetch,
  airtableCreate,
  airtableUpdate,
  type AirtableRecord,
} from "./client"

const BASE_ID = process.env.AIRTABLE_TIMESHEET_BASE_ID!
const TABLE_NAME = "Projects"

function mapToProject(record: AirtableRecord): Project {
  return {
    id: record.id,
    name: (record.fields["Name"] as string) ?? "",
    clientName: (record.fields["Client Name"] as string) ?? null,
    status: (
      ((record.fields["Status"] as string) ?? "active").toLowerCase() as Project["status"]
    ),
    airtableBaseId: (record.fields["Base ID"] as string) ?? null,
    createdAt: record.createdTime,
    updatedAt: record.createdTime,
  }
}

export class AirtableProjectsProvider implements IProjectsProvider {
  async getProjects(
    filters?: ProjectFilters
  ): Promise<PaginatedResult<Project>> {
    const formulaParts: string[] = []

    if (filters?.status) {
      formulaParts.push(`{Status} = '${filters.status}'`)
    }
    if (filters?.search) {
      formulaParts.push(`SEARCH('${filters.search}', {Name})`)
    }

    const filterByFormula =
      formulaParts.length > 0
        ? `AND(${formulaParts.join(", ")})`
        : undefined

    const result = await airtableFetch(BASE_ID, TABLE_NAME, {
      filterByFormula,
      sort: [{ field: "Name", direction: "asc" }],
      maxRecords: filters?.pageSize ?? 50,
    })

    const projects = result.records.map(mapToProject)

    return {
      data: projects,
      total: projects.length,
      page: filters?.page ?? 1,
      pageSize: filters?.pageSize ?? 50,
      hasMore: !!result.offset,
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
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
      return mapToProject(record)
    } catch {
      return null
    }
  }

  async createProject(
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    const record = await airtableCreate(BASE_ID, TABLE_NAME, {
      Name: project.name,
      "Client Name": project.clientName,
      Status: project.status,
      "Base ID": project.airtableBaseId,
    })
    return mapToProject(record)
  }

  async updateProject(
    id: string,
    data: Partial<Project>
  ): Promise<Project> {
    const fields: Record<string, unknown> = {}
    if (data.name) fields["Name"] = data.name
    if (data.clientName !== undefined) fields["Client Name"] = data.clientName
    if (data.status) fields["Status"] = data.status
    if (data.airtableBaseId !== undefined)
      fields["Base ID"] = data.airtableBaseId

    const record = await airtableUpdate(BASE_ID, TABLE_NAME, id, fields)
    return mapToProject(record)
  }
}
