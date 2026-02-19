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
  labelKey: string
  href: string
  icon: string
  resource: Resource
  requiredLevel: AccessLevel
  mobileNav: boolean
  sectionKey?: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "nav.dashboard",
    href: "/",
    icon: "LayoutDashboard",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
  },
  {
    labelKey: "nav.timesheet",
    href: "/timesheet",
    icon: "Clock",
    resource: "timesheet",
    requiredLevel: "read",
    mobileNav: true,
  },
  {
    labelKey: "nav.projects",
    href: "/projects",
    icon: "FolderKanban",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
  },
  {
    labelKey: "nav.documents",
    href: "/documents",
    icon: "FileText",
    resource: "documents",
    requiredLevel: "read",
    mobileNav: false,
  },
  {
    labelKey: "nav.budgets",
    href: "/budgets",
    icon: "DollarSign",
    resource: "budgets",
    requiredLevel: "read",
    mobileNav: false,
  },
  {
    labelKey: "nav.schedules",
    href: "/schedules",
    icon: "CalendarDays",
    resource: "schedules",
    requiredLevel: "read",
    mobileNav: false,
  },
  {
    labelKey: "nav.admin",
    href: "/admin/users",
    icon: "Shield",
    resource: "admin",
    requiredLevel: "admin",
    mobileNav: false,
  },
]

// Navigation items for project-scoped views
// href is relative — prepend /projects/[projectId] at render time
// sectionKey: translation key for header label; "---": renders a divider line
export const PROJECT_NAV_ITEMS: NavItem[] = [
  {
    labelKey: "projectNav.dashboard",
    href: "",
    icon: "LayoutDashboard",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
  },
  {
    labelKey: "projectNav.spaceView",
    href: "/space-view",
    icon: "Box",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    sectionKey: "projectNav.sections.projectDefinitions",
  },
  {
    labelKey: "projectNav.productView",
    href: "/product-view",
    icon: "Package",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    sectionKey: "projectNav.sections.projectDefinitions",
  },
  {
    labelKey: "projectNav.finishSchedule",
    href: "/finish-schedule",
    icon: "Palette",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    sectionKey: "projectNav.sections.projectDefinitions",
  },
  {
    labelKey: "projectNav.takeoff",
    href: "/takeoff",
    icon: "Ruler",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    sectionKey: "---",
  },
  {
    labelKey: "projectNav.team",
    href: "/team",
    icon: "Users",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
    sectionKey: "---",
  },
  {
    labelKey: "projectNav.permits",
    href: "/permits",
    icon: "ClipboardCheck",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    sectionKey: "---",
  },
  {
    labelKey: "projectNav.budget",
    href: "/budget",
    icon: "DollarSign",
    resource: "budgets",
    requiredLevel: "read",
    mobileNav: true,
    sectionKey: "---",
  },
  {
    labelKey: "projectNav.schedule",
    href: "/schedule",
    icon: "CalendarDays",
    resource: "schedules",
    requiredLevel: "read",
    mobileNav: true,
    sectionKey: "---",
  },
  {
    labelKey: "projectNav.scm",
    href: "/scm",
    icon: "Truck",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    sectionKey: "---",
  },
  {
    labelKey: "projectNav.healthSafety",
    href: "/health-safety",
    icon: "HardHat",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: false,
    sectionKey: "---",
  },
  {
    labelKey: "projectNav.liveCamera",
    href: "/live-camera",
    icon: "Camera",
    resource: "projects",
    requiredLevel: "read",
    mobileNav: true,
    sectionKey: "---",
  },
]
