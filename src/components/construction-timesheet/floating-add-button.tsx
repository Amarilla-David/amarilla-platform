"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWizard } from "./wizard-provider"
import { useTranslations } from "next-intl"

export function FloatingAddButton() {
  const { open } = useWizard()
  const t = useTranslations("timesheet.wizard")

  return (
    <Button
      onClick={open}
      size="lg"
      className="fixed bottom-24 right-4 lg:bottom-8 h-14 rounded-full shadow-lg gap-2 px-6 z-40"
    >
      <Plus className="h-5 w-5" />
      <span className="font-semibold">{t("register")}</span>
    </Button>
  )
}
