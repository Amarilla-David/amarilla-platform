"use client"

import { useLocaleSwitch } from "@/hooks/use-locale-switch"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import type { Locale } from "@/i18n/config"

interface LocaleSwitcherProps {
  currentLocale: string
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const { switchLocale } = useLocaleSwitch()
  const next: Locale = currentLocale === "es" ? "en" : "es"
  const label = currentLocale === "es" ? "EN" : "ES"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLocale(next)}
      className="gap-1.5 text-xs font-medium"
    >
      <Globe className="h-3.5 w-3.5" />
      {label}
    </Button>
  )
}
