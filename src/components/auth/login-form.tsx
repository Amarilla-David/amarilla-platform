"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

type LoginFormData = {
  email: string
  password: string
}

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const t = useTranslations("auth")

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("validation.emailInvalid")),
        password: z.string().min(6, t("validation.minChars", { count: 6 })),
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="space-y-1.5">
        <input
          id="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          {...register("email")}
          className="w-full h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-5 text-white placeholder:text-white/40 text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
        />
        {errors.email && (
          <p className="text-sm text-red-400 pl-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <input
          id="password"
          type="password"
          placeholder={t("password").toLowerCase()}
          autoComplete="current-password"
          {...register("password")}
          className="w-full h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-5 text-white placeholder:text-white/40 text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
        />
        {errors.password && (
          <p className="text-sm text-red-400 pl-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-500/15 backdrop-blur-sm text-red-300 text-sm p-3 rounded-xl border border-red-500/30">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-base tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
      >
        {loading ? t("submitting") : t("submit")}
        {!loading && <ArrowRight className="h-5 w-5" />}
      </button>
    </form>
  )
}
