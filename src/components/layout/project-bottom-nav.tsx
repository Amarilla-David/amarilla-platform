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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import { useProject } from "@/hooks/use-project"
import { PROJECT_NAV_ITEMS } from "@/lib/permissions/constants"
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

export function ProjectBottomNav() {
  const pathname = usePathname()
  const { hasPermission } = usePermissions()
  const { project } = useProject()
  const t = useTranslations()

  const basePath = `/projects/${project.id}`

  const mobileItems = PROJECT_NAV_ITEMS.filter(
    (item) =>
      item.mobileNav && hasPermission(item.resource, item.requiredLevel)
  ).slice(0, 5)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {mobileItems.map((item) => {
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
                "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                "min-w-[44px] min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
