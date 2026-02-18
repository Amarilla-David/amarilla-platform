import { NextResponse } from "next/server"
import { airtableFetch } from "@/lib/data/providers/airtable/client"
import { getTimesheetBaseId } from "@/lib/data/providers/airtable/utils"

export async function GET() {
  try {
    const baseId = getTimesheetBaseId()

    // Get ALL unique field names from Timesheet (scan 50 records)
    const result = await airtableFetch(baseId, "Timesheet", { maxRecords: 50 })
    const allFieldNames = new Set<string>()
    for (const r of result.records) {
      for (const key of Object.keys(r.fields)) {
        allFieldNames.add(key)
      }
    }

    // Show a sample record with ALL fields
    const sample = result.records[0]

    return NextResponse.json({
      allFieldNames: [...allFieldNames].sort(),
      sampleRecord: sample ? { id: sample.id, fields: sample.fields } : null,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
