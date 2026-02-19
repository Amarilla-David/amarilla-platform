import { getTranslations } from "next-intl/server"

export default async function SchedulesPage() {
  const t = await getTranslations("stubPages")
  const tCommon = await getTranslations("common")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("schedules")}</h1>
      <p className="text-muted-foreground">{tCommon("comingSoon")}</p>
    </div>
  )
}
