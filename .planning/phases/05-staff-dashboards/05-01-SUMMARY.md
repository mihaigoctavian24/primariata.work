---
phase: 05-staff-dashboards
plan: 01
subsystem: database
tags: [postgres, supabase, realtime, rls, server-actions, notifications, triggers]

# Dependency graph
requires:
  - phase: 04-cereri-processing
    provides: cerere_istoric table, notify_cerere_status_change trigger, cereri workflow engine
provides:
  - Refined notification triggers (NOT-01 new cerere INSERT, NOT-02 selective staff notifications)
  - Notifications table Realtime publication (bell badge live updates)
  - Primarii UPDATE RLS policy for admin/primar role
  - Server Actions for functionar stats, admin dashboard data, primar dashboard data
  - Server Actions for primarie settings read/write with config JSONB merge
affects: [05-staff-dashboards, 05-02, 05-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DB trigger for atomic notification creation (INSERT trigger for new cerere, refined UPDATE trigger for selective staff notifications)"
    - "Server Actions for dashboard data fetching (inherits x-primarie-id from middleware, unlike API routes)"
    - "supabase as any cast pattern for cerere_istoric queries (table not in generated types)"
    - "Config JSONB merge pattern for primarie notification preferences"

key-files:
  created:
    - supabase/migrations/20260305000001_staff_dashboards_infra.sql
    - src/actions/dashboard-stats.ts
  modified: []

key-decisions:
  - "Used existing 'action_required' notification type for staff notifications (avoids CHECK constraint modification)"
  - "Separate AFTER INSERT trigger for NOT-01 (notify_new_cerere) rather than extending the existing BEFORE UPDATE trigger"
  - "createServiceRoleClient() for primarie settings UPDATE as defense-in-depth alongside new RLS policy"
  - "Client-side stat calculation from cereri result set (matching research recommendation)"
  - "Config JSONB merge reads current config first, then spreads new values (preserves existing keys)"

patterns-established:
  - "DB trigger notification pattern: AFTER INSERT for new records, selective staff loops in BEFORE UPDATE for key transitions only"
  - "Dashboard Server Actions pattern: Promise.all for parallel queries, hydrate actor names from utilizatori table"

requirements-completed: [NOT-01, NOT-02, DASH-05, DASH-09]

# Metrics
duration: 4min
completed: 2026-03-04
---

# Phase 5 Plan 01: Staff Dashboards Infrastructure Summary

**DB triggers for selective staff notifications (NOT-01/NOT-02), Realtime publication fix, primarii UPDATE RLS, and 5 Server Actions for all role-specific dashboard data**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T22:11:02Z
- **Completed:** 2026-03-03T22:14:47Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Notification triggers refined: new cerere INSERT trigger (NOT-01), selective staff notifications only on citizen resubmit and in_aprobare (NOT-02), generic all-staff loop removed
- Notifications table added to supabase_realtime publication with REPLICA IDENTITY FULL for live bell badge updates
- Primarii UPDATE RLS policy enables admin/primar to update primarie settings
- 5 Server Actions provide all data for functionar, admin, and primar dashboards

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration for staff notification triggers, Realtime fix, and primarii UPDATE RLS** - `62b88cd` (feat)
2. **Task 2: Server Actions for role-specific dashboard data** - `3864951` (feat)

## Files Created/Modified
- `supabase/migrations/20260305000001_staff_dashboards_infra.sql` - Notifications Realtime fix, notify_new_cerere INSERT trigger (NOT-01), refined notify_cerere_status_change with selective staff notifications (NOT-02), primarii_admin_update RLS policy
- `src/actions/dashboard-stats.ts` - 5 Server Actions: getFunctionarStats, getAdminDashboardData, getPrimarDashboardData, updatePrimarieSettings, getPrimarieSettings

## Decisions Made
- Used existing `action_required` notification type for staff notifications instead of creating new types -- avoids modifying the CHECK constraint on notifications.type
- Created a separate AFTER INSERT trigger (`notify_new_cerere`) for NOT-01 rather than trying to handle INSERT inside the existing BEFORE UPDATE trigger -- cleaner separation of concerns
- Used `createServiceRoleClient()` for primarie settings UPDATE as defense-in-depth alongside the new RLS UPDATE policy -- matches pattern from admin-registration.ts
- Config JSONB merge reads current config first then spreads new values, preserving any existing keys not being updated

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type mismatch on created_at nullability**
- **Found during:** Task 2 (Server Actions)
- **Issue:** cereri.created_at is `string | null` in generated types but the map callback typed it as `string`, causing TS2345
- **Fix:** Changed parameter type to `string | null` and added `?? ""` fallback when mapping
- **Files modified:** src/actions/dashboard-stats.ts
- **Verification:** `pnpm type-check` passes cleanly
- **Committed in:** 3864951 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed array index possibly undefined in staff metrics calculation**
- **Found during:** Task 2 (Server Actions)
- **Issue:** TypeScript strict mode flagged `sortedTs[i]` and `sortedTs[i-1]` as possibly undefined (TS2532)
- **Fix:** Added explicit undefined checks before computing timestamp diffs
- **Files modified:** src/actions/dashboard-stats.ts
- **Verification:** `pnpm type-check` passes cleanly
- **Committed in:** 3864951 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes are TypeScript strict mode compliance corrections. No scope creep.

## Issues Encountered
- Commit scope `05-01` rejected by commitlint -- scope must be from allowed list (db, dashboard, etc.). Used `db` and `dashboard` scopes respectively.

## User Setup Required

None - no external service configuration required. Migration should be applied via Supabase Dashboard SQL Editor.

## Next Phase Readiness
- Migration ready for Supabase SQL Editor application
- All 5 Server Actions callable from Client Components via React Query
- Plans 02 and 03 can build functionar, admin, and primar dashboard UIs consuming these Server Actions

---
*Phase: 05-staff-dashboards*
*Completed: 2026-03-04*
