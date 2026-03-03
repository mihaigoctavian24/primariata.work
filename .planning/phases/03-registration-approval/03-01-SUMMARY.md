---
phase: 03-registration-approval
plan: 01
subsystem: auth
tags: [supabase, trigger, realtime, server-actions, registration, multi-primarie]

# Dependency graph
requires:
  - phase: 01-security-foundation
    provides: user_primarii junction table, RLS policies, handle_new_user trigger
provides:
  - Atomic user_primarii creation on email/password registration via trigger extension
  - Pending user_primarii creation for Google OAuth users via auth callback
  - registerAtPrimarie and reapplyAtPrimarie Server Actions for existing users
  - Realtime subscription support on user_primarii table
  - Extended notifications CHECK constraint with registration types
affects: [03-registration-approval, 05-staff-dashboards]

# Tech tracking
tech-stack:
  added: []
  patterns: [service-role-client-for-system-inserts, trigger-extension-via-create-or-replace]

key-files:
  created:
    - supabase/migrations/20260303000001_extend_handle_new_user_for_user_primarii.sql
    - supabase/migrations/20260303000002_enable_realtime_user_primarii.sql
    - src/actions/registration.ts
  modified:
    - src/components/auth/RegisterForm.tsx
    - src/app/auth/callback/route.ts
    - src/types/database.types.ts

key-decisions:
  - "Service role client used for user_primarii inserts (no self-insert RLS policy exists)"
  - "invited_by column added to invitation RECORD SELECT for approved_by attribution"
  - "user_primarii database types added manually (types not regenerated from Supabase CLI)"

patterns-established:
  - "Server Actions for user-initiated registration operations (registerAtPrimarie, reapplyAtPrimarie)"
  - "Trigger STEP 4b pattern: nested BEGIN/EXCEPTION block to isolate user_primarii insert failure from utilizatori creation"

requirements-completed: [REG-01, REG-02]

# Metrics
duration: 4min
completed: 2026-03-03
---

# Phase 3 Plan 1: Registration Foundation Summary

**Trigger-based user_primarii creation on registration with Realtime, OAuth callback safety net, and Server Actions for multi-primarie join/re-apply flows**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T10:59:13Z
- **Completed:** 2026-03-03T11:03:23Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Extended handle_new_user trigger with STEP 4b for atomic user_primarii row creation on registration
- Normal registration creates pending status; invitation-based creates approved status with permissions
- OAuth callback creates pending user_primarii as safety net for Google OAuth users
- Server Actions for existing users to register at new primarie and re-apply after rejection
- Realtime enabled on user_primarii for instant status update subscriptions

## Task Commits

Each task was committed atomically:

1. **Task 1: SQL migrations -- trigger extension + Realtime + notifications CHECK** - `3711857` (feat)
2. **Task 2: RegisterForm metadata + auth callback + registration Server Actions** - `de286ce` (feat)

## Files Created/Modified
- `supabase/migrations/20260303000001_extend_handle_new_user_for_user_primarii.sql` - Trigger extension with STEP 4b for user_primarii INSERT
- `supabase/migrations/20260303000002_enable_realtime_user_primarii.sql` - REPLICA IDENTITY FULL + Realtime publication + extended notifications CHECK
- `src/actions/registration.ts` - Server Actions: registerAtPrimarie, reapplyAtPrimarie
- `src/components/auth/RegisterForm.tsx` - Passes judet_id/localitate_id in signUp metadata
- `src/app/auth/callback/route.ts` - Creates pending user_primarii for OAuth users via service role
- `src/types/database.types.ts` - Added user_primarii table definition + registration notification types

## Decisions Made
- Service role client used for user_primarii inserts in callback and Server Actions because no self-insert RLS policy exists on user_primarii
- Added invited_by to the invitation_record SELECT so STEP 4b can attribute approved_by for invitation-based registrations
- Manually added user_primarii to database.types.ts since Supabase CLI types generation was not run (types file predates user_primarii table creation)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added user_primarii to database types**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** user_primarii table not in generated database.types.ts -- TypeScript compilation failed with TS2769 errors on all .from("user_primarii") calls
- **Fix:** Manually added Row/Insert/Update/Relationships type definitions for user_primarii table, and added registration notification type variants to notifications type union
- **Files modified:** src/types/database.types.ts
- **Verification:** npx tsc --noEmit passes with zero errors
- **Committed in:** de286ce (Task 2 commit)

**2. [Rule 1 - Bug] Added invited_by to invitation record SELECT**
- **Found during:** Task 1 (SQL migration writing)
- **Issue:** STEP 4b references invitation_record.invited_by for approved_by attribution, but the STEP 2 SELECT did not include the invited_by column
- **Fix:** Added invited_by to the SELECT column list in STEP 2
- **Files modified:** supabase/migrations/20260303000001_extend_handle_new_user_for_user_primarii.sql
- **Verification:** Column now included in RECORD, STEP 4b CASE expression can reference it
- **Committed in:** 3711857 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes essential for compilation and correct invitation attribution. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Registration flow creates user_primarii rows atomically on all registration paths
- Realtime subscription on user_primarii ready for approval status UI (Plan 03-02)
- Server Actions ready for multi-primarie join UI (Plan 03-03)
- Notification types extended for registration approval/rejection flows

---
*Phase: 03-registration-approval*
*Completed: 2026-03-03*
