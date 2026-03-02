---
phase: 02-infrastructure-stabilization
plan: 04
subsystem: infra
tags: [middleware, csp, routing, cookies, openstreetmap, seed-data]

# Dependency graph
requires:
  - phase: 01-security-foundation
    provides: RLS policies, middleware security, CSRF protection
  - phase: 02-infrastructure-stabilization (02-03)
    provides: Static OpenStreetMap map replacing Spline 3D iframe
provides:
  - Fixed middleware slug fallback (sector-1-b)
  - Session-preserving redirects via redirectWithCookies helper
  - Admin route protection in middleware (/admin/* -> /admin/login)
  - /profil accessible without primarie association
  - CSP img-src allowing OpenStreetMap tile domains
  - Seed SQL for test user associations and locality coordinates
affects: [phase-3, phase-4, phase-5, admin, dashboard, auth]

# Tech tracking
tech-stack:
  added: []
  patterns: [redirectWithCookies pattern for session-safe redirects]

key-files:
  created:
    - supabase/seed-test-data.sql
  modified:
    - src/middleware.ts
    - next.config.ts

key-decisions:
  - "redirectWithCookies helper centralizes cookie copying on all redirect responses to prevent session destruction"
  - "Admin route protection moved to middleware level (previously pages called signOut themselves)"
  - "/profil removed from protectedModules -- only needs auth, not primarie association"
  - "Spline 3D frame-src removed from CSP since iframe was replaced with static map in 02-03"
  - "Seed SQL file committed as artifact -- to be executed via Supabase Dashboard SQL Editor"

patterns-established:
  - "redirectWithCookies: always copy Supabase cookies when creating redirect responses in middleware"
  - "Admin routes protected at middleware level, not per-page signOut calls"

requirements-completed: [FIX-01, FIX-03, FIX-05, FIX-06]

# Metrics
duration: 3min
completed: 2026-03-02
---

# Phase 2 Plan 4: Middleware & CSP Fixes Summary

**Fixed middleware routing (slug fallback, cookie preservation, admin protection, profil access) and CSP blocking of OpenStreetMap tiles, with seed data for test user associations**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-02T21:58:25Z
- **Completed:** 2026-03-02T22:02:08Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Fixed hardcoded fallback slug from sector-1 to sector-1-b matching actual DB data
- Added redirectWithCookies helper ensuring all middleware redirects preserve Supabase session cookies
- Added /admin/* route protection in middleware redirecting unauthenticated users to /admin/login
- Removed /profil from protectedModules so it only requires authentication, not primarie association
- Added OpenStreetMap domains (staticmap.openstreetmap.de, tile.openstreetmap.org) to CSP img-src
- Removed unused Spline 3D frame-src from CSP
- Created seed SQL for test user_primarii entries and sector-1-b coordinates

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix middleware routing, cookie preservation, and route protection** - `7bd762f` (fix)
2. **Task 2: Add OpenStreetMap domains to CSP img-src directive** - `846681d` (fix)
3. **Task 3: Seed user_primarii entries for test users and localitate coordinates** - `e92ff14` (chore)

## Files Created/Modified
- `src/middleware.ts` - Fixed fallback slug, added redirectWithCookies helper, admin route protection, removed /profil from protectedModules
- `next.config.ts` - Added OpenStreetMap domains to CSP img-src, removed Spline frame-src
- `supabase/seed-test-data.sql` - Seed SQL for test user associations and locality coordinates

## Decisions Made
- Used a standalone helper function `redirectWithCookies` outside the middleware export to centralize cookie copying logic
- Admin route protection added at middleware level rather than per-page signOut calls -- cleaner separation of concerns
- /profil removed from protectedModules since it only needs authentication (already enforced by isProtectedRoute check)
- Spline 3D frame-src removed since the iframe was replaced with a static map in plan 02-03
- Seed SQL committed as a file artifact rather than auto-executed, since Supabase CLI does not support `db execute --file`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Supabase CLI `db execute --file` command does not exist in the installed version. Seed SQL file created as committed artifact to be executed via Supabase Dashboard SQL Editor.
- Commitlint scope validation requires specific scope names (e.g., `phase-2` instead of `02-04`). Adjusted commit scope accordingly.

## User Setup Required

**Database seed data must be executed manually.** Run `supabase/seed-test-data.sql` via the Supabase Dashboard SQL Editor to:
- Give test users (cetatean@test.com, functionar@test.com, admin@test.com) approved user_primarii associations
- Set coordinates (lat 44.4467, lng 26.0864) for sector-1-b locality

## Next Phase Readiness
- Middleware routing is now stable with correct slug handling and session preservation
- Admin routes properly protected at middleware level
- CSP allows OpenStreetMap tiles for the map widget
- After seed SQL execution, all protectedModules (/cereri, /plati, /documente, /setari, /notificari) will be accessible for test users
- Ready for remaining Phase 2 plans (02-05 through 02-07)

## Self-Check: PASSED

All files verified present. All 3 task commits verified in git log.

---
*Phase: 02-infrastructure-stabilization*
*Completed: 2026-03-02*
