import { getTranslations } from "next-intl/server"

export default async function BudgetPage() {
  const t = await getTranslations("projectPages")
  const tCommon = await getTranslations("common")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("budget")}</h1>
      <p className="text-muted-foreground">{tCommon("comingSoon")}</p>
    </div>
  )
}
