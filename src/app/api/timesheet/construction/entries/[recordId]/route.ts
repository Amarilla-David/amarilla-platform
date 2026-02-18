import { NextRequest, NextResponse } from "next/server"
import {
  airtableUpdate,
  airtableDelete,
} from "@/lib/data/providers/airtable/client"
import { getTimesheetBaseId } from "@/lib/data/providers/airtable/utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params
    const body = await request.json()
    const baseId = getTimesheetBaseId()

    const fields: Record<string, unknown> = {}
    if (body.hours !== undefined) fields["Hours"] = body.hours
    if (body.tipoDeHoras) fields["Tipo de Horas"] = body.tipoDeHoras
    if (body.comments !== undefined) fields["Comments"] = body.comments
    if (body.detailId) fields["Detail"] = [body.detailId]

    await airtableUpdate(baseId, "Timesheet", recordId, fields)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating entry:", error)
    return NextResponse.json(
      { error: "Error al actualizar entrada" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params
    const baseId = getTimesheetBaseId()

    await airtableDelete(baseId, "Timesheet", recordId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting entry:", error)
    return NextResponse.json(
      { error: "Error al eliminar entrada" },
      { status: 500 }
    )
  }
}
