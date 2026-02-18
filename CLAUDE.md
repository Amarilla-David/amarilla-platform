# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Start production**: `npm run start`

No test runner is configured yet.

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui, Supabase (auth + DB), Airtable (data provider), TanStack React Query, React Hook Form + Zod, Sonner (toasts). All UI text is in Spanish.

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

Roles: `admin | manager | employee | client`. Resources: `timesheet | budgets | documents | schedules | admin | projects`. Access levels: `read < write < admin` (hierarchical).

Default permissions per role are in `constants.ts` (`DEFAULT_ROLE_PERMISSIONS`). Explicit per-user overrides come from the `user_permissions` Supabase table. Admins bypass all checks.

`NAV_ITEMS` in `constants.ts` is the single source of truth for navigation — sidebar, bottom nav, and dashboard cards all filter from it.

### Mobile-First Layout (src/components/layout/)

`AppShell` renders `Sidebar` (desktop, `lg:` breakpoint) + `BottomNav` (mobile, `< lg:`). Main content uses `pb-20 lg:pb-4` to avoid bottom nav overlap. `useDeviceContext()` hook provides `isMobile/isTablet/isDesktop` for conditional rendering.

### Supabase Auth (src/lib/supabase/)

Uses `@supabase/ssr` (not the deprecated `@supabase/auth-helpers-nextjs`). Three client variants:
- `client.ts` — Browser client (`createBrowserClient`)
- `server.ts` — Server components/actions (cookie-based via `next/headers`)
- `middleware.ts` — `updateSession()` for the Next.js middleware

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
