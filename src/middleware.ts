import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { locales, defaultLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config"

function detectLocale(request: NextRequest): Locale {
  // 1. Cookie takes priority
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie && (locales as readonly string[]).includes(cookie)) {
    return cookie as Locale
  }

  // 2. Parse Accept-Language header
  const acceptLang = request.headers.get("Accept-Language") ?? ""
  for (const segment of acceptLang.split(",")) {
    const lang = segment.split(";")[0].trim().slice(0, 2).toLowerCase()
    if ((locales as readonly string[]).includes(lang)) {
      return lang as Locale
    }
  }

  return defaultLocale
}

export async function middleware(request: NextRequest) {
  const locale = detectLocale(request)

  // Run Supabase session refresh (handles auth redirects)
  const response = await updateSession(request)

  // Persist locale cookie on the response (14 days)
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
    sameSite: "lax",
  })

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
