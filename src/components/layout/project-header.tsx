"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProject } from "@/hooks/use-project"

interface ProjectHeaderProps {
  onMenuToggle?: () => void
}

export function ProjectHeader({ onMenuToggle }: ProjectHeaderProps) {
  const { project } = useProject()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm truncate">
          {project.name}
        </span>
      </div>
    </header>
  )
}
