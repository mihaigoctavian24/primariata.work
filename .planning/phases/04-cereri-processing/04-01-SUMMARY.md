---
phase: 04-cereri-processing
plan: 01
subsystem: database, cereri, workflow
tags: [postgresql, triggers, rls, supabase, zod, react-query, server-actions, state-machine, sla]

# Dependency graph
requires:
  - phase: 01-security-foundation
    provides: user_primarii junction table, RLS policies, per-request context
  - phase: 03-registration-approval
    provides: Server Action patterns (admin-registration.ts), notification patterns
provides:
  - cerere_istoric table with RLS and realtime for audit trail
  - Role-based status transition matrix (DB trigger + TypeScript)
  - SLA tracking with pause/resume mechanism
  - Document validation on cerere submit
  - Four Server Actions for cereri workflow (transition, note, request, resubmit)
  - useCerereTimeline hook for timeline data
  - in_aprobare status in both DB and TypeScript
affects: [phase-5, dashboard, cereri, admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DB trigger as single enforcement point for state machine transitions"
    - "Hybrid audit: DB trigger records base entry, Server Action enriches with motiv"
    - "SLA pause/resume via DB trigger arithmetic on sla_paused_at timestamps"
    - "Type assertion helper for new tables not yet in generated DB types"

key-files:
  created:
    - supabase/migrations/20260304000001_cerere_istoric_and_workflow.sql
    - src/lib/cereri/transitions.ts
    - src/lib/cereri/sla.ts
    - src/lib/cereri/document-validation.ts
    - src/lib/validations/cereri-workflow.ts
    - src/actions/cereri-workflow.ts
    - src/hooks/use-cerere-timeline.ts
  modified:
    - src/lib/validations/cereri.ts
    - src/types/api.ts
    - src/app/api/cereri/[id]/submit/route.ts
    - src/components/cereri/create-wizard/UploadDocuments.tsx

key-decisions:
  - "cerere_istoric uses service_role for inserts from triggers since RLS would block trigger-context operations"
  - "Type assertion helper (cerereIstoricFrom) bridges new table until types are regenerated"
  - "UploadDocuments allows proceeding without all docs (draft mode); submit route enforces validation"
  - "notify_cerere_status_change() fixed to use correct column names and added staff notifications"

patterns-established:
  - "Role-based transition matrix: TRANSITION_MATRIX[status][role] -> allowed statuses"
  - "SLA traffic light: green (>5 days), yellow (1-5 days), red (<=0 days), paused, none"
  - "Workflow Server Actions follow ActionResult pattern from admin-registration.ts"
  - "cerereIstoricFrom() helper pattern for accessing new tables before type regeneration"

requirements-completed: [CER-01, CER-02, CER-03, CER-04, CER-05]

# Metrics
duration: 9min
completed: 2026-03-03
---

# Phase 4 Plan 01: Workflow Engine Summary

**PostgreSQL state machine with role-based transitions, cerere_istoric audit trail, SLA pause/resume, document validation, and four Server Actions for cereri lifecycle management**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-03T15:05:44Z
- **Completed:** 2026-03-03T15:15:22Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Full role-based status transition enforcement at DB level with in_aprobare (primar-only) approval gate
- Dedicated cerere_istoric audit trail with realtime, RLS, and citizen/staff visibility filtering
- SLA deadline auto-set on submit with pause/resume mechanism during info_suplimentare
- Document validation enforced on cerere submit with structured JSONB requirements
- Fixed broken notify_cerere_status_change() trigger (numar_cerere -> numar_inregistrare, utilizator_id -> solicitant_id) and added staff notifications
- Four Server Actions: transitionCerereStatus, addInternalNote, requestDocuments, resubmitCerere

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration** - `4715bff` (feat/db)
2. **Task 2: TypeScript workflow engine** - `c8373ab` (feat/cereri)
3. **Task 3: Document validation on submit** - `e1f8371` (feat/cereri)

## Files Created/Modified

- `supabase/migrations/20260304000001_cerere_istoric_and_workflow.sql` - Full migration: cerere_istoric table, rewritten triggers, SLA columns, documente_necesare JSONB
- `src/lib/cereri/transitions.ts` - Role-based transition matrix with getAvailableTransitions, canTransition, requiresReason
- `src/lib/cereri/sla.ts` - SLA calculation utility (green/yellow/red/paused/none)
- `src/lib/cereri/document-validation.ts` - validateRequiredDocuments utility for submit-time enforcement
- `src/lib/validations/cereri-workflow.ts` - Zod schemas for transition, note, document request, resubmit
- `src/actions/cereri-workflow.ts` - Four Server Actions following admin-registration.ts pattern
- `src/hooks/use-cerere-timeline.ts` - React Query hook for cerere_istoric with visibility filtering
- `src/lib/validations/cereri.ts` - Added IN_APROBARE status, updated transitions and canCancelCerere
- `src/types/api.ts` - Added DocRequirement, CerereIstoricEntry, SLA fields on Cerere, updated TipCerere
- `src/app/api/cereri/[id]/submit/route.ts` - Added validateRequiredDocuments call before transition
- `src/components/cereri/create-wizard/UploadDocuments.tsx` - Structured document requirements display with obligatoriu/optional badges

## Decisions Made

- Used type assertion helper (cerereIstoricFrom) for cerere_istoric operations since the table is not yet in generated database types (will be resolved on next `pnpm types:generate`)
- UploadDocuments component allows citizens to proceed without all documents (draft mode); actual enforcement happens at submit route (per CONTEXT.md: "Validation on submit only")
- Fixed notify_cerere_status_change() to use correct column names (numar_inregistrare, solicitant_id) and added staff notifications in the same migration
- SLA pause/resume calculation done in DB trigger (not application code) to prevent race conditions and clock drift

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type errors for cerere_istoric table**
- **Found during:** Task 2 (TypeScript workflow engine)
- **Issue:** cerere_istoric is a new table not in generated DB types, causing TS2769 errors on .from("cerere_istoric")
- **Fix:** Created cerereIstoricFrom() helper with type assertion to bypass strict type checking
- **Files modified:** src/actions/cereri-workflow.ts, src/hooks/use-cerere-timeline.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** c8373ab (Task 2 commit)

**2. [Rule 1 - Bug] Fixed TipCerere.documente_necesare type mismatch**
- **Found during:** Task 3 (Document validation)
- **Issue:** Changing documente_necesare from string[] to DocRequirement[] broke UploadDocuments.tsx rendering
- **Fix:** Added backward-compatible runtime parsing with typeof check for legacy string[] data
- **Files modified:** src/components/cereri/create-wizard/UploadDocuments.tsx
- **Verification:** TypeScript compiles cleanly
- **Committed in:** e1f8371 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for TypeScript compilation. No scope creep.

## Issues Encountered

- commitlint requires scope from allowed list (db, cereri, etc.) -- adjusted commit scope format from plan-based (04-01) to domain-based (db, cereri)
- commitlint body-max-line-length limit of 100 chars required shortening commit bullet points

## User Setup Required

None - no external service configuration required. Migration must be applied to Supabase database via Dashboard SQL Editor.

## Next Phase Readiness

- Workflow engine is complete and ready for Phase 5 (Staff Dashboards) to consume
- cerere_istoric table provides the data source for staff activity feeds
- Transition matrix enables staff action buttons (approve, reject, request docs)
- SLA utility ready for traffic light indicators on cereri list
- Plan 04-02 can build UI components (timeline, SLA indicator, transition dialogs) on top of this foundation

## Self-Check: PASSED

- All 8 created files verified present
- All 3 task commits verified (4715bff, c8373ab, e1f8371)
- TypeScript compiles cleanly (npx tsc --noEmit passes)

---
*Phase: 04-cereri-processing*
*Completed: 2026-03-03*
