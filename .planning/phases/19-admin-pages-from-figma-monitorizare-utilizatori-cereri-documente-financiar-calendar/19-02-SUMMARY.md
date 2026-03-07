---
phase: 19-admin-pages-from-figma-monitorizare-utilizatori-cereri-documente-financiar-calendar
plan: "02"
subsystem: admin-utilizatori
tags: [admin, ui, server-actions, recharts, framer-motion]
dependency_graph:
  requires: ["19-00"]
  provides: ["admin-users-page", "admin-users-actions", "user-profile-drawer"]
  affects: ["admin-shell", "user-management"]
tech_stack:
  added: []
  patterns:
    - "Server Actions with getAuthContext for user management ops"
    - "Service role client bypasses RLS for cross-user admin operations"
    - "AnimatePresence + motion.div slide-in drawer (x: 100% -> 0)"
    - "Recharts AreaChart with CSS var gradient fill for theme compatibility"
    - "layoutId motion.div for tab indicator animation"
key_files:
  created:
    - src/actions/admin-users.ts
    - src/components/admin/utilizatori/utilizatori-content.tsx
    - src/components/admin/utilizatori/user-role-tabs.tsx
    - src/components/admin/utilizatori/user-profile-drawer.tsx
    - src/components/admin/utilizatori/registration-growth-chart.tsx
    - src/components/admin/utilizatori/utilizatori-skeleton.tsx
  modified:
    - src/app/app/[judet]/[localitate]/admin/users/page.tsx
decisions:
  - "page Server Component uses createClient directly for auth (not getAuthContext — only Server Actions use getAuthContext)"
  - "Service role client used in Server Actions to bypass RLS for admin user management"
  - "2FA status displayed as N/D (not connected to DB) per plan spec for academic milestone"
  - "User list admin tab combines admin + super_admin role counts"
metrics:
  duration: "4min"
  completed: "2026-03-08"
  tasks: 2
  files: 7
---

# Phase 19 Plan 02: Utilizatori Admin Page Summary

**One-liner:** Full Figma-faithful Utilizatori admin page with role filter tabs, slide-in profile drawer, approve/suspend/reactivate Server Actions, staff invite, and registration growth AreaChart from real DB data.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Server Actions + page rewrite + skeleton | 7622665 | admin-users.ts, users/page.tsx, utilizatori-skeleton.tsx |
| 2 | Utilizatori UI — tabs, drawer, chart, orchestrator | 58c3483 | utilizatori-content.tsx, user-role-tabs.tsx, user-profile-drawer.tsx, registration-growth-chart.tsx |

## What Was Built

### Server Actions (`src/actions/admin-users.ts`)
Three exported Server Actions using `getAuthContext` + `createServiceRoleClient`:
- `approveUser(userId)` — sets `utilizatori.activ=true`, `status="activ"`, `user_primarii.status="approved"`
- `suspendUser(userId)` — sets `utilizatori.activ=false`, `status="suspendat"`, `user_primarii.status="suspended"`
- `reactivateUser(userId)` — same as `approveUser`
Each action revalidates `/admin/users` on success.

### Page Server Component (`src/app/app/[judet]/[localitate]/admin/users/page.tsx`)
Full rewrite replacing the old StaffTable-based page:
- Auth check via `createClient()` (not `getAuthContext`)
- Role guard: only `admin` / `super_admin` proceed
- `primarieId` from `x-primarie-id` header with fallback to `utilizatori.primarie_id`
- Parallel fetch: 200 users + 30-day registration growth from `user_primarii`
- Wrapped in `<Suspense fallback={<UtilizatoriSkeleton />}>`

### UI Components
- **`UtilizatoriContent`** — root client orchestrator: tab state, search, drawer control, invite dialog
- **`UserRoleTabs`** — 6 tabs (Toți / Cetățeni / Funcționari / Primar / Admini / În așteptare) with count badges, Framer Motion layoutId indicator
- **`UserProfileDrawer`** — slide-in drawer from right (x: 100% → 0), user details, conditional action buttons, loading states, toast feedback
- **`RegistrationGrowthChart`** — Recharts AreaChart with 30-day bucketed data, CSS var stroke/gradient
- **`UtilizatoriSkeleton`** — layout-matched skeleton for Suspense fallback

## Decisions Made

1. **Page auth pattern**: `createClient()` directly in page Server Component (not `getAuthContext`) — consistent with plan spec that `getAuthContext` is only for Server Actions
2. **Service role for admin ops**: Service role client bypasses RLS to allow admin to manage users across the primarie
3. **2FA status = N/D**: Per plan spec, displayed as "N/D" for academic milestone (not connected to DB)
4. **Admin tab aggregates**: "Admini" tab count includes both `admin` and `super_admin` roles

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All 7 files exist. Both commits verified:
- `7622665`: feat(admin): Task 1 (19-02)
- `58c3483`: feat(admin): Task 2 (19-02)

Type-check passes with zero errors in new/modified files.
Build errors present are pre-existing (calendar, cereri, financiar, monitorizare pages missing component files — out of scope for this plan).
