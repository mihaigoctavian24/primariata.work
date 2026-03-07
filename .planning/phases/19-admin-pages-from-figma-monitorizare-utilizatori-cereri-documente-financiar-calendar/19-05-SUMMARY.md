---
phase: 19-admin-pages-from-figma-monitorizare-utilizatori-cereri-documente-financiar-calendar
plan: "05"
subsystem: admin-financiar
tags: [admin, financiar, recharts, server-component, client-component]
dependency_graph:
  requires: [19-00]
  provides: [admin-financiar-page]
  affects: [admin-sidebar-nav]
tech_stack:
  added: []
  patterns: [server-side-aggregation, recharts-area-bar-donut, filterable-table-pagination, zustand-free-client-state]
key_files:
  created:
    - src/app/app/[judet]/[localitate]/admin/financiar/page.tsx
    - src/components/admin/financiar/financiar-content.tsx
    - src/components/admin/financiar/revenue-charts.tsx
    - src/components/admin/financiar/transaction-list.tsx
    - src/components/admin/financiar/financiar-skeleton.tsx
    - src/lib/cereri-status.ts
  modified:
    - src/actions/admin-cereri.ts
    - src/components/admin/cereri-supervizare/cereri-kanban-tab.tsx
    - src/app/app/[judet]/[localitate]/admin/cereri/page.tsx
    - src/components/admin/calendar/create-event-modal.tsx
decisions:
  - "Recharts SVG strokes use semantic hex palette matching app accent (blue-500, cyan-500, amber-500) — CSS custom properties can't be used directly in SVG attributes"
  - "Category progress bars use graceful mock fallback (Stare Civilă/Urbanism/Social) when no plati data or tipuri_cereri available, to avoid empty state in fresh deployments"
  - "DB_TO_UI_STATUS/UI_TO_DB_STATUS constants extracted to @/lib/cereri-status.ts — non-async exports cannot live in 'use server' files in Next.js 15"
  - "z.number() + valueAsNumber pattern used for React Hook Form integer inputs with Zod 4 to avoid z.coerce resolver type mismatch"
metrics:
  duration: "13 minutes"
  completed: "2026-03-08"
  tasks: 2
  files: 10
---

# Phase 19 Plan 05: Financiar Admin Page Summary

Server Component page + 4 Client Component files delivering a complete financial dashboard with monthly revenue AreaChart, daily volume BarChart, payment method DonutChart, category progress bars, and filterable paginated transaction list — all from real plati table data with graceful empty state fallback.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Page server component + skeleton | 8189696 | financiar/page.tsx, financiar-skeleton.tsx |
| 2 | Revenue charts + transaction list + content orchestrator | 7eb2c6f | financiar-content.tsx, revenue-charts.tsx, transaction-list.tsx |

## What Was Built

### financiar/page.tsx (Server Component)
- Auth check + role guard (admin/super_admin required)
- Fetches plati (last 7 months via service role client) + tipuri_cereri in parallel
- Maps DB rows to PlatiRow for financiar-utils functions
- Computes monthlyData, dailyData, metodaData, totalRevenue server-side
- Wraps FinanciarContent in `<Suspense>` with FinanciarSkeleton fallback

### revenue-charts.tsx
- `MonthlyRevenueChart`: AreaChart (h-[220px]) with colectat + target areas. Empty state renders 7 zero-month placeholders with overlay text.
- `DailyVolumeChart`: BarChart (h-[180px]) for transaction volume by day of week (Lun–Dum)
- `MetodaChart`: Wraps existing DonutChart component for card/transfer/numerar breakdown with legend

### transaction-list.tsx
- `TransactionList`: Filterable by status (Toate/Finalizate/În așteptare/Eșuate/Rambursate) and metoda (Toate/Card/Transfer/Numerar)
- Table columns: Data, Cerere ID (truncated), Sumă, Metodă badge, Status badge
- Status badges use Tailwind semantic classes: emerald/amber/red/sky — no hardcoded hex
- Client-side pagination: 20 rows per page with windowed page buttons

