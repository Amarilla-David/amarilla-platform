"use client"

import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  HardHat,
  Box,
  ClipboardList,
  Truck,
  HeartPulse,
  Wrench,
} from "lucide-react"
import { useTranslations } from "next-intl"

const TIMESHEET_MODULES = [
  {
    titleKey: "timesheet.modules.construction.title",
    descKey: "timesheet.modules.construction.description",
    href: "/timesheet/construction",
    icon: HardHat,
    color: "text-orange-500",
  },
  {
    titleKey: "timesheet.modules.digitalTwin.title",
    descKey: "timesheet.modules.digitalTwin.description",
    href: "/timesheet/digital-twin",
    icon: Box,
    color: "text-purple-500",
  },
  {
    titleKey: "timesheet.modules.administration.title",
    descKey: "timesheet.modules.administration.description",
    href: "/timesheet/administration",
    icon: ClipboardList,
    color: "text-blue-500",
  },
  {
    titleKey: "timesheet.modules.scm.title",
    descKey: "timesheet.modules.scm.description",
    href: "/timesheet/scm",
    icon: Truck,
    color: "text-green-500",
  },
  {
    titleKey: "timesheet.modules.hsw.title",
    descKey: "timesheet.modules.hsw.description",
    href: "/timesheet/hsw",
    icon: HeartPulse,
    color: "text-red-500",
  },
  {
    titleKey: "timesheet.modules.services.title",
    descKey: "timesheet.modules.services.description",
    href: "/timesheet/services",
    icon: Wrench,
    color: "text-cyan-500",
  },
]

export default function TimesheetPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("timesheet.title")}</h1>
        <p className="text-muted-foreground">
          {t("timesheet.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TIMESHEET_MODULES.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
              <CardHeader className="flex flex-row items-center gap-4">
                <mod.icon className={`h-8 w-8 ${mod.color} shrink-0`} />
                <div>
                  <CardTitle className="text-lg">{t(mod.titleKey)}</CardTitle>
                  <CardDescription>{t(mod.descKey)}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
