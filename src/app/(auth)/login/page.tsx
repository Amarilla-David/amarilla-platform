import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/brand/logo"
import { getTranslations } from "next-intl/server"

export default async function LoginPage() {
  const t = await getTranslations("auth")
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col items-center gap-4">
        <Logo variant="white" size="lg" />
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-lg font-semibold tracking-widest text-white">
            {t("welcome")}
          </h1>
          <p className="text-sm text-white/50">
            {t("loginPrompt")}
          </p>
        </div>
      </div>
      <LoginForm />
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs tracking-widest text-white/60 uppercase">
          {t("systemOnline")}
        </span>
      </div>
    </div>
  )
}