### financiar-content.tsx
- Orchestrates: page header (CreditCard icon), 4 StatsCard components (AnimatedCounter), 2/3+1/3 grid layout
- Left column (2/3): MonthlyRevenueChart card
- Right column (1/3): MetodaChart card + category progress bars card
- Progress bars: animated `motion.div` with `bg-accent-500` class — uses CSS custom property via Tailwind
- Below grid: DailyVolumeChart card, then TransactionList card
- Stagger animation with incremental `delay` on each section

### financiar-skeleton.tsx
- Layout-matched skeleton for Suspense fallback
- Matches section order: header → 4 stat cards → 2/3+1/3 grid → daily chart → transaction table (8 rows)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Next.js 15 "use server" + non-async export conflict in admin-cereri.ts**
- **Found during:** Task 2 (pnpm build verification)
- **Issue:** `DB_TO_UI_STATUS` and `UI_TO_DB_STATUS` were exported from a `"use server"` file. Next.js 15 requires all exports from "use server" files to be async functions. This caused a webpack compile error.
- **Fix:** Extracted constants to `@/lib/cereri-status.ts`. Updated `cereri-kanban-tab.tsx` to import directly from `@/lib/cereri-status`.
- **Files modified:** `src/lib/cereri-status.ts` (new), `src/actions/admin-cereri.ts`, `src/components/admin/cereri-supervizare/cereri-kanban-tab.tsx`
- **Commit:** 7eb2c6f

**2. [Rule 1 - Bug] SelectQueryError type cast in cereri/page.tsx**
- **Found during:** Task 2 (pnpm build verification)
- **Issue:** `cereri` table query selecting `prioritate` (added by Wave 0 migration, not yet in generated DB types) caused TypeScript to return `SelectQueryError` type. Direct cast to `CerereRow[]` failed type check.
- **Fix:** Added `as unknown as CerereRow[]` intermediate cast.
- **Files modified:** `src/app/app/[judet]/[localitate]/admin/cereri/page.tsx`
- **Commit:** 7eb2c6f

**3. [Rule 1 - Bug] Zod 4 + React Hook Form resolver type mismatch in create-event-modal.tsx**
- **Found during:** Task 2 (pnpm build verification)
- **Issue:** `z.coerce.number()` in Zod 4 produces `Resolver<{date: unknown}>` which is incompatible with `useForm<EventFormValues>` expecting `{date: number}`.
- **Fix:** Changed schema to `z.number()` + added `{ valueAsNumber: true }` to the `register("date")` call.
- **Files modified:** `src/components/admin/calendar/create-event-modal.tsx`
- **Commit:** 7eb2c6f

### Out-of-Scope Items (Deferred)

**/_not-found prerender failure**
- The production build fails during static page generation for `/_not-found` due to `framer-motion` vs `motion/react` webpack chunking conflict in `NotFoundShowcase.tsx`. This was a pre-existing issue (build was already failing before 19-05 — previously failing with missing `cereri-alerts-tab` module). Documented in `deferred-items.md`.

## Verification Results

- TypeScript: No errors in financiar files (other files have pre-existing type errors from un-applied DB migrations)
- Compilation: `pnpm build` compiles successfully — `✓ Compiled successfully in 8.5s`
- Type lint: All financiar components pass with zero errors
- Pre-existing build failure: `/_not-found` static prerender failure (pre-existing, not introduced by this plan)

## Self-Check: PASSED

| Item | Status |
|------|--------|
| financiar/page.tsx | FOUND |
| financiar-content.tsx | FOUND |
| revenue-charts.tsx | FOUND |
| transaction-list.tsx | FOUND |
| financiar-skeleton.tsx | FOUND |
| cereri-status.ts | FOUND |
| Commit 8189696 (Task 1) | FOUND |
| Commit 7eb2c6f (Task 2) | FOUND |
