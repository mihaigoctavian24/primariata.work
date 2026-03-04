---
phase: 11-e2e-seed-coverage
plan: 01
subsystem: testing
tags: [playwright, e2e, supabase, seed-data, auth-helper]

requires:
  - phase: 01-security-foundation
    provides: RLS policies and user_primarii junction table
  - phase: 08-testing
    provides: Existing E2E spec structure and playwright config
provides:
  - Idempotent E2E seed script creating 5 auth users, 8 cereri, 2 plati, 1 document
  - Centralized authenticateAs(page, role) helper for all specs
  - Global setup wiring that seeds data before every test run
  - Test user constants (TEST_USERS, TEST_CONFIG) for all specs
affects: [11-02, 11-03, e2e-specs]

tech-stack:
  added: []
  patterns: [idempotent-seed, centralized-auth-helper, global-setup-seed-wiring]

key-files:
  created:
    - e2e/seed/test-users.ts
    - e2e/seed/seed-e2e-data.ts
    - e2e/helpers/auth.ts
  modified:
    - e2e/global-setup.ts

key-decisions:
  - "TEST_CONFIG uses actual DB slugs (judet: bucuresti, localitate: sector-1-b) not old spec values (sectorul-1)"
  - "Seed resolves existing Sector 1 primarie (localitate_id=13852) rather than creating a new test primarie"
  - "Plata status uses 'pending' and 'success' matching PlataStatus enum from validations/plati.ts"
  - "Chitanta cerere_id excluded from upsert due to schema cache issue -- plata_id is the primary link"

patterns-established:
  - "Idempotent seed: check-before-insert for auth users, upsert with onConflict for user_primarii, check numar_inregistrare for cereri"
  - "Auth helper: authenticateAs(page, role) with location selection fallback"
  - "Global setup: env validation then seed execution with descriptive error on failure"

requirements-completed: [TEST-04, TEST-05, TEST-06, TEST-07]

duration: 5min
completed: 2026-03-05
---

# Phase 11 Plan 01: E2E Seed Infrastructure Summary

**Idempotent seed script creating 5 auth users (4 roles + pending), 8 cereri across all statuses, 2 plati, and centralized authenticateAs() helper wired into global-setup**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-04T22:51:42Z
- **Completed:** 2026-03-04T22:57:28Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Idempotent seed script that creates all test data needed for 6 E2E spec files
- Centralized auth helper replacing duplicate authenticateUser functions across specs
- Global setup automatically seeds data before every Playwright test run
- Verified idempotency: re-running seed produces no errors or duplicates

## Task Commits

Each task was committed atomically:

1. **Task 1: Create test user constants and idempotent seed script** - `77ef4cf` (feat)
2. **Task 2: Create centralized auth helper and wire global-setup** - `5c2fd3c` (feat)

## Files Created/Modified
- `e2e/seed/test-users.ts` - Test user constants for 4 roles + pending user, TEST_CONFIG
- `e2e/seed/seed-e2e-data.ts` - Idempotent seedE2EData() creating users, user_primarii, tipuri_cereri, cereri, plati, chitante, documente
- `e2e/helpers/auth.ts` - authenticateAs(page, role) with login UI and location selection handling
- `e2e/global-setup.ts` - Extended to call seedE2EData() after env validation

## Decisions Made
- Used actual database slug "sector-1-b" instead of old spec value "sectorul-1" (verified via localitati table query)
- Resolved existing Sector 1 primarie (5f0404ca-f426-4ae0-8458-63af1dc41b0b) rather than creating a test-specific one per CONTEXT.md decision
- Used PlataStatus values "pending" and "success" from src/lib/validations/plati.ts
- Excluded cerere_id from chitanta upsert due to schema cache limitation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed localitate slug mismatch**
- **Found during:** Task 1 (seed script)
- **Issue:** Plan specified TEST_CONFIG.localitate = "sectorul-1" but actual DB slug is "sector-1-b"
- **Fix:** Updated TEST_CONFIG to use "sector-1-b" and rewrote primarie resolution to query localitati by slug then find primarie by localitate_id
- **Files modified:** e2e/seed/test-users.ts, e2e/seed/seed-e2e-data.ts
- **Verification:** Seed script runs successfully, finds primarie 5f0404ca
- **Committed in:** 77ef4cf (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix -- seed would fail completely without correct slug. No scope creep.

## Issues Encountered
- Chitanta upsert reported "Could not find the 'cerere_id' column of 'chitante' in the schema cache" -- removed cerere_id from insert, plata_id is the primary FK anyway
- commitlint scope restricted to predefined values -- used "config" scope instead of "11-01"

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Seed infrastructure ready for Plan 02 (spec rewrites using seeded data and auth helper)
- All 4 exported artifacts available: TEST_USERS, TEST_CONFIG, seedE2EData, authenticateAs
- Subsequent plans can import from e2e/helpers/auth.ts for authentication

---
*Phase: 11-e2e-seed-coverage*
*Completed: 2026-03-05*
