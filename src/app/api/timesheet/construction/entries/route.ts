import { NextRequest, NextResponse } from "next/server"
import {
  airtableFetch,
  airtableCreate,
} from "@/lib/data/providers/airtable/client"
import { getTimesheetBaseId } from "@/lib/data/providers/airtable/utils"
import { createEntriesSchema } from "@/lib/validations/construction-timesheet"
import type { TimesheetRecord } from "@/types/construction-timesheet"

function mapRecord(r: {
  id: string
  fields: Record<string, unknown>
  createdTime: string
}): TimesheetRecord {
  return {
    id: r.id,
    date: (r.fields["Date"] as string) ?? "",
    personId: ((r.fields["Person"] as string[]) ?? [])[0] ?? "",
    personName:
      ((r.fields["Person Name"] as string[]) ?? [])[0] ??
      ((r.fields["Person"] as string[]) ?? [])[0] ??
      "",
    hours: (r.fields["Hours"] as number) ?? 0,
    projectId: ((r.fields["Project Selected"] as string[]) ?? [])[0] ?? "",
    projectName:
      ((r.fields["Project Name"] as string[]) ?? [])[0] ??
      ((r.fields["Project Selected"] as string[]) ?? [])[0] ??
      "",
    projectPlanId: ((r.fields["Project Plan"] as string[]) ?? [])[0] ?? "",
    projectPlanName:
      ((r.fields["Project Plan Name"] as string[]) ?? [])[0] ??
      ((r.fields["Project Plan"] as string[]) ?? [])[0] ??
      "",
    detailId: ((r.fields["Detail"] as string[]) ?? [])[0] ?? null,
    detailName:
      ((r.fields["Detail Name"] as string[]) ?? [])[0] ?? null,
    tipoDeHoras:
      (r.fields["Tipo de Horas"] as TimesheetRecord["tipoDeHoras"]) ??
      "Horas normales",
    comments: (r.fields["Comments"] as string) ?? "",
    status: (r.fields["Status"] as string) ?? "",
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const projectId = searchParams.get("projectId")

    if (!date) {
      return NextResponse.json(
        { error: "Parametro date requerido" },
        { status: 400 }
      )
    }

    const baseId = getTimesheetBaseId()
    const formulaParts: string[] = [`{Date} = '${date}'`]

    if (projectId) {
      formulaParts.push(`FIND("${projectId}", ARRAYJOIN({Project Selected}))`)
    }

    const filterByFormula =
      formulaParts.length > 1
        ? `AND(${formulaParts.join(", ")})`
        : formulaParts[0]

    const result = await airtableFetch(baseId, "Timesheet", {
      filterByFormula,
      sort: [{ field: "Date", direction: "desc" }],
      maxRecords: 500,
    })

    const entries = result.records.map(mapRecord)

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Error fetching entries:", error)
    return NextResponse.json(
      { error: "Error al cargar entradas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createEntriesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { entries } = parsed.data
    const baseId = getTimesheetBaseId()

    // Check existing hours for each worker on the date
    const date = entries[0].date

    const existingResult = await airtableFetch(baseId, "Timesheet", {
      filterByFormula: `{Date} = '${date}'`,
      maxRecords: 500,
    })

    const existingHoursByPerson: Record<string, number> = {}
    for (const r of existingResult.records) {
      const pid = ((r.fields["Person"] as string[]) ?? [])[0]
      if (pid) {
        existingHoursByPerson[pid] =
          (existingHoursByPerson[pid] ?? 0) +
          ((r.fields["Hours"] as number) ?? 0)
      }
    }

    // Validate no one exceeds 10 hours
    const errors: string[] = []
    for (const entry of entries) {
      const existing = existingHoursByPerson[entry.personId] ?? 0
      if (existing + entry.hours > 10) {
        errors.push(
          `Trabajador ${entry.personId} excederia 10 horas (tiene ${existing}h, intentando agregar ${entry.hours}h)`
        )
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Limite de horas excedido", details: errors },
        { status: 422 }
      )
    }

    // Create records one by one (Airtable single record create)
    const created: TimesheetRecord[] = []
    for (const entry of entries) {
      // "Project Selected" is computed from Project Plan — don't write it
      const fields: Record<string, unknown> = {
        Date: entry.date,
        Person: [entry.personId],
        Hours: entry.hours,
        "Project Plan": [entry.projectPlanId],
        "Tipo de Horas": entry.tipoDeHoras,
      }
      if (entry.detailId) {
        fields["Detail"] = [entry.detailId]
      }
      if (entry.comments) {
        fields["Comments"] = entry.comments
      }

      console.log("Creating timesheet entry with fields:", JSON.stringify(fields, null, 2))
      const record = await airtableCreate(baseId, "Timesheet", fields)
      created.push(mapRecord(record))
    }

    return NextResponse.json({ created: created.length, records: created })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido"
    console.error("Error creating entries:", message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
