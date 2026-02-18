"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { Header } from "./header"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          showMenuButton
          onMenuToggle={() => setSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
