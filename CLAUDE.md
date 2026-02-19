# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Start production**: `npm run start`

No test runner is configured yet.

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui, Supabase (auth + DB), Airtable (data provider), TanStack React Query, React Hook Form + Zod, Sonner (toasts), next-intl (i18n). Primary language is English; Spanish (ES) and English (EN) are supported via automatic browser language detection.

## Architecture

### Route Groups

- `(auth)/` — Public routes (login). Minimal centered layout, no shell.
- `(dashboard)/` — Protected routes. Server-side auth check in layout, wrapped in `AuthProvider` + `AppShell`. The `admin/` sub-layout additionally checks `role === 'admin'` server-side.

### Data Provider Abstraction (src/lib/data/)

Factory pattern with switchable backends controlled by env vars (`NEXT_PUBLIC_TIMESHEET_PROVIDER`, `NEXT_PUBLIC_PROJECTS_PROVIDER`). Each data domain has:
- **Interface** (`interfaces/`) — TypeScript contract (e.g., `ITimesheetProvider`)
- **Airtable provider** (`providers/airtable/`) — Full implementation using direct REST API calls
- **Supabase provider** (`providers/supabase/`) — Stubs, not yet implemented
- **Factory** (`factory.ts`) — `getTimesheetProvider()`, `getProjectsProvider()` return the active provider

The Airtable client (`providers/airtable/client.ts`) provides generic `airtableFetch`, `airtableCreate`, `airtableUpdate`, `airtableDelete` helpers.

### RBAC Permission System (src/lib/permissions/)

Three-layer permission checking:
1. **Middleware** (`src/middleware.ts`) — Session refresh, redirect unauthenticated to `/login`
2. **Server layouts** — `(dashboard)/layout.tsx` checks `getUser()`, `admin/layout.tsx` checks role
3. **Client components** — `<PermissionGate>` and `usePermissions()` hook for conditional UI

Roles: `admin | manager | employee | client | foreman`. Resources: `timesheet | budgets | documents | schedules | admin | projects`. Access levels: `read < write < admin` (hierarchical).

Default permissions per role are in `constants.ts` (`DEFAULT_ROLE_PERMISSIONS`). Explicit per-user overrides come from the `user_permissions` Supabase table. Admins bypass all checks.

`NAV_ITEMS` in `constants.ts` is the single source of truth for navigation — sidebar, bottom nav, and dashboard cards all filter from it.

### Mobile-First Layout (src/components/layout/)

`AppShell` renders `Sidebar` (desktop, `lg:` breakpoint) + `BottomNav` (mobile, `< lg:`). Main content uses `pb-20 lg:pb-4` to avoid bottom nav overlap. `useDeviceContext()` hook provides `isMobile/isTablet/isDesktop` for conditional rendering.

### Supabase Auth (src/lib/supabase/)

Uses `@supabase/ssr` (not the deprecated `@supabase/auth-helpers-nextjs`). Three client variants:
- `client.ts` — Browser client (`createBrowserClient`)
- `server.ts` — Server components/actions (cookie-based via `next/headers`)
- `middleware.ts` — `updateSession()` for the Next.js middleware

### Internationalization (src/i18n/, src/messages/)

Uses `next-intl` with cookie-based locale detection (no URL prefixes). Supported locales: `es` (default), `en`.

- **Config**: `src/i18n/config.ts` — locale constants, cookie name `NEXT_LOCALE`
- **Request config**: `src/i18n/request.ts` — reads cookie to resolve locale, dynamically imports `src/messages/{locale}.json`
- **Middleware**: `src/middleware.ts` — detects locale from `Accept-Language` header, persists in cookie (14 days)
- **Root layout**: `src/app/layout.tsx` — wraps app in `<NextIntlClientProvider>`, sets `<html lang={locale}>`
- **Translation files**: `src/messages/es.json`, `src/messages/en.json`
- **Locale switcher**: `src/components/locale-switcher.tsx` + `src/hooks/use-locale-switch.ts`

**Patterns:**
- Server components: `const t = await getTranslations('namespace')` from `next-intl/server`
- Client components: `const t = useTranslations('namespace')` from `next-intl`
- NAV_ITEMS use `labelKey`/`sectionKey` (translation keys), resolved at render time with `t(item.labelKey)`
- `TIPO_DE_HORAS_OPTIONS` values stay in Spanish (Airtable API IDs) — only display labels are translated via `tipoDeHoras` namespace
- Dynamic translation keys: use `t.has(key) ? t(key) : fallback` for safety
- Zod validation messages: define schema inside component with `useMemo` to capture `t()`

### Database Schema

Supabase tables (`supabase-setup.sql`):
- `user_profiles` — Extends `auth.users` with `full_name`, `role`. Auto-created by trigger on signup.
- `user_permissions` — Granular per-user, per-resource, per-project permissions. Unique on `(user_id, resource, project_id)`.
- `projects` — Project registry with optional `airtable_base_id` mapping.

All tables have RLS enabled. Admins can manage everything; users can only read their own profile/permissions.

## Conventions

- shadcn/ui components live in `src/components/ui/` — add new ones with `npx shadcn@latest add <component>`
- Custom hooks are client-side (`"use client"`) and live in `src/hooks/`
- Supabase client instances should be memoized with `useMemo(() => createClient(), [])` in hooks/components
- The `cn()` utility from `src/lib/utils.ts` is used for conditional class merging
