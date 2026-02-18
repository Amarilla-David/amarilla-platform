"use client"

import { useParams } from "next/navigation"
import { ProjectProvider } from "@/components/providers/project-provider"
import { ProjectShell } from "@/components/layout/project-shell"

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <ProjectProvider projectId={projectId}>
      <ProjectShell>{children}</ProjectShell>
    </ProjectProvider>
  )
}
