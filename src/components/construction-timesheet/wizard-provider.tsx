"use client"

import {
  createContext,
  useContext,
  useReducer,
  useState,
  useCallback,
} from "react"
import type {
  WizardState,
  WizardAction,
  TipoDeHoras,
} from "@/types/construction-timesheet"

function getToday() {
  return new Date().toISOString().split("T")[0]
}

function initialState(): WizardState {
  return {
    step: 1,
    date: getToday(),
    selectedProjectId: null,
    selectedProjectTrackerId: null,
    selectedProjectName: null,
    selectedProjectPlanId: null,
    selectedProjectPlanName: null,
    selectedWorkerIds: [],
    workerEntries: [],
  }
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SELECT_PROJECT":
      return {
        ...initialState(),
        date: state.date,
        step: 2,
        selectedProjectId: action.projectId,
        selectedProjectTrackerId: action.trackerId,
        selectedProjectName: action.projectName,
      }
    case "SELECT_PROJECT_PLAN":
      return {
        ...state,
        step: 3,
        selectedProjectPlanId: action.planId,
        selectedProjectPlanName: action.planName,
        selectedWorkerIds: [],
        workerEntries: [],
      }
    case "TOGGLE_WORKER": {
      const exists = state.selectedWorkerIds.includes(action.workerId)
      if (exists) {
        return {
          ...state,
          selectedWorkerIds: state.selectedWorkerIds.filter(
            (id) => id !== action.workerId
          ),
          workerEntries: state.workerEntries.filter(
            (e) => e.workerId !== action.workerId
          ),
        }
      }
      return {
        ...state,
        selectedWorkerIds: [...state.selectedWorkerIds, action.workerId],
        workerEntries: [
          ...state.workerEntries,
          {
            workerId: action.workerId,
            workerName: action.workerName,
            hours: 8,
            detailId: "",
            detailName: "",
            tipoDeHoras: "Horas normales" as TipoDeHoras,
            comments: "",
          },
        ],
      }
    }
    case "SELECT_ALL_WORKERS":
      return {
        ...state,
        selectedWorkerIds: action.workers.map((w) => w.id),
        workerEntries: action.workers.map((w) => ({
          workerId: w.id,
          workerName: w.name,
          hours: 8,
          detailId: "",
          detailName: "",
          tipoDeHoras: "Horas normales" as TipoDeHoras,
          comments: "",
        })),
      }
    case "DESELECT_ALL_WORKERS":
      return { ...state, selectedWorkerIds: [], workerEntries: [] }
    case "UPDATE_WORKER_ENTRY":
      return {
        ...state,
        workerEntries: state.workerEntries.map((e) =>
          e.workerId === action.workerId
            ? { ...e, [action.field]: action.value }
            : e
        ),
      }
    case "SET_STEP":
      return { ...state, step: action.step }
    case "RESET":
      return initialState()
    default:
      return state
  }
}

interface WizardContextValue {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  isOpen: boolean
  open: () => void
  close: () => void
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, undefined, initialState)
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    dispatch({ type: "RESET" })
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <WizardContext.Provider value={{ state, dispatch, isOpen, open, close }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be used within WizardProvider")
  return ctx
}
