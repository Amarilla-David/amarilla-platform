"use client"

import { useState } from "react"
import { useDailyEntries } from "@/hooks/use-construction-timesheet"
import { DateNavigator } from "./date-navigator"
import { DailySummaryCard } from "./daily-summary-card"
import { WorkerDailyList } from "./worker-daily-list"

function getToday() {
  return new Date().toISOString().split("T")[0]
}

export function DailyReviewPanel() {
  const [date, setDate] = useState(getToday)
  const { data, isLoading } = useDailyEntries(date)
  const entries = data?.entries ?? []

  return (
    <div className="space-y-4">
      <DateNavigator date={date} onChange={setDate} />

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 rounded-xl bg-muted animate-pulse" />
          <div className="h-16 rounded-xl bg-muted animate-pulse" />
          <div className="h-16 rounded-xl bg-muted animate-pulse" />
        </div>
      ) : (
        <>
          <DailySummaryCard entries={entries} />
          <WorkerDailyList entries={entries} />
        </>
      )}
    </div>
  )
}
