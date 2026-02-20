import { NextRequest, NextResponse } from "next/server"
import { getTimesheetBaseId } from "@/lib/data/providers/airtable/utils"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!
const AIRTABLE_BASE_URL = "https://api.airtable.com/v0"

interface AirtableRecord {
  id: string
  fields: Record<string, unknown>
}

interface AirtablePage {
  records: AirtableRecord[]
  offset?: string
}

/** Fetch from Project Plan Access with optional filter, paginating all pages */
async function fetchPPA(baseId: string, formula?: string): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = []
  let offset: string | undefined

  do {
    const params = new URLSearchParams({ pageSize: "100" })
    if (formula) params.set("filterByFormula", formula)
    if (offset) params.set("offset", offset)

    const url = `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent("Project Plan Access")}?${params}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`Airtable error: ${res.status} — ${err?.error?.message ?? res.statusText}`)
    }

    const page: AirtablePage = await res.json()
    allRecords.push(...page.records)
    offset = page.offset
  } while (offset)

  return allRecords
}

/** Fetch a single Amarilla record by email */
async function fetchAmarillaByEmail(baseId: string, email: string): Promise<AirtableRecord | null> {
  const params = new URLSearchParams({
    filterByFormula: `{Email} = '${email}'`,
    maxRecords: "1",
  })
  const url = `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent("Amarilla")}?${params}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Amarilla lookup failed: ${res.status}`)
  }

  const data: AirtablePage = await res.json()
  return data.records[0] ?? null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")

    if (!userEmail) {
      return NextResponse.json({ userAccess: [], planWorkerMap: {} })
    }

    const baseId = getTimesheetBaseId()

    // 1. Find the user's Amarilla record by email
    const amarillaRecord = await fetchAmarillaByEmail(baseId, userEmail)

    if (!amarillaRecord) {
      return NextResponse.json({ userAccess: [], planWorkerMap: {} })
    }

    const personRecordId = amarillaRecord.id

    // 2. Fetch ONLY records that have Project Plans or Active set
    // Uses two targeted queries instead of paginating all ~3600 records
    const [withPlans, withActive] = await Promise.all([
      fetchPPA(baseId, `IF({Project Plans}, TRUE())`),
      fetchPPA(baseId, `{Active} = TRUE()`),
    ])

    // Merge and deduplicate by record ID
    const recordMap = new Map<string, AirtableRecord>()
    for (const r of [...withPlans, ...withActive]) {
      recordMap.set(r.id, r)
    }
    const relevantRecords = Array.from(recordMap.values())

    // 3. Build userAccess — the logged-in user's own access entries (for Step 2)
    const userAccess = relevantRecords
      .filter((r) => {
        const personIds = r.fields["Person"] as string[] | undefined
        return personIds?.includes(personRecordId)
      })
      .map((r) => ({
        projectPlanIds: (r.fields["Project Plans"] as string[] | undefined) ?? [],
        active: (r.fields["Active"] as boolean) ?? false,
      }))

    // 4. Build planWorkerMap — for each project plan, which workers have access (for Step 3)
    const planWorkerMap: Record<string, { personIds: string[]; hasActive: boolean }> = {}

    for (const r of relevantRecords) {
      const personIds = r.fields["Person"] as string[] | undefined
      const planIds = r.fields["Project Plans"] as string[] | undefined
      const active = (r.fields["Active"] as boolean) ?? false

      if (!personIds || personIds.length === 0) continue

      if (planIds && planIds.length > 0) {
        for (const planId of planIds) {
          if (!planWorkerMap[planId]) {
            planWorkerMap[planId] = { personIds: [], hasActive: false }
          }
          planWorkerMap[planId].personIds.push(...personIds)
          if (active) planWorkerMap[planId].hasActive = true
        }
      }

      // If active=true, this person has access to ALL plans
      if (active) {
        if (!planWorkerMap["__active__"]) {
          planWorkerMap["__active__"] = { personIds: [], hasActive: true }
        }
        planWorkerMap["__active__"].personIds.push(...personIds)
      }
    }

    return NextResponse.json(
      { userAccess, planWorkerMap },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("Error fetching project plan access:", error)
    return NextResponse.json(
      { error: "Error al cargar acceso a project plans" },
      { status: 500 }
    )
  }
}
