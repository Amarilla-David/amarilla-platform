import { NextResponse } from "next/server"
import { airtableFetch } from "@/lib/data/providers/airtable/client"
import { getTimesheetBaseId } from "@/lib/data/providers/airtable/utils"

export async function GET() {
  try {
    const baseId = getTimesheetBaseId()

    // 1. Fetch Project Tracker to get active project IDs + their plan IDs
    const trackerResult = await airtableFetch(baseId, "Project Tracker", {
      maxRecords: 100,
    })

    // Map: shareProjectId → { trackerId, planIds[] }
    const projectToTracker = new Map<
      string,
      { trackerId: string; planIds: string[] }
    >()
    for (const r of trackerResult.records) {
      const projectLinked = r.fields["Project"] as string[] | undefined
      const planLinked = r.fields["Project Plan"] as string[] | undefined
      if (projectLinked) {
        for (const pid of projectLinked) {
          const existing = projectToTracker.get(pid)
          if (existing) {
            existing.planIds.push(...(planLinked ?? []))
          } else {
            projectToTracker.set(pid, {
              trackerId: r.id,
              planIds: [...(planLinked ?? [])],
            })
          }
        }
      }
    }

    const projectIds = [...projectToTracker.keys()]
    if (projectIds.length === 0) {
      return NextResponse.json({ projects: [], projectPlanMap: {} })
    }

    // 2. Fetch those projects from "Share - Projects"
    const orParts = projectIds.map((id) => `RECORD_ID() = '${id}'`)
    const filterByFormula = `OR(${orParts.join(", ")})`

    const result = await airtableFetch(baseId, "Share - Projects", {
      filterByFormula,
      sort: [{ field: "Ref", direction: "asc" }],
      maxRecords: 100,
    })

    const projects = result.records.map((r) => {
      const code =
        (r.fields["Code"] as string) ??
        (r.fields["ID"] as string) ??
        ""
      const ref = (r.fields["Ref"] as string) ?? ""
      const name =
        code && ref ? `${code} - ${ref}` : ref || code || r.id
      const tracker = projectToTracker.get(r.id)
      return {
        id: r.id,
        // trackerId is the Project Tracker record ID — needed for Timesheet's "Project Selected" field
        trackerId: tracker?.trackerId ?? r.id,
        name,
      }
    })

    // 3. Build projectPlanMap: { projectId: ["planId1", "planId2", ...] }
    const projectPlanMap: Record<string, string[]> = {}
    for (const [pid, data] of projectToTracker) {
      projectPlanMap[pid] = [...new Set(data.planIds)]
    }

    return NextResponse.json({ projects, projectPlanMap })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Error al cargar proyectos" },
      { status: 500 }
    )
  }
}
