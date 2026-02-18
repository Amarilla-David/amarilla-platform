import { NextRequest, NextResponse } from "next/server"
import { airtableFetch } from "@/lib/data/providers/airtable/client"
import { getTimesheetBaseId } from "@/lib/data/providers/airtable/utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Comma-separated list of plan record IDs
    const ids = searchParams.get("ids")

    if (!ids) {
      return NextResponse.json({ projectPlans: [] })
    }

    const planIds = ids.split(",").filter(Boolean)
    if (planIds.length === 0) {
      return NextResponse.json({ projectPlans: [] })
    }

    const baseId = getTimesheetBaseId()

    // Fetch plans by their record IDs
    const orParts = planIds.map((id) => `RECORD_ID() = '${id}'`)
    const filterByFormula = `OR(${orParts.join(", ")})`

    const result = await airtableFetch(baseId, "Project Plan", {
      filterByFormula,
      sort: [{ field: "Project Plan Code", direction: "asc" }],
      maxRecords: 500,
    })

    const projectPlans = result.records
      .filter((r) => {
        // Only include plans that have a Planning linked record
        const planning = r.fields["Planning"] as string[] | undefined
        return planning && planning.length > 0
      })
      .map((r) => ({
        id: r.id,
        name:
          (r.fields["Project Plan New"] as string) ??
          (r.fields["Project Plan Code"] as string) ??
          r.id,
      }))

    return NextResponse.json({ projectPlans })
  } catch (error) {
    console.error("Error fetching project plans:", error)
    return NextResponse.json(
      { error: "Error al cargar project plans" },
      { status: 500 }
    )
  }
}
