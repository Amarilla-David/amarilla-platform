import { getTranslations } from "next-intl/server"

export default async function TimesheetSCMPage() {
  const t = await getTranslations("timesheet")
  const tCommon = await getTranslations("common")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("scmPage.title")}</h1>
      <p className="text-muted-foreground">{tCommon("comingSoon")}</p>
    </div>
  )
}
