---
phase: 13-layout-shell
plan: 03
subsystem: admin
tags: [middleware, admin-shell, route-enforcement, next-layout, sidebar-config]

requires:
  - phase: 13-layout-shell/01
    provides: ShellLayout component, SidebarConfig interface, sidebar-config functions
  - phase: 13-layout-shell/02
    provides: CommandPalette and NotificationDrawer wired into ShellLayout

provides:
  - Admin Primarie shell at /app/[judet]/[localitate]/admin/* with correct sidebar config
  - Survey Admin at /admin/* reverted to DashboardSidebar/DashboardHeader layout
  - Middleware admin role enforcement for /app/*/admin/* paths
  - basePath field on SidebarConfig for dynamic CommandPalette routing

affects: [14-admin-primarie, 15-functionar-dashboard, 16-cereri-kanban]

tech-stack:
  added: []
  patterns:
    - "Dynamic sidebar config selection via usePathname() in providers"
    - "Admin role enforcement in middleware for nested /admin sub-paths"

key-files:
  created: []
  modified:
    - src/app/admin/layout.tsx
    - src/app/app/[judet]/[localitate]/layout.tsx
    - src/app/app/[judet]/[localitate]/providers.tsx
    - src/components/shell/sidebar/sidebar-config.ts
    - src/components/shell/ShellLayout.tsx
    - src/middleware.ts

key-decisions:
  - "usePathname() in CitizenProviders to detect admin sub-path and switch sidebar config (avoids route groups or layout restructuring)"
  - "Survey Admin /admin/* no longer checks user_primarii role (access control handled by its own pages)"
  - "Admin role enforcement uses existing association.rol from defense-in-depth check (no extra DB query)"

patterns-established:
  - "Dynamic role-based layout: single parent layout with client-side path detection for config switching"
  - "basePath on SidebarConfig: all config consumers derive paths from config.basePath rather than hardcoded checks"

requirements-completed: [SHELL-01, SHELL-02, SHELL-03, SHELL-06, SHELL-07, SHELL-08, SEC-01, SEC-02]

duration: 5min
completed: 2026-03-05
---

# Phase 13 Plan 03: Admin Route Correction Summary

**Admin Primarie shell moved to /app/[judet]/[localitate]/admin/* with dynamic sidebar config switching and middleware role enforcement**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T11:32:20Z
- **Completed:** 2026-03-05T11:37:48Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Reverted /admin/ layout to original DashboardSidebar/DashboardHeader pattern for Survey Admin
- CitizenProviders dynamically switches between admin and citizen sidebar config via usePathname()
- Middleware now enforces admin role for /app/[judet]/[localitate]/admin/* paths using existing association data
- Added basePath field to SidebarConfig for proper CommandPalette routing

## Task Commits

Each task was committed atomically:

1. **Task 1: Revert /admin/ layout and move admin shell** - `1c36aa5` (feat -- completed in prior session)
2. **Task 2: Update middleware admin enforcement** - `8f425d8` (feat)

## Files Created/Modified
- `src/app/admin/layout.tsx` - Reverted to DashboardSidebar/DashboardHeader (Survey Admin)
- `src/app/admin/providers.tsx` - Deleted (no longer needed)
- `src/app/app/[judet]/[localitate]/layout.tsx` - Passes basePath instead of sidebarConfig to providers
- `src/app/app/[judet]/[localitate]/providers.tsx` - Dynamic admin/citizen config selection via usePathname()
- `src/components/shell/sidebar/sidebar-config.ts` - Added basePath field to SidebarConfig interface
- `src/components/shell/ShellLayout.tsx` - Uses sidebarConfig.basePath for CommandPalette
- `src/middleware.ts` - Admin role enforcement moved from /admin/* to /app/*/admin/* paths

## Decisions Made
- Used usePathname() in CitizenProviders to detect admin sub-path and switch sidebar config dynamically, avoiding route group restructuring that would change all existing citizen URLs
- Removed user_primarii role check from /admin/* middleware block -- Survey Admin access control is handled by its own pages, middleware only ensures authentication
- Admin role enforcement for /app/*/admin/* reuses the existing association.rol from the defense-in-depth check, avoiding an additional database query

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed SecurityAction type for admin access denied logging**
- **Found during:** Task 2
- **Issue:** `"admin_access_denied"` is not a valid SecurityAction type
- **Fix:** Changed to `"access_denied"` which is a valid SecurityAction value
- **Files modified:** src/middleware.ts
- **Verification:** pnpm type-check passes
- **Committed in:** 8f425d8

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type correction. No scope creep.

## Issues Encountered
- Task 1 was already completed in a prior session (commit 1c36aa5). Verified done criteria were met and proceeded to Task 2 without duplicating work.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin Primarie shell renders at correct route with proper sidebar config
- Survey Admin layout restored to original pattern
- Middleware correctly enforces admin role for per-primarie admin paths
- Ready for Phase 14 (Admin Primarie pages) to build on this foundation

---
*Phase: 13-layout-shell*
*Completed: 2026-03-05*
