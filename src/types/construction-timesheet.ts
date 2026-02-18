// ── Tipo de Horas ──────────────────────────────────────────────

export type TipoDeHoras =
  | "Horas normales"
  | "Feriado"
  | "Fallecimiento familiar"
  | "Falta justificada"
  | "ART"
  | "Lluvia"
  | "Vacaciones"
  | "Suspension"
  | "Casamiento"
  | "Ausente"
  | "Certificado Medico"
  | "Horas extras"

export const TIPO_DE_HORAS_OPTIONS: TipoDeHoras[] = [
  "Horas normales",
  "Horas extras",
  "Feriado",
  "Lluvia",
  "Vacaciones",
  "Falta justificada",
  "ART",
  "Certificado Medico",
  "Fallecimiento familiar",
  "Suspension",
  "Casamiento",
  "Ausente",
]

// ── Domain types (mapped from Airtable) ───────────────────────

export interface ConstructionProject {
  id: string
  /** Project Tracker record ID — used for Timesheet's "Project Selected" field */
  trackerId: string
  name: string
}

export interface Worker {
  id: string
  name: string
}

export interface ProjectPlan {
  id: string
  name: string
}

export interface DetailOption {
  id: string
  name: string
}

export interface TimesheetRecord {
  id: string
  date: string
  personId: string
  personName: string
  hours: number
  projectId: string
  projectName: string
  projectPlanId: string
  projectPlanName: string
  detailId: string | null
  detailName: string | null
  tipoDeHoras: TipoDeHoras
  comments: string
  status: string
}

// ── Wizard state ──────────────────────────────────────────────

export interface WorkerEntry {
  workerId: string
  workerName: string
  hours: number
  detailId: string
  detailName: string
  tipoDeHoras: TipoDeHoras
  comments: string
}

export interface WizardState {
  step: 1 | 2 | 3 | 4
  date: string
  selectedProjectId: string | null
  /** Project Tracker record ID — used for Timesheet "Project Selected" */
  selectedProjectTrackerId: string | null
  selectedProjectName: string | null
  selectedProjectPlanId: string | null
  selectedProjectPlanName: string | null
  selectedWorkerIds: string[]
  workerEntries: WorkerEntry[]
}

export type WizardAction =
  | { type: "SELECT_PROJECT"; projectId: string; trackerId: string; projectName: string }
  | { type: "SELECT_PROJECT_PLAN"; planId: string; planName: string }
  | { type: "TOGGLE_WORKER"; workerId: string; workerName: string }
  | {
      type: "SELECT_ALL_WORKERS"
      workers: { id: string; name: string }[]
    }
  | { type: "DESELECT_ALL_WORKERS" }
  | {
      type: "UPDATE_WORKER_ENTRY"
      workerId: string
      field: keyof WorkerEntry
      value: string | number
    }
  | { type: "SET_STEP"; step: WizardState["step"] }
  | { type: "RESET" }

// ── API payload ───────────────────────────────────────────────

export interface CreateTimesheetPayload {
  date: string
  personId: string
  hours: number
  projectId: string
  projectPlanId: string
  detailId?: string
  tipoDeHoras: TipoDeHoras
  comments?: string
}
