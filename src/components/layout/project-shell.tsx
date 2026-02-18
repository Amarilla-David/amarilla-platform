"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { ProjectSidebar } from "./project-sidebar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { useProject } from "@/hooks/use-project"

export function ProjectShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { project } = useProject()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — always visible on lg+ */}
      <div className="hidden lg:flex">
        <ProjectSidebar />
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="!w-[240px] !border-none !p-0 !gap-0" showCloseButton={false}>
          <SheetTitle className="sr-only">{project.name}</SheetTitle>
          <ProjectSidebar />
        </SheetContent>
      </Sheet>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button — floating top-left */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-3 left-3 z-50 h-10 w-10 rounded-full bg-white shadow-md border border-gray-200"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <main className="flex-1 overflow-y-auto p-4 pt-16 lg:p-6 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
