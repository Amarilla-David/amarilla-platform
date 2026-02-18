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

const TIMESHEET_MODULES = [
  {
    title: "Construction",
    description: "Horas de trabajo en obra y construccion",
    href: "/timesheet/construction",
    icon: HardHat,
    color: "text-orange-500",
  },
  {
    title: "Digital Twin",
    description: "Horas de modelado y gemelo digital",
    href: "/timesheet/digital-twin",
    icon: Box,
    color: "text-purple-500",
  },
  {
    title: "Administration",
    description: "Horas administrativas y de oficina",
    href: "/timesheet/administration",
    icon: ClipboardList,
    color: "text-blue-500",
  },
  {
    title: "SCM",
    description: "Supply Chain Management - cadena de suministro",
    href: "/timesheet/scm",
    icon: Truck,
    color: "text-green-500",
  },
  {
    title: "Health, Safety & Wellbeing",
    description: "Seguridad, salud y bienestar en obra",
    href: "/timesheet/hsw",
    icon: HeartPulse,
    color: "text-red-500",
  },
  {
    title: "Services",
    description: "Servicios generales y soporte",
    href: "/timesheet/services",
    icon: Wrench,
    color: "text-cyan-500",
  },
]

export default function TimesheetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timesheet</h1>
        <p className="text-muted-foreground">
          Selecciona el modulo para registrar horas trabajadas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TIMESHEET_MODULES.map((mod) => (
          <Link key={mod.href} href={mod.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
              <CardHeader className="flex flex-row items-center gap-4">
                <mod.icon className={`h-8 w-8 ${mod.color} shrink-0`} />
                <div>
                  <CardTitle className="text-lg">{mod.title}</CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
