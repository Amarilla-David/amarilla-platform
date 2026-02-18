/**
 * Extracts the Airtable base ID (appXXX) from the env var
 * which may contain "appXXX/tblXXX/viwXXX".
 */
export function getTimesheetBaseId(): string {
  const raw = process.env.AIRTABLE_TIMESHEET_BASE_ID!
  return raw.split("/")[0]
}
