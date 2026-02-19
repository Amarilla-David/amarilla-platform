"use client"

import { useRouter } from "next/navigation"
import { LOCALE_COOKIE, type Locale } from "@/i18n/config"

export function useLocaleSwitch() {
  const router = useRouter()

  function switchLocale(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 14}; samesite=lax`
    router.refresh()
  }

  return { switchLocale }
}
