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
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import { useAuthContext } from "@/components/providers/auth-provider"
import { NAV_ITEMS } from "@/lib/permissions/constants"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { useLocale, useTranslations } from "next-intl"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Clock,
  FolderKanban,
  FileText,
  DollarSign,
  CalendarDays,
  Shield,
}

export function Sidebar() {
  const pathname = usePathname()
  const { hasPermission } = usePermissions()
  const { profile, signOut } = useAuthContext()
  const t = useTranslations()
  const locale = useLocale()

  const visibleItems = NAV_ITEMS.filter((item) =>
    hasPermission(item.resource, item.requiredLevel)
  )

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
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
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
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {profile?.full_name}
            </p>
            <p className="text-[10px] text-gray-400 capitalize">
              {profile?.role}
            </p>
          </div>
          <LocaleSwitcher currentLocale={locale} />
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
