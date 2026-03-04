---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 8 complete. All 5 compliance & testing plans executed.
stopped_at: Completed 08-05-PLAN.md
last_updated: "2026-03-04T16:24:20.778Z"
last_activity: 2026-03-04 -- Completed 08-05-PLAN.md (E2E critical user flows)
progress:
  total_phases: 8
  completed_phases: 7
  total_plans: 31
  completed_plans: 30
  percent: 87
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-02)

**Core value:** Citizens can submit cereri and complete plati digitally for any primarie where they're registered, with complete data isolation between primarii and proper role-based access for all user types.
**Current focus:** Phase 8 (Compliance & Testing) COMPLETE. All 5 plans executed.

## Current Position

Phase: 8 of 8 (Compliance & Testing) -- COMPLETE
Plan: 5 of 5 in current phase (08-05 complete)
Status: Phase 8 complete. All 5 compliance & testing plans executed.
Last activity: 2026-03-04 -- Completed 08-05-PLAN.md (E2E critical user flows)

Progress: [██████████] 97% (30/31 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 24
- Average duration: 4.8 min
- Total execution time: 1.86 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-security-foundation | 3 | 23 min | 7.7 min |
| 02-infrastructure-stabilization | 8 | 32 min | 4.0 min |
| 03-registration-approval | 3 | 16 min | 5.3 min |
| 04-cereri-processing | 3/3 | 20 min | 6.7 min |
| 05-staff-dashboards | 3/3 | 8 min | 2.7 min |

**Recent Trend:**
- Last 5 plans: 04-02 (7 min), 04-03 (4 min), 05-01 (4 min), 05-02 (2 min), 05-03 (2 min)
- Trend: accelerating; dashboard plans completing in 2 min

*Updated after each plan completion*
| Phase 06 P04 | 3min | 2 tasks | 6 files |
| Phase 06 P03 | 6min | 2 tasks | 6 files |
| Phase 06 P02 | 5min | 2 tasks | 10 files |
| Phase 05 P03 | 2min | 2 tasks | 4 files |
| Phase 05 P02 | 6 | 2 tasks | 7 files |
| Phase 06 P01 | 7min | 2 tasks | 5 files |
| Phase 07 P01 | 3min | 2 tasks | 5 files |
| Phase 07 P02 | 4min | 2 tasks | 3 files |
| Phase 08 P04 | 2min | 1 tasks | 1 files |
| Phase 08 P03 | 4min | 2 tasks | 5 files |
| Phase 08 P05 | 3min | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Phase 1 is security foundation (RLS migration + junction table) because every feature depends on correct data isolation
- [Roadmap]: Staff notifications (NOT-01, NOT-02) grouped with Staff Dashboards (Phase 5) since they are consumed through dashboard context
- [Roadmap]: Cross-primarie notifications isolated in Phase 7 because they depend on verified isolation (Phase 1) and working staff workflows (Phase 5)
- [01-01]: All RLS policies rewritten atomically in single BEGIN/COMMIT transaction
- [01-01]: Legacy current_user_primarie()/current_user_role() kept with deprecation comments for backward compatibility
- [01-01]: user_primarii includes 'primar' role alongside cetatean, functionar, admin, super_admin
- [01-01]: handle_new_user search_path changed from 'public' to '' for strict security consistency
- [01-02]: Logger context accepts unknown type with normalizeContext() to avoid 297 call-site type changes
- [01-02]: Security events always sent to Better Stack regardless of environment
- [01-02]: All logging through import { logger } from '@/lib/logger' -- never direct console.*
- [01-03]: Service role client used for slug resolution in middleware (bypasses RLS for public data lookup)
- [01-03]: x-primarie-id header set by middleware only -- never by client-side code
- [01-03]: CSRF protection via @edge-csrf/nextjs middleware rather than per-route validation
- [01-03]: Webhook endpoint /api/plati/webhook kept as 308 redirect for backward compatibility
- [02-01]: React Query error handlers always log to Better Stack (removed dev-only guard) for production observability
- [02-01]: ErrorBoundary Sentry TODOs removed -- logger.error() already sends to Better Stack
- [02-01]: CLAUDE.md updated from Sentry to Better Stack to prevent developer confusion
- [02-02]: Redirect pages use Server Components with redirect() for zero client-side overhead
- [02-02]: Documente page uses Client Component with use() for async params unwrapping (Next.js 15 pattern)
- [02-03]: PostgREST does not support ::text type casts in .or() filter strings -- use ilike for text, eq for numeric
- [02-03]: OpenStreetMap static tile for map display (free, no API key) -- interactive Mapbox GL map deferred to Phase 6
- [02-03]: Gamification points verified consistent across viewports -- no fix needed
- [02-04]: redirectWithCookies helper centralizes cookie copying on all redirect responses to prevent session destruction
- [02-04]: Admin route protection moved to middleware level (previously pages called signOut themselves)
- [02-04]: /profil removed from protectedModules -- only needs auth, not primarie association
- [02-04]: Spline 3D frame-src removed from CSP since iframe was replaced with static map in 02-03
- [02-04]: Seed SQL committed as artifact -- to be executed via Supabase Dashboard SQL Editor
- [02-05]: Server-side GET route for /auth/logout (navigation-triggered, not form action)
- [02-05]: DashboardHeader navigates to /auth/logout instead of client-side signOut to avoid race condition
- [02-05]: userId added to React Query profile cache key for cross-user isolation
- [02-05]: Admin layout auth guard is defense-in-depth alongside middleware protection
- [02-06]: API routes resolve primarie from judet/localitate slugs via service role when middleware header unavailable
- [02-06]: Explicit primarie_id filter on API queries is defense-in-depth (RLS still runs as AND)
- [02-06]: useSearchParams() must be inside Suspense boundary for Next.js 15 hydration compliance
- [02-07]: Leaflet with CartoDB dark tiles for dark mode, OSM standard for light mode (free, no API key)
- [02-07]: SVG divIcon marker instead of Leaflet default PNGs to avoid webpack/Next.js icon loading issue
- [02-07]: Cross-primarie guard uses saved_location cookie rather than DB query for lightweight middleware check
- [02-07]: prefetch={false} on sidebar links as defensive fix alongside 02-04 cookie/slug fixes
- [02-08]: Per-primarie admin guards redirect without signOut() -- matches 02-05 super-admin pattern for session preservation
- [03-01]: Service role client used for user_primarii inserts (no self-insert RLS policy exists)
- [03-01]: invited_by added to invitation RECORD SELECT for approved_by attribution in STEP 4b
- [03-01]: user_primarii database types added manually (Supabase CLI types generation not re-run)
- [03-02]: Dashboard page gates all content behind user_primarii association status check before rendering role dashboards
- [03-02]: PendingStatusPage is full-screen replacement (no partial dashboard visible for pending users)
- [03-02]: Realtime subscription on user_primarii triggers toast + page refresh on approval
- [03-02]: primarii table column is `nume_oficial` not `denumire` -- corrected from plan reference
- [04-01]: cerere_istoric uses service_role for trigger inserts (RLS would block trigger context)
- [04-01]: Type assertion helper cerereIstoricFrom() bridges new table until types regenerated
- [04-01]: UploadDocuments allows draft saves without all docs; submit route enforces validation
- [04-01]: notify_cerere_status_change() fixed: numar_cerere->numar_inregistrare, utilizator_id->solicitant_id
- [04-01]: SLA pause/resume in DB trigger (not app code) to prevent race conditions
- [04-01]: in_aprobare is primar-only approval gate between in_procesare and aprobata
- [04-02]: SLA column hidden on mobile; compact dot shown next to StatusBadge instead
- [04-02]: SLA filtering is client-side (calculateSla on loaded data) not API-level
- [04-02]: Detail page role detection via direct user_primarii query (self-contained)
- [04-03]: Server Actions replace API route fetches for cerere detail (x-primarie-id only available on /app/* paths, not /api/*)
- [04-03]: sla_total_paused_days excluded from Server Action select (not in generated types, SlaIndicator handles undefined)
- [05-01]: Separate AFTER INSERT trigger (notify_new_cerere) for NOT-01 -- cleaner than extending BEFORE UPDATE trigger
- [05-01]: Used existing 'action_required' notification type for staff notifications (avoids CHECK constraint modification)
- [05-01]: createServiceRoleClient() for primarie settings UPDATE as defense-in-depth alongside new RLS UPDATE policy
- [05-01]: Config JSONB merge reads current config first then spreads new values (preserves existing keys)
- [05-01]: Generic all-staff notification loop removed from notify_cerere_status_change; only citizen resubmit and in_aprobare trigger staff notifications
- [05-03]: Reject dialog built inline in ApprovalQueue (simple Dialog + Textarea) rather than reusing StatusTransitionDialog -- simpler UX for single-action rejection
- [05-03]: Removed StatisticsCards and Citizen Satisfaction card from PrimarDashboard -- no real data source, replaced with approval alert and real metrics
- [Phase 05]: Reject dialog built inline in ApprovalQueue rather than reusing StatusTransitionDialog -- simpler UX for single-action rejection
- [Phase 05]: CereriTable reused with no-op handlers in FuncționarDashboard (row click navigates to detail)
- [Phase 05]: System Health replaced with CereriStatusOverview (real data vs fake indicators)
- [06-02]: Roboto fonts embedded as base64 TTF (~150KB each) for Romanian diacritics in jsPDF receipts
- [06-02]: On-demand receipt generation in chitanta download endpoint as fallback when chitanta missing
- [06-02]: NEXT_PUBLIC_GHISEUL_MODE separate from GHISEUL_MODE for client-side TestModeBanner
- [06-02]: Receipt number format CHT-{YYYY}-{00001} with sequential counter per primarie
- [Phase 06]: tipuri_cereri grouped by departament_responsabil with cod prefix fallback for categorization
- [Phase 06]: DocumentQuickPreview modal replaced with window.open to signed URL for simpler preview
- [06-03]: FlyToHandler uses popupopen event for flyTo animation trigger rather than custom click handler
- [06-03]: PrimarieInfoCard uses plain Tailwind (no shadcn) for Leaflet popup compatibility
- [06-03]: ActiveRequestProgressCard fixed wrong enum keys (aprobat->aprobata, respins->respinsa, anulat->anulata)
- [06-04]: LandingMapSection uses polling (2s) + storage event listener for location reactivity without prop drilling
- [06-04]: Map section placed between Hero and Transition Zone as separate scroll snap point
- [06-04]: useDashboardDocuments exposes totalCount from Server Action; CetateeanDashboard consumes it
- [Phase 07]: useUserPrimarii queries user_primarii with inner join for flat result; usePrimarieSwitch uses window.location.href for full cache reset
- [07-02]: Primarie filter is client-side only -- API already returns all primarii via RLS on auth.uid()
- [07-02]: ContextSwitchDialog rendered outside Popover/Sheet to avoid portal stacking z-index issues
- [Phase 08]: pgTAP _test_set_context helper wraps set_config + set_request_context for per-test context simulation
- [Phase 08]: Supabase mock uses module-scoped object with delegating functions to avoid jest.mock hoisting issues
- [Phase 08]: Env-based test credentials with fallbacks for E2E specs; test.skip for seed-data-dependent tests

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: RLS migration from utilizatori.primarie_id to user_primarii junction table is high-stakes -- touches every table and every query. Must be tested exhaustively with pgTAP before any feature work.
- [Phase 1]: db_pre_request performance under Supabase connection pooling needs verification.
- [Phase 2]: @logtail/next not officially documented for Next.js 15 -- RESOLVED in 01-02: v0.3.1 installed, type-check passes, withBetterStack wraps nextConfig successfully.

## Session Continuity

Last session: 2026-03-04T16:24:20.775Z
Stopped at: Completed 08-05-PLAN.md
Resume file: None
