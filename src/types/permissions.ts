export type Role = "admin" | "manager" | "employee" | "client"

export type Resource =
  | "timesheet"
  | "budgets"
  | "documents"
  | "schedules"
  | "admin"
  | "projects"

export type AccessLevel = "read" | "write" | "admin"

export interface UserPermission {
  id: string
  user_id: string
  resource: Resource
  project_id: string | null
  access_level: AccessLevel
  granted_by: string | null
  created_at: string
}

export interface PermissionCheck {
  resource: Resource
  projectId?: string | null
  requiredLevel?: AccessLevel
}
