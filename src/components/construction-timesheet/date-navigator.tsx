"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DateNavigatorProps {
  date: string
  onChange: (date: string) => void
}

function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00")
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
  const monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ]

  const dayName = dayNames[d.getDay()]
  const day = d.getDate()
  const month = monthNames[d.getMonth()]

  if (d.toDateString() === today.toDateString()) {
    return `Hoy — ${dayName} ${day} ${month}`
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return `Ayer — ${dayName} ${day} ${month}`
  }
  return `${dayName} ${day} ${month}`
}

function shiftDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const today = new Date().toISOString().split("T")[0]
  const isToday = date === today

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
      <span className="text-sm font-medium">{formatDisplayDate(date)}</span>
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
