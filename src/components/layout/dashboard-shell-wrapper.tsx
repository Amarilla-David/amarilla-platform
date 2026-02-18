"use client"

import { usePathname } from "next/navigation"
import { AppShell } from "./app-shell"

export function DashboardShellWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Project routes have their own shell (ProjectShell via their layout.tsx)
  // so we skip AppShell for them
  const isProjectRoute = /^\/projects\/[^/]+/.test(pathname)

  if (isProjectRoute) {
    return <>{children}</>
  }

  return <AppShell>{children}</AppShell>
}
