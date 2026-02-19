"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  CalendarDays,
  Users,
  Box,
  Package,
  Palette,
  Ruler,
  ClipboardCheck,
  Truck,
  HardHat,
  Camera,
  LogOut,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import { useProject } from "@/hooks/use-project"
import { useAuthContext } from "@/components/providers/auth-provider"
import { PROJECT_NAV_ITEMS } from "@/lib/permissions/constants"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTranslations } from "next-intl"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  DollarSign,
  CalendarDays,
  Users,
  Box,
  Package,
  Palette,
  Ruler,
  ClipboardCheck,
  Truck,
  HardHat,
  Camera,
}

export function ProjectSidebar() {
  const pathname = usePathname()
  const { hasPermission } = usePermissions()
  const { project } = useProject()
  const { profile, signOut } = useAuthContext()
  const t = useTranslations()

  const basePath = `/projects/${project.id}`

  const visibleItems = PROJECT_NAV_ITEMS.filter((item) =>
    hasPermission(item.resource, item.requiredLevel)
  )

  // Group items by section
  const sections: { sectionKey: string | null; items: typeof visibleItems }[] = []
  let currentSectionKey: string | null = null

  for (const item of visibleItems) {
    const itemSectionKey = item.sectionKey ?? null
    if (itemSectionKey !== currentSectionKey) {
      currentSectionKey = itemSectionKey
      sections.push({ sectionKey: itemSectionKey, items: [item] })
    } else {
      sections[sections.length - 1].items.push(item)
    }
  }

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??"

  return (
    <aside className="flex flex-col bg-white border-r border-gray-200 h-full w-60">
      {/* Logo */}
      <div className="p-4 pb-2 flex justify-center">
        <Logo variant="dark" size="sm" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx}>
            {section.sectionKey && section.sectionKey !== "---" && (
              <p className="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t(section.sectionKey)}
              </p>
            )}
            {section.sectionKey === "---" && idx > 0 && (
              <hr className="my-2 border-gray-200" />
            )}
            {section.items.map((item) => {
              const fullHref = `${basePath}${item.href}`
              const Icon = ICON_MAP[item.icon]
              const isActive =
                item.href === ""
                  ? pathname === basePath
                  : pathname.startsWith(fullHref)

              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400"
                      )}
                    />
                  )}
                  <span>{t(item.labelKey)}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer: project info + user */}
      <div className="border-t border-gray-200 p-3 space-y-3">
        {/* Project info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-9 w-9 rounded-md bg-gray-100 text-xs font-bold text-gray-600 shrink-0">
            {project.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{project.name}</p>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
              <RefreshCw className="h-2.5 w-2.5" />
              {t("common.syncing")}
            </div>
          </div>
        </div>

        {/* User + sign out */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {profile?.full_name}
            </p>
            <p className="text-[10px] text-gray-400 capitalize">
              {profile?.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-7 w-7 text-gray-400 hover:text-red-500"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
