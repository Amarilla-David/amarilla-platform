const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!
const AIRTABLE_BASE_URL = "https://api.airtable.com/v0"

export interface AirtableRecord<T = Record<string, unknown>> {
  id: string
  fields: T
  createdTime: string
}

interface AirtableListResponse<T = Record<string, unknown>> {
  records: AirtableRecord<T>[]
  offset?: string
}

export async function airtableFetch<T = Record<string, unknown>>(
  baseId: string,
  tableName: string,
  options?: {
    filterByFormula?: string
    sort?: Array<{ field: string; direction: "asc" | "desc" }>
    maxRecords?: number
    pageSize?: number
    offset?: string
    tags?: string[]
    noCache?: boolean
  }
): Promise<AirtableListResponse<T>> {
  const params = new URLSearchParams()

  if (options?.filterByFormula) {
    params.set("filterByFormula", options.filterByFormula)
  }
  if (options?.sort) {
    options.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field)
      params.set(`sort[${i}][direction]`, s.direction)
    })
  }
  if (options?.maxRecords) {
    params.set("maxRecords", options.maxRecords.toString())
  }
  if (options?.pageSize) {
    params.set("pageSize", options.pageSize.toString())
  }
  if (options?.offset) {
    params.set("offset", options.offset)
  }

  const url = `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}?${params}`

  const fetchOptions: RequestInit & { next?: Record<string, unknown> } = {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  }

  if (options?.noCache) {
    fetchOptions.cache = "no-store"
  } else {
    fetchOptions.next = {
      revalidate: 60,
      ...(options?.tags ? { tags: options.tags } : {}),
    }
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    console.error("Airtable fetch error body:", JSON.stringify(errorBody, null, 2))
    throw new Error(
      `Airtable API error: ${response.status} — ${errorBody?.error?.message ?? response.statusText}`
    )
  }

  return response.json()
}

export async function airtableCreate<T = Record<string, unknown>>(
  baseId: string,
  tableName: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord<T>> {
  const url = `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    console.error("Airtable create error body:", JSON.stringify(errorBody, null, 2))
    throw new Error(
      `Airtable create error: ${response.status} — ${errorBody?.error?.message ?? JSON.stringify(errorBody)}`
    )
  }

  return response.json()
}

export async function airtableUpdate<T = Record<string, unknown>>(
  baseId: string,
  tableName: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord<T>> {
  const url = `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  })

  if (!response.ok) {
    throw new Error(`Airtable update error: ${response.status}`)
  }

  return response.json()
}

export async function airtableDelete(
  baseId: string,
  tableName: string,
  recordId: string
): Promise<void> {
  const url = `${AIRTABLE_BASE_URL}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Airtable delete error: ${response.status}`)
  }
}
