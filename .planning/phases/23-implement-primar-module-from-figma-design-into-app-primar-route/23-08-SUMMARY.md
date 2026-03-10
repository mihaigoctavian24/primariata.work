---
phase: 23-implement-primar-module-from-figma-design-into-app-primar-route
plan: "08"
subsystem: primar-module
tags: [rapoarte, setari, loading-skeletons, jspdf, react-hook-form, zod]
dependency_graph:
  requires: [23-06, 23-07]
  provides:
    - primar rapoarte page with stats tables + jsPDF download
    - primar setari page with RHF form (profil/mandat/notificari)
    - loading.tsx for all 9 primar routes
  affects:
    - src/app/app/[judet]/[localitate]/primar/ (all routes now have loading.tsx)
tech_stack:
  added: []
  patterns:
    - jsPDF with Roboto font for PDF generation (same as receipt-generator.ts)
    - React Hook Form + Zod 4 for settings form
    - useTransition for async server action calls in Client Components
    - Named exports for components, default exports only for page.tsx and loading.tsx
key_files:
  created:
    - src/app/app/[judet]/[localitate]/primar/_components/primar-rapoarte-skeleton.tsx
    - src/app/app/[judet]/[localitate]/primar/_components/primar-rapoarte-content.tsx
    - src/app/app/[judet]/[localitate]/primar/_components/primar-setari-content.tsx
    - src/app/app/[judet]/[localitate]/primar/loading.tsx
    - src/app/app/[judet]/[localitate]/primar/cereri/loading.tsx
    - src/app/app/[judet]/[localitate]/primar/buget/loading.tsx
    - src/app/app/[judet]/[localitate]/primar/proiecte/loading.tsx
    - src/app/app/[judet]/[localitate]/primar/agende/loading.tsx
    - src/app/app/[judet]/[localitate]/primar/rapoarte/loading.tsx
    - src/app/app/[judet]/[localitate]/primar/setari/loading.tsx
    - src/app/app/[judet]/[localitate]/primar/cetateni/loading.tsx
    - src/app/app/[judet]/[localitate]/primar/anunturi/loading.tsx
  modified:
    - src/app/app/[judet]/[localitate]/primar/rapoarte/page.tsx
    - src/app/app/[judet]/[localitate]/primar/setari/page.tsx
    - src/lib/actions/gdpr.ts
decisions:
  - "[Phase 23]: PrimarRapoarteContent uses useTransition for period-change refetch — avoids useEffect loading duplication pattern"
  - "[Phase 23]: generatePDF is a module-private function (not exported) inside primar-rapoarte-content.tsx — collocated with its only consumer"
  - "[Phase 23]: setari/loading.tsx, cetateni/loading.tsx, anunturi/loading.tsx use generic 3-card skeleton — no page-specific skeleton needed"
  - "[Phase 23]: gdpr.ts deletion_requested_at cast via anyServiceClient — types:generate pending, same pattern as rest of primar-actions.ts"
metrics:
  duration: "6 minutes"
  tasks_completed: 2
  files_created: 12
  files_modified: 3
  completed_date: "2026-03-10"
---

# Phase 23 Plan 08: Rapoarte + Setări + Loading Skeletons Summary

**One-liner:** jsPDF rapoarte page with period-filtered tables, RHF setari form with mandat dates, and loading.tsx for all 9 primar routes.

## What Was Built

### Task 1: Rapoarte page — stats tables + jsPDF download

**PrimarRapoarteSkeleton** (`primar-rapoarte-skeleton.tsx`):
- 3 period filter pill skeletons
- 2 table skeletons (each: header + 5 rows)
- Download button skeleton in amber gradient

**PrimarRapoarteContent** (`primar-rapoarte-content.tsx`):
- Client Component with `period: "luna" | "trimestru" | "semestru"` state
- Period filter pills (amber active state) — change fires `getPrimarRapoarteData(newPeriod)` via `useTransition`
- Cereri lunare table: Luna / Total Cereri / Rezolvate / Rată Rezolvare columns, emerald color for rate
- Departamente table: Departament / Funcționari / Buget Alocat (RON) columns
- Empty states for both tables
- `generatePDF()` module-private function using jsPDF + Roboto font, saves as `raport-{period}-{year}.pdf`
- Amber gradient download button triggers PDF generation client-side

**rapoarte/page.tsx:**
- Server Component, fetches `getPrimarRapoarteData("luna")` + primarieName via `user_primarii` join
- Wraps in `<Suspense fallback={<PrimarRapoarteSkeleton />}>`

### Task 2: Setări page + all loading.tsx files

**PrimarSetariContent** (`primar-setari-content.tsx`):
- Client Component with React Hook Form + Zod 4 resolver
- Schema: `displayName` (min 2, max 100), `mandatStart` (optional), `mandatSfarsit` (optional), `emailNotifications` (boolean)
- Card 1 — Profil: displayName input, email read-only display
- Card 2 — Mandat: titlu read-only ("Primar"), mandat_start/mandat_sfarsit date inputs, year-range preview
- Card 3 — Notificări: styled toggle button for emailNotifications
- Single "Salvează" button → `updatePrimarSetari` server action → `router.refresh()`
- Success (emerald) and error (red) inline feedback banners

**setari/page.tsx:**
- Server Component fetching `getPrimarSetariData()`, renders `<PrimarSetariContent>` directly (no Suspense/skeleton)

**Loading files (9 routes):**
- Root `/primar/loading.tsx` → re-exports `PrimarDashboardSkeleton`
- `cereri/loading.tsx` → re-exports `PrimarCereriSkeleton`
- `buget/loading.tsx` → re-exports `PrimarBugetSkeleton`
- `proiecte/loading.tsx` → re-exports `PrimarProiecteSkeleton`
- `agende/loading.tsx` → re-exports `PrimarAgendeSkeleton`
- `rapoarte/loading.tsx` → re-exports `PrimarRapoarteSkeleton`
- `setari/loading.tsx`, `cetateni/loading.tsx`, `anunturi/loading.tsx` → generic 3-card pulse skeleton

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing build error in gdpr.ts**
- **Found during:** Task 2 (final pnpm build)
- **Issue:** `deletion_requested_at` column used in `requestAccountDeletion` and `cancelAccountDeletion` but not in generated Supabase types — caused TypeScript compile error that blocked the build
- **Fix:** Cast `serviceClient` as `anyServiceClient` (same pattern used throughout primar-actions.ts and other actions) with `types:generate pending` comment
- **Files modified:** `src/lib/actions/gdpr.ts`
- **Commit:** b6f8e4c

## Self-Check: PASSED

All 14 plan-specified files confirmed present. Both commits exist (3190f46, b6f8e4c). pnpm build, pnpm type-check, and pnpm lint all pass with 0 errors.
