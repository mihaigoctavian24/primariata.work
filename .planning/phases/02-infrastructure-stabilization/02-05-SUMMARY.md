---
phase: 02-infrastructure-stabilization
plan: 05
subsystem: auth
tags: [supabase-auth, signout, react-query, cache-key, admin-guard, logout-route]

# Dependency graph
requires:
  - phase: 01-security-foundation
    provides: RLS policies and auth middleware foundation
provides:
  - Server-side /auth/logout route for clean session destruction
  - Admin pages without session-destroying access control
  - userId-keyed React Query profile cache
  - Admin layout auth guard preventing sidebar info leak
affects: [admin, dashboard, auth]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-side logout via GET route handler for navigation-triggered signOut"
    - "React Query cache key includes userId for cross-user isolation"
    - "Admin layout auth guard with loading state before rendering sidebar"

key-files:
  created:
    - src/app/auth/logout/route.ts
  modified:
    - src/app/admin/primariata/page.tsx
    - src/app/admin/primariata/primarii/page.tsx
    - src/app/admin/primariata/admins/page.tsx
    - src/app/admin/primariata/settings/page.tsx
    - src/app/admin/login/page.tsx
    - src/app/admin/users/page.tsx
    - src/app/admin/survey/page.tsx
    - src/app/admin/survey/research/page.tsx
    - src/components/dashboard/DashboardHeader.tsx
    - src/hooks/use-user-profile.ts
    - src/app/admin/layout.tsx

key-decisions:
  - "Server-side GET route for logout (navigation-triggered, not form action)"
  - "DashboardHeader navigates to /auth/logout instead of client-side signOut"
  - "userId added to React Query cache key for cross-user isolation"
  - "Admin layout auth guard is defense-in-depth alongside middleware"

patterns-established:
  - "Logout via server route: navigate to /auth/logout, never client-side signOut"
  - "Cache keys include user identity for multi-user correctness"
  - "Layout-level auth guards show loading state, never flash protected UI"

requirements-completed: [FIX-03, FIX-04]

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 2 Plan 5: Admin Session & Auth Fixes Summary

**Removed session-destroying signOut from 8 admin pages, created /auth/logout server route, fixed cross-user profile cache, added admin layout auth guard**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-02T21:58:26Z
- **Completed:** 2026-03-02T22:01:47Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Removed signOut() from all 8 admin page access control guards, preventing session destruction when non-admin users access /admin/* routes
- Created /auth/logout server-side route and updated DashboardHeader to use it (eliminates client-side signOut race condition)
- Fixed useUserProfile React Query cache key to include userId, preventing stale cross-user profile data
- Added auth guard to admin layout that shows loading state before rendering sidebar (prevents admin nav info leak)

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove signOut() calls from admin pages** - `3385b83` (fix)
2. **Task 2: Create /auth/logout route, fix header, fix cache key** - `595787a` (feat)
3. **Task 3: Add auth guard to admin layout** - `e29b280` (fix)

## Files Created/Modified
- `src/app/auth/logout/route.ts` - Server-side GET route that destroys Supabase session and redirects to landing page
- `src/app/admin/primariata/page.tsx` - Removed signOut() from super_admin access guard
- `src/app/admin/primariata/primarii/page.tsx` - Removed signOut() from super_admin access guard
- `src/app/admin/primariata/admins/page.tsx` - Removed signOut() from super_admin access guard
- `src/app/admin/primariata/settings/page.tsx` - Removed signOut() from super_admin access guard
- `src/app/admin/login/page.tsx` - Non-admin users redirected to "/" instead of signOut
- `src/app/admin/users/page.tsx` - Removed signOut() from admin access guard
- `src/app/admin/survey/page.tsx` - Removed signOut() from admin access guard
- `src/app/admin/survey/research/page.tsx` - Removed signOut() from admin access guard
- `src/components/dashboard/DashboardHeader.tsx` - Logout navigates to /auth/logout server route
- `src/hooks/use-user-profile.ts` - Cache key includes userId for cross-user isolation
- `src/app/admin/layout.tsx` - Auth guard with loading state before rendering sidebar

## Decisions Made
- Used GET route handler for /auth/logout (navigation-triggered, not form submission) -- per CLAUDE.md, Server Actions are preferred but logout is a navigation destination
- DashboardHeader logout uses router.push("/auth/logout") instead of client-side signOut to avoid cookie-clearing race condition
- userId obtained via supabase.auth.getUser() in useEffect for cache key -- simplest approach without changing hook API
- Admin layout auth guard uses dynamic import for createClient to avoid circular dependency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Commit message lint required scope from enum list (admin, auth) and body lines under 100 chars -- adjusted commit message format accordingly

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 5 UAT gaps (GAP 2, 3-pages, 7, 10-layout) addressed
- Admin access control no longer destroys citizen sessions
- Logout flow is now server-side and reliable
- Ready for remaining 02-infrastructure plans (02-04, 02-06, 02-07)

## Self-Check: PASSED

All 12 files verified present. All 3 task commits verified in git log. SUMMARY.md exists.

---
*Phase: 02-infrastructure-stabilization*
*Completed: 2026-03-03*
