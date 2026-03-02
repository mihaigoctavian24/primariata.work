---
phase: 02-infrastructure-stabilization
plan: 06
subsystem: dashboard
tags: [react-query, supabase-rls, suspense, next-js-15, hydration, api]

# Dependency graph
requires:
  - phase: 02-04
    provides: "Middleware x-primarie-id header injection for /app/* routes"
provides:
  - "Dashboard stats API that resolves primarie context from query params"
  - "Notificari page with Suspense boundary for clean hydration"
affects: [dashboard, ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "API routes resolve primarie from judet/localitate slugs when middleware header unavailable"
    - "useSearchParams() wrapped in Suspense boundary for Next.js 15 compliance"

key-files:
  created: []
  modified:
    - "src/app/api/dashboard/stats/route.ts"
    - "src/hooks/use-dashboard-stats.ts"
    - "src/components/dashboard/role-dashboards/AdminDashboard.tsx"
    - "src/components/dashboard/role-dashboards/PrimarDashboard.tsx"
    - "src/components/dashboard/role-dashboards/FunctionarDashboard.tsx"
    - "src/components/dashboard/role-dashboards/CetateanDashboard.tsx"
    - "src/app/app/[judet]/[localitate]/notificari/page.tsx"

key-decisions:
  - "Explicit primarie_id filter as defense-in-depth since /api/* routes lack x-primarie-id header"
  - "Service role client for primarie slug resolution (consistent with middleware pattern from 01-03)"
  - "Suspense wrapper with skeleton loading fallback for NotificariContent"

patterns-established:
  - "API routes that need primarie context accept judet/localitate query params and resolve via service role"
  - "Client components using useSearchParams() must be wrapped in Suspense boundary"

requirements-completed: [FIX-05, FIX-07]

# Metrics
duration: 3min
completed: 2026-03-02
---

# Phase 2 Plan 6: Dashboard Stats & Notificari Fixes Summary

**Dashboard stats API resolves primarie from slugs via query params; notificari page wrapped in Suspense to fix hydration mismatch**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-02T22:06:38Z
- **Completed:** 2026-03-02T22:10:10Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Dashboard stats API no longer returns 500 -- accepts judet/localitate params to resolve primarie context
- All 4 role dashboard components pass primarie context to useDashboardStats hook
- Notificari page wrapped in Suspense boundary, preventing React hydration mismatch from useSearchParams()

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix dashboard stats API to work without middleware x-primarie-id** - `6135392` (fix)
2. **Task 2: Fix notificari hydration mismatch with Suspense boundary** - `748c7ce` (fix)

## Files Created/Modified
- `src/app/api/dashboard/stats/route.ts` - Accepts judet/localitate query params, resolves primarie via service role, filters by primarie_id
- `src/hooks/use-dashboard-stats.ts` - Accepts UseDashboardStatsOptions with judet/localitate, passes as query params
- `src/components/dashboard/role-dashboards/AdminDashboard.tsx` - Passes judet/localitate to useDashboardStats
- `src/components/dashboard/role-dashboards/PrimarDashboard.tsx` - Passes judet/localitate to useDashboardStats
- `src/components/dashboard/role-dashboards/FunctionarDashboard.tsx` - Passes judet/localitate to useDashboardStats
- `src/components/dashboard/role-dashboards/CetateanDashboard.tsx` - Passes judet/localitate to useDashboardStats
- `src/app/app/[judet]/[localitate]/notificari/page.tsx` - NotificariContent extracted, wrapped in Suspense with skeleton fallback

## Decisions Made
- Used explicit `.eq("primarie_id", primarie.id)` filter on cereri/plati queries because /api/* routes don't receive the x-primarie-id header from middleware. RLS still runs as an AND filter, so this is defense-in-depth, not a bypass.
- Service role client used for primarie slug resolution, consistent with the pattern established in 01-03 middleware.
- Suspense fallback uses NotificationCardSkeleton for consistent loading experience.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Commit scope validation required using allowed scopes (dashboard, ui) instead of plan-based scopes (02-06). Resolved by using project-configured scope values.

## User Setup Required

None - no external service configuration required.

**Note on GAP 4 (user_primarii seeding):** As documented in the plan, this requires manual DB action:
```sql
INSERT INTO user_primarii (user_id, primarie_id, rol, status)
SELECT u.id, p.id, 'cetatean', 'approved'
FROM auth.users u
CROSS JOIN primarii p
WHERE u.email IN ('cetatean@test.com', 'functionar@test.com', 'admin@test.com')
  AND p.activa = true
ON CONFLICT DO NOTHING;
```

## Next Phase Readiness
- Dashboard stats API functional for all role dashboards
- Notificari page renders cleanly without hydration warnings
- Ready for 02-07 (final infrastructure plan)

## Self-Check: PASSED

All files exist. All commits verified (6135392, 748c7ce).

---
*Phase: 02-infrastructure-stabilization*
*Completed: 2026-03-02*
