"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale, useTranslations } from "next-intl"

interface DateNavigatorProps {
  date: string
  onChange: (date: string) => void
}

function shiftDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const locale = useLocale()
  const t = useTranslations("timesheet.dateNav")
  const today = new Date().toISOString().split("T")[0]
  const isToday = date === today

  const d = new Date(date + "T12:00:00")
  const todayDate = new Date()
  todayDate.setHours(12, 0, 0, 0)
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)

  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d)

  let displayDate: string
  if (d.toDateString() === todayDate.toDateString()) {
    displayDate = t("today", { date: formatted })
  } else if (d.toDateString() === yesterdayDate.toDateString()) {
    displayDate = t("yesterday", { date: formatted })
  } else {
    displayDate = formatted
  }

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(shiftDate(date, -1))}
        className="h-10 w-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="text-sm font-medium">{displayDate}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(shiftDate(date, 1))}
        disabled={isToday}
        className="h-10 w-10"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
