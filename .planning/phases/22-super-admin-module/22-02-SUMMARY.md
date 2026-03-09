---
phase: 22-super-admin-module
plan: "02"
subsystem: ui
tags: [super-admin, lucide-react, next-js, redirect]

# Dependency graph
requires:
  - phase: 22-super-admin-module
    provides: Admin drawer component (admin-detail-drawer.tsx) and sidebar with admini/setari routes
provides:
  - Figma-aligned admin detail drawer with Power/PowerOff Suspendare/Activare Quick Action button
  - Legacy /admins and /settings routes redirect to canonical /admini and /setari
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/app/admin/primariata/_components/admin-detail-drawer.tsx
    - src/app/admin/primariata/admins/page.tsx
    - src/app/admin/primariata/settings/page.tsx

key-decisions:
  - "Legacy pages use Next.js redirect() with explicit :never return type for type safety"

patterns-established: []

requirements-completed: []

# Metrics
duration: 1min
completed: 2026-03-09
---

# Phase 22 Plan 02: Admin Drawer Gap + Old Routes Cleanup Summary

**Power/PowerOff Suspendare/Activare Quick Action added to admin detail drawer; legacy /admins and /settings routes redirected to Figma-canonical /admini and /setari**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-09T18:39:52Z
- **Completed:** 2026-03-09T18:41:00Z
- **Tasks:** 5 (3 code + 1 type-check + 1 commit)
- **Files modified:** 3

## Accomplishments

- Added conditional Power/PowerOff button to admin-detail-drawer.tsx Quick Actions — active admins show red Suspendare (PowerOff icon), inactive admins show emerald Activare (Power icon), matching Figma SA_AdminsPage exactly
- Imported `Power` and `PowerOff` icons from lucide-react in admin-detail-drawer.tsx
- Replaced 200-line orphaned Server Component at /admins with a 5-line redirect to /admini
- Replaced 180-line orphaned Server Component at /settings with a 5-line redirect to /setari
- TypeScript type-check passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Tasks 1-3: Admin drawer + legacy redirects** - `f4bf3e2` (feat)

## Files Created/Modified

- `src/app/admin/primariata/_components/admin-detail-drawer.tsx` - Added Power/PowerOff import and conditional Suspendare/Activare button in Quick Actions section
- `src/app/admin/primariata/admins/page.tsx` - Replaced with 5-line redirect to /admin/primariata/admini
- `src/app/admin/primariata/settings/page.tsx` - Replaced with 5-line redirect to /admin/primariata/setari

## Decisions Made

- Legacy pages use Next.js `redirect()` with explicit `: never` return type annotation for TypeScript correctness — `redirect()` throws a special NEXT_REDIRECT error at runtime, so the function never actually returns

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Commit-msg hook rejected `super-admin` scope (not in allowed list). Used `admin` scope instead, which is valid and accurate.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 22 (Super Admin Module) is complete — both plans (22-01 and 22-02) executed
- The super-admin UI fully matches the Figma reference with all Quick Actions present
- Legacy /admins and /settings orphan routes cleaned up

---
*Phase: 22-super-admin-module*
*Completed: 2026-03-09*
