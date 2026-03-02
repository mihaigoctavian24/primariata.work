---
phase: 02-infrastructure-stabilization
plan: 01
subsystem: infra
tags: [better-stack, logtail, web-vitals, monitoring, error-tracking]

# Dependency graph
requires:
  - phase: 01-security-foundation
    provides: "logger module (src/lib/logger.ts) with Better Stack integration"
provides:
  - "Web Vitals reporting to Better Stack via BetterStackWebVitals component"
  - "Always-on error logging in React Query (not dev-only)"
  - "Zero Sentry references in source code and config"
  - "Middleware exclusion for /_betterstack/* proxy routes"
affects: [monitoring, error-handling, payments]

# Tech tracking
tech-stack:
  added: ["@logtail/next/webVitals (BetterStackWebVitals component)"]
  patterns: ["All errors logged via logger.error() to Better Stack in all environments"]

key-files:
  created: []
  modified:
    - "src/app/layout.tsx"
    - "src/middleware.ts"
    - "src/lib/react-query.ts"
    - "src/components/dashboard/ErrorBoundary.tsx"
    - "src/components/admin/research/ErrorBoundary.tsx"
    - "src/lib/payments/ghiseul-mock/server.ts"
    - "src/lib/payments/ghiseul-mock/README.md"
    - ".env.example"
    - "CLAUDE.md"

key-decisions:
  - "React Query error handlers always log to Better Stack (removed dev-only guard) for production observability"
  - "ErrorBoundary Sentry TODOs removed -- logger.error() already sends to Better Stack"
  - "CLAUDE.md updated from Sentry to Better Stack to prevent developer confusion"

patterns-established:
  - "Error logging: Always use logger.error() without environment guards -- Better Stack handles all environments"
  - "Monitoring references: All monitoring mentions should reference Better Stack, not Sentry"

requirements-completed: [MON-01, MON-02, MON-03, MON-04]

# Metrics
duration: 5min
completed: 2026-03-02
---

# Phase 2 Plan 1: Monitoring Migration Summary

**Web Vitals reporting via BetterStackWebVitals, always-on error logging in React Query, and zero Sentry references remaining in source code**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-02T16:48:24Z
- **Completed:** 2026-03-02T16:53:43Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- BetterStackWebVitals component renders in root layout, reporting LCP/FID/INP/CLS to Better Stack
- React Query QueryCache and MutationCache error handlers now always log to Better Stack (removed dev-only guard)
- Both ErrorBoundary components cleaned of Sentry references (logger.error() already handles reporting)
- Dashboard ErrorBoundary has new "Inapoi la Dashboard" navigation button
- Middleware matcher excludes /_betterstack/* proxy routes
- Zero Sentry references remain in src/, .env.example, and CLAUDE.md

## Task Commits

Each task was committed atomically:

1. **Task 1: Add BetterStackWebVitals, fix middleware, update error handlers** - `ae42ebe` (feat)
2. **Task 2: Remove all remaining Sentry references from codebase** - `83bbfcc` (chore)

## Files Created/Modified
- `src/app/layout.tsx` - Added BetterStackWebVitals import and component
- `src/middleware.ts` - Added _betterstack to matcher exclusion regex
- `src/lib/react-query.ts` - Removed dev-only guards, always log errors via logger.error()
- `src/components/dashboard/ErrorBoundary.tsx` - Removed Sentry TODO, added Dashboard link button
- `src/components/admin/research/ErrorBoundary.tsx` - Removed Sentry comment, added Better Stack note
- `src/lib/payments/ghiseul-mock/server.ts` - Updated logging comment to reference Better Stack
- `src/lib/payments/ghiseul-mock/README.md` - Updated two Sentry mentions to Better Stack
- `.env.example` - Removed Sentry env vars section, updated credentials reference
- `CLAUDE.md` - Updated infrastructure section from Sentry to Better Stack

## Decisions Made
- React Query error handlers always log to Better Stack (removed dev-only guard) for production observability
- ErrorBoundary Sentry TODOs removed since logger.error() already sends to Better Stack
- CLAUDE.md updated from Sentry to Better Stack to prevent developer confusion

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated CLAUDE.md Sentry reference**
- **Found during:** Task 2 (Sentry reference sweep)
- **Issue:** CLAUDE.md infrastructure section still listed "Sentry pentru error tracking" which is inaccurate and could mislead developers
- **Fix:** Changed to "Better Stack pentru structured logging & monitoring"
- **Files modified:** CLAUDE.md
- **Verification:** grep confirms zero Sentry references in CLAUDE.md
- **Committed in:** 83bbfcc (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Minor scope addition to keep project documentation accurate. No scope creep.

## Issues Encountered
- Task 1 changes were already committed in a prior session (commit ae42ebe from an earlier execution that created skeleton pages). The changes were verified as complete and the existing commit was used.
- First commit attempt failed due to commitlint scope validation (required predefined scopes like "config" instead of "02-01"). Resolved by using valid scope names.

## User Setup Required
None - no external service configuration required. Better Stack is already configured via @logtail/next.

## Next Phase Readiness
- All monitoring flows through Better Stack (errors, web vitals, structured logs)
- Zero Sentry references remain in source code
- Ready for remaining Phase 2 plans (02-02, 02-03)

## Self-Check: PASSED

- All 9 modified files exist on disk
- Commit ae42ebe (Task 1) found in git log
- Commit 83bbfcc (Task 2) found in git log
- 02-01-SUMMARY.md exists in phase directory

---
*Phase: 02-infrastructure-stabilization*
*Completed: 2026-03-02*
