import { NextRequest, NextResponse } from "next/server"
import { airtableFetch } from "@/lib/data/providers/airtable/client"
import { getTimesheetBaseId } from "@/lib/data/providers/airtable/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectCode = searchParams.get("projectCode")

    const baseId = getTimesheetBaseId()

    // "Projects (Active)" is a synced text field with the project code (e.g. "FLAM")
    // Use FIND to filter workers assigned to the selected project
    const options: Parameters<typeof airtableFetch>[2] = {
      sort: [{ field: "Person", direction: "asc" }],
      maxRecords: 500,
    }

    if (projectCode) {
      options.filterByFormula = `FIND("${projectCode}", {Projects (Active)})`
    }

    const result = await airtableFetch(baseId, "Amarilla", options)

    const workers = result.records
      .filter((r) => {
        const name = r.fields["Person"] as string | undefined
        return name && name.trim() !== "" && name.trim() !== ";"
      })
      .map((r) => ({
        id: r.id,
        name: (r.fields["Person"] as string).trim(),
      }))

    return NextResponse.json({ workers })
  } catch (error) {
    console.error("Error fetching workers:", error)
    return NextResponse.json(
      { error: "Error al cargar trabajadores" },
      { status: 500 }
    )
  }
}
