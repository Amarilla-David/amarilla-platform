import { NextRequest, NextResponse } from "next/server"
import { airtableFetch } from "@/lib/data/providers/airtable/client"
import { getTimesheetBaseId } from "@/lib/data/providers/airtable/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectPlanId = searchParams.get("projectPlanId")

    const baseId = getTimesheetBaseId()

    const options: Parameters<typeof airtableFetch>[2] = {
      sort: [{ field: "Detail Name", direction: "asc" }],
      maxRecords: 500,
    }

    // Detail table may not have a direct Project Plan link.
    // If it does, filter; otherwise fetch all.
    if (projectPlanId) {
      options.filterByFormula = `FIND("${projectPlanId}", ARRAYJOIN({Project Plan}))`
    }

    let result;
    try {
      result = await airtableFetch(baseId, "Detail", options)
    } catch {
      // If filter fails (no Project Plan field in Detail), fetch all
      delete options.filterByFormula
      result = await airtableFetch(baseId, "Detail", options)
    }

    const details = result.records
      .filter((r) => r.fields["Detail Name"])
      .map((r) => ({
        id: r.id,
        name: (r.fields["Detail Name"] as string) ?? r.id,
      }))

    return NextResponse.json({ details })
  } catch (error) {
    console.error("Error fetching details:", error)
    return NextResponse.json(
      { error: "Error al cargar detalles" },
      { status: 500 }
    )
  }
}
