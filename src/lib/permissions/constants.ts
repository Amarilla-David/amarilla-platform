import type { Role, Resource, AccessLevel } from "@/types/permissions"

export const ACCESS_LEVEL_HIERARCHY: Record<AccessLevel, number> = {
  read: 1,
  write: 2,
  admin: 3,
}

export const DEFAULT_ROLE_PERMISSIONS: Record<
  Role,
  { resources: Resource[]; defaultLevel: AccessLevel }
> = {
  admin: {
    resources: [
      "timesheet",
      "budgets",
      "documents",
      "schedules",
      "admin",
      "projects",
    ],
    defaultLevel: "admin",
  },
  manager: {
    resources: ["timesheet", "budgets", "documents", "schedules", "projects"],
    defaultLevel: "write",
  },
  employee: {
    resources: ["timesheet"],
    defaultLevel: "read",
  },
  client: {
    resources: ["documents", "schedules"],
    defaultLevel: "read",
  },
}

export interface NavItem {
  label: string
  href: string
  icon: string
  resource: Resource
  requiredLevel: AccessLevel
  mobileNav: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
  },
  {
    label: "Timesheet",
    href: "/timesheet",
    icon: "Clock",
    resource: "timesheet",
    requiredLevel: "read",
    mobileNav: true,
  },
  {
    label: "Proyectos",
    href: "/projects",
    icon: "FolderKanban",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
  },
  {
    label: "Documentos",
    href: "/documents",
    icon: "FileText",
    resource: "documents",
    requiredLevel: "read",
    mobileNav: false,
  },
  {
    label: "Presupuestos",
    href: "/budgets",
    icon: "DollarSign",
    resource: "budgets",
    requiredLevel: "read",
    mobileNav: false,
  },
  {
    label: "Cronograma",
    href: "/schedules",
    icon: "CalendarDays",
    resource: "schedules",
    requiredLevel: "read",
    mobileNav: false,
  },
  {
    label: "Admin",
    href: "/admin/users",
    icon: "Shield",
    resource: "admin",
    requiredLevel: "admin",
    mobileNav: false,
  },
]
