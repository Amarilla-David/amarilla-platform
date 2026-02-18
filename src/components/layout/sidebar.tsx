"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Clock,
  FolderKanban,
  FileText,
  DollarSign,
  CalendarDays,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import { NAV_ITEMS } from "@/lib/permissions/constants"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Clock,
  FolderKanban,
  FileText,
  DollarSign,
  CalendarDays,
  Shield,
}

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { hasPermission } = usePermissions()

  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(item.resource, item.requiredLevel)
  )

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-background h-full",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="p-4 border-b">
        <h2
          className={cn("font-bold text-lg", collapsed && "text-center text-sm")}
        >
          {collapsed ? "P" : "Plataforma"}
        </h2>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {visibleItems.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0" />}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
