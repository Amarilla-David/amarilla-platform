import { getTranslations } from "next-intl/server"

export default async function DocumentsPage() {
  const t = await getTranslations("stubPages")
  const tCommon = await getTranslations("common")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("documents")}</h1>
      <p className="text-muted-foreground">{tCommon("comingSoon")}</p>
    </div>
  )
}
