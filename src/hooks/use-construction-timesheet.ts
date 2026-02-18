"use client"

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import type {
  ConstructionProject,
  Worker,
  ProjectPlan,
  DetailOption,
  TimesheetRecord,
  CreateTimesheetPayload,
} from "@/types/construction-timesheet"

// ── Query keys ────────────────────────────────────────────────

export const ctKeys = {
  all: ["construction-timesheet"] as const,
  projects: () => [...ctKeys.all, "projects"] as const,
  workers: (projectId: string) =>
    [...ctKeys.all, "workers", projectId] as const,
  projectPlans: (projectId: string) =>
    [...ctKeys.all, "project-plans", projectId] as const,
  details: (projectPlanId: string) =>
    [...ctKeys.all, "details", projectPlanId] as const,
  entries: (date: string, projectId?: string) =>
    [...ctKeys.all, "entries", date, projectId ?? "all"] as const,
}

// ── Hooks ─────────────────────────────────────────────────────

export function useConstructionProjects() {
  return useQuery<{
    projects: ConstructionProject[]
    projectPlanMap: Record<string, string[]>
  }>({
    queryKey: ctKeys.projects(),
    queryFn: () =>
      fetch("/api/timesheet/construction/projects").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })
}

export function useWorkers(projectId: string | null, projectName?: string | null) {
  // Extract the project code from "CODE - Name" format (e.g. "FLAM" from "FLAM - Flamingo Residence")
  const projectCode = projectName?.split(" - ")[0]?.trim() ?? ""
  return useQuery<{ workers: Worker[] }>({
    queryKey: ctKeys.workers(projectId!),
    queryFn: () => {
      const params = new URLSearchParams()
      if (projectCode) params.set("projectCode", projectCode)
      return fetch(
        `/api/timesheet/construction/workers?${params}`
      ).then((r) => r.json())
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useProjectPlans(planIds: string[]) {
  const idsKey = planIds.join(",")
  return useQuery<{ projectPlans: ProjectPlan[] }>({
    queryKey: ctKeys.projectPlans(idsKey),
    queryFn: () =>
      fetch(
        `/api/timesheet/construction/project-plans?ids=${idsKey}`
      ).then((r) => r.json()),
    enabled: planIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDetails(projectPlanId: string | null) {
  return useQuery<{ details: DetailOption[] }>({
    queryKey: ctKeys.details(projectPlanId!),
    queryFn: () =>
      fetch(
        `/api/timesheet/construction/details?projectPlanId=${projectPlanId}`
      ).then((r) => r.json()),
    enabled: !!projectPlanId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDailyEntries(date: string, projectId?: string) {
  return useQuery<{ entries: TimesheetRecord[] }>({
    queryKey: ctKeys.entries(date, projectId),
    queryFn: () => {
      const params = new URLSearchParams({ date })
      if (projectId) params.set("projectId", projectId)
      return fetch(
        `/api/timesheet/construction/entries?${params}`
      ).then((r) => r.json())
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateEntries() {
  const queryClient = useQueryClient()
  return useMutation<
    { created: number; records: TimesheetRecord[] },
    Error,
    CreateTimesheetPayload[]
  >({
    mutationFn: (entries) =>
      fetch("/api/timesheet/construction/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json()
          throw new Error(err.error ?? "Error al crear entradas")
        }
        return r.json()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ctKeys.all })
    },
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (recordId) =>
      fetch(`/api/timesheet/construction/entries/${recordId}`, {
        method: "DELETE",
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json()
          throw new Error(err.error ?? "Error al eliminar")
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ctKeys.all })
    },
  })
}
