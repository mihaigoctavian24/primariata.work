---
phase: 23-implement-primar-module-from-figma-design-into-app-primar-route
plan: "01"
subsystem: primar-module
tags: [db-migration, routes, auth, middleware, rls]
dependency_graph:
  requires: []
  provides:
    - departamente/proiecte_municipale/agende_primar tables with RLS
    - cereri.note_primar JSONB column
    - user_primarii.mandat_start/mandat_sfarsit DATE columns
    - src/app/app/[judet]/[localitate]/primar/* route tree (9 stubs)
    - Middleware primar routing (citizen isolation + /primar/* guard)
    - AdminLoginForm primar redirect branch
  affects:
    - src/middleware.ts
    - src/components/auth/AdminLoginForm.tsx
    - src/types/database.types.ts
tech_stack:
  added: []
  patterns:
    - Framer Motion animated placeholder pages (cetateni, anunturi)
    - Role-aware middleware routing (primar vs admin path branching)
    - RLS policy pattern: staff view / primar manage
key_files:
  created:
    - supabase/migrations/20260310_primar_module_schema.sql
    - src/app/app/[judet]/[localitate]/primar/page.tsx
    - src/app/app/[judet]/[localitate]/primar/cereri/page.tsx
    - src/app/app/[judet]/[localitate]/primar/buget/page.tsx
    - src/app/app/[judet]/[localitate]/primar/proiecte/page.tsx
    - src/app/app/[judet]/[localitate]/primar/agende/page.tsx
    - src/app/app/[judet]/[localitate]/primar/rapoarte/page.tsx
    - src/app/app/[judet]/[localitate]/primar/setari/page.tsx
    - src/app/app/[judet]/[localitate]/primar/cetateni/page.tsx
    - src/app/app/[judet]/[localitate]/primar/anunturi/page.tsx
  modified:
    - src/middleware.ts
    - src/components/auth/AdminLoginForm.tsx
    - src/types/database.types.ts
decisions:
  - "departamente/proiecte_municipale use staff-view + primar-manage RLS split; agende_primar uses primar_id = auth.uid() self-ownership"
  - "database.types.ts restored from git HEAD (was empty from failed types:generate) with TODO comment for post-migration regeneration"
  - "Middleware primar guard added inside the existing else-if (isImpersonating===false && association.status===approved) block for TypeScript null narrowing safety"
  - "Placeholder pages (cetateni, anunturi) use Client Components with Framer Motion — permanent for this phase, wired in later plans"
metrics:
  duration: "4 minutes"
  completed_date: "2026-03-10"
  tasks_completed: 3
  files_changed: 12
---

# Phase 23 Plan 01: Primar Module Foundation Summary

**One-liner:** DB schema (3 new tables + 2 ALTER TABLE + RLS), 9 Next.js route stubs, and role-aware middleware routing establishing the primar module foundation.

## What Was Built

### Task 1: DB Migration
Created `supabase/migrations/20260310_primar_module_schema.sql` with:
- **departamente** table: primarie departments with budget tracking, staff count, RLS (staff view / primar manage)
- **proiecte_municipale** table: municipal projects with status enum, progress percentage, budget tracking, RLS matching departamente
- **agende_primar** table: primar's personal agenda with event types enum, self-ownership RLS (primar_id = auth.uid())
- `cereri.note_primar JSONB NOT NULL DEFAULT '[]'` — primar notes array on citizen requests
- `user_primarii.mandat_start DATE` and `mandat_sfarsit DATE` — mandate period columns

Types regeneration was skipped (Supabase project access restricted). `database.types.ts` was restored from git HEAD (it was empty from a failed prior types:generate run) and annotated with a TODO comment.

### Task 2: Route Scaffold
Created 9 page files under `src/app/app/[judet]/[localitate]/primar/`:
- 7 work-in-progress stubs (dashboard, cereri, buget, proiecte, agende, rapoarte, setari) — minimal Server Components
- 2 permanent placeholder pages with Framer Motion animations:
  - **cetateni** — amber color scheme (`rgba(245,158,11,...)`)
  - **anunturi** — violet color scheme (`rgba(139,92,246,...)`)

### Task 3: Auth Routing
**Middleware** (`src/middleware.ts`) — two changes inside the approved-association block:
1. Staff isolation block now excludes `/primar` prefix: staff on citizen routes get redirected to role-appropriate dashboard (`/primar` for primar role, `/admin` for others)
2. New guard block: staff accessing `/primar/*` without primar role are redirected to `/admin`

**AdminLoginForm** (`src/components/auth/AdminLoginForm.tsx`) — line 147: post-login redirect now branches on `staffAssociation.rol === "primar"` to route to `/primar` instead of hardcoded `/admin`.

## Deviations from Plan

**1. [Rule 1 - Bug] Restored empty database.types.ts from git**
- **Found during:** Task 1 (pnpm types:generate failed with "Forbidden resource")
- **Issue:** `src/types/database.types.ts` was 0 bytes in working tree — a prior failed types:generate had truncated it. The project would not compile.
- **Fix:** Restored from `git show HEAD:src/types/database.types.ts`, then added the required TODO comment at the top per plan instructions.
- **Files modified:** `src/types/database.types.ts`
- **Commit:** 5f7b5ac

## Auth Gates

None. No authentication gates were encountered during execution.

## Verification Results

- Migration file exists: `supabase/migrations/20260310_primar_module_schema.sql`
- All 9 page stubs present under `src/app/app/[judet]/[localitate]/primar/`
- `pnpm lint` — passes (only pre-existing warnings, no errors)
- `pnpm type-check` — no new errors in primar route files (pre-existing errors in `super-admin-stats.ts` are out of scope)
- Middleware contains `/primar` routing blocks (verified with grep)
- AdminLoginForm branches on `staffAssociation.rol === "primar"` at line 147

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| supabase/migrations/20260310_primar_module_schema.sql | FOUND |
| src/app/app/[judet]/[localitate]/primar/page.tsx | FOUND |
| src/app/app/[judet]/[localitate]/primar/cereri/page.tsx | FOUND |
| src/app/app/[judet]/[localitate]/primar/cetateni/page.tsx | FOUND |
| src/app/app/[judet]/[localitate]/primar/anunturi/page.tsx | FOUND |
| Task 1 commit 5f7b5ac | FOUND |
| Task 2 commit daf446e | FOUND |
| Task 3 commit e9b4e74 | FOUND |
