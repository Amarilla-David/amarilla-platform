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
  foreman: {
    resources: ["timesheet"],
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
  section?: string
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

// Navigation items for project-scoped views
// href is relative — prepend /projects/[projectId] at render time
// section: used as header label; "---": renders a divider line
export const PROJECT_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "",
    icon: "LayoutDashboard",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
  },
  {
    label: "Space View",
    href: "/space-view",
    icon: "Box",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    section: "PROJECT DEFINITIONS",
  },
  {
    label: "Product View",
    href: "/product-view",
    icon: "Package",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    section: "PROJECT DEFINITIONS",
  },
  {
    label: "Finish Schedule",
    href: "/finish-schedule",
    icon: "Palette",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    section: "PROJECT DEFINITIONS",
  },
  {
    label: "Takeoff",
    href: "/takeoff",
    icon: "Ruler",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    section: "---",
  },
  {
    label: "Project Team",
    href: "/team",
    icon: "Users",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
    section: "---",
  },
  {
    label: "Permits & Inspections",
    href: "/permits",
    icon: "ClipboardCheck",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    section: "---",
  },
  {
    label: "Budget",
    href: "/budget",
    icon: "DollarSign",
    resource: "budgets",
    requiredLevel: "read",
    mobileNav: true,
    section: "---",
  },
  {
    label: "Schedule",
    href: "/schedule",
    icon: "CalendarDays",
    resource: "schedules",
    requiredLevel: "read",
    mobileNav: true,
    section: "---",
  },
  {
    label: "SCM",
    href: "/scm",
    icon: "Truck",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    section: "---",
  },
  {
    label: "H,S&WB",
    href: "/health-safety",
    icon: "HardHat",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    section: "---",
  },
  {
    label: "Live Camera",
    href: "/live-camera",
    icon: "Camera",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
    section: "---",
  },
]
