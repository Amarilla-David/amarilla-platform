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

export function BottomNav() {
  const pathname = usePathname()
  const { hasPermission } = usePermissions()

  const mobileItems = NAV_ITEMS.filter(
    (item) => item.mobileNav && hasPermission(item.resource, item.requiredLevel)
  ).slice(0, 5)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {mobileItems.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full",
                "min-w-[44px] min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
