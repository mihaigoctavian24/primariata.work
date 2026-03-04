# Roadmap: primariaTa.work

## Overview

Transform the existing ~70% functional platform into a production-ready multi-tenant e-government SaaS. The critical path starts with fixing the data isolation architecture (junction table + per-request context), stabilizing broken routes and monitoring, then building the staff-facing workflows that turn citizen submissions into processed outcomes. Citizen-facing features, cross-primarie UX, GDPR compliance, and test coverage complete the release.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Security Foundation** - Multi-tenant data isolation architecture, RLS migration, security hardening
- [ ] **Phase 2: Infrastructure & Stabilization** - Monitoring replacement, broken route fixes, search fix, consistency fixes
- [ ] **Phase 3: Registration & Approval** - Multi-primarie registration flow with admin approval workflow
- [x] **Phase 4: Cereri Processing** - Status workflow engine, audit trail, document validation, SLA tracking (completed 2026-03-03)
- [x] **Phase 5: Staff Dashboards** - Functionar, Admin, and Primar dashboards with staff notifications (completed 2026-03-03)
- [x] **Phase 6: Citizen Features** - Documents page, PDF receipts, dynamic map, payment architecture (completed 2026-03-04)
- [x] **Phase 7: Cross-Primarie Notifications** - Notification aggregation across primarii, context switch UX (completed 2026-03-04)
- [ ] **Phase 8: Compliance & Testing** - GDPR compliance, pgTAP RLS tests, E2E test coverage
- [ ] **Phase 9: Audit Gap Closure** - Fix audit-identified bugs: dead nav links, stats enum, map 404, profile race condition, tracking updates

## Phase Details

### Phase 1: Security Foundation
**Goal**: Data isolation between primarii is architecturally correct and verified -- no user can see another primarie's data regardless of how they navigate
**Depends on**: Nothing (first phase)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07
**Success Criteria** (what must be TRUE):
  1. User active in multiple primarii sees only the currently selected primarie's data in cereri, plati, and dashboard
  2. Switching primarie in the URL changes all data context without requiring re-login
  3. Payment webhook endpoint rejects requests with invalid or missing HMAC signatures
  4. Production build has zero console.log statements; all logging goes through structured logging
  5. Database functions execute with explicit search_path, preventing injection via schema manipulation
**Plans**: 3 plans (2 parallel in Wave 1, 1 sequential in Wave 2)

Plans:
- [ ] 01-01: Database foundation -- junction table, db_pre_request, RLS rewrite, search_path fixes (SEC-01, SEC-02, SEC-03, SEC-04) [Wave 1]
- [ ] 01-02: Logging + Sentry removal -- logger utility, console.log sweep, Sentry removal (SEC-06) [Wave 1]
- [ ] 01-03: Application layer -- middleware primarie resolution, CSRF, webhook HMAC, Supabase client headers (SEC-01, SEC-05, SEC-07) [Wave 2, depends on 01-01 + 01-02]

### Phase 2: Infrastructure & Stabilization
**Goal**: All existing routes work correctly and the platform has production-grade monitoring -- no 404s, no 500s on shipped features
**Depends on**: Phase 1
**Requirements**: MON-01, MON-02, MON-03, MON-04, FIX-01, FIX-02, FIX-03, FIX-04, FIX-05, FIX-06, FIX-07
**Success Criteria** (what must be TRUE):
  1. /cereri/new route loads the cereri wizard without errors
  2. /documente route renders a document page (content populated in Phase 6)
  3. /admin and /admin/settings routes load for super_admin users
  4. Dashboard search returns results across cereri and plati without 404
  5. Better Stack receives error reports, structured logs, and Web Vitals; Sentry packages are fully removed
**Plans**: 8 plans (2 parallel in Wave 1, 1 in Wave 2, 2 parallel gap closure in Wave 3, 2 gap closure in Wave 4, 1 gap closure in Wave 5)

Plans:
- [x] 02-01: Monitoring migration -- BetterStackWebVitals, React Query/ErrorBoundary cleanup, Sentry removal (MON-01, MON-02, MON-03, MON-04) [Wave 1]
- [x] 02-02: Route fixes -- /cereri/new redirect, /admin redirect, /admin/settings redirect, /documente skeleton (FIX-01, FIX-02, FIX-03, FIX-04) [Wave 1]
- [x] 02-03: Data display fixes -- dashboard search plati, gamification points, map widget coordinates (FIX-05, FIX-06, FIX-07) [Wave 2, depends on 02-01]
- [x] 02-04: GAP CLOSURE -- Middleware routing fixes: slug fallback, cookie preservation, /admin protection, /profil access, CSP OpenStreetMap (GAPs 1,3,5,6,10,11) [Wave 3]
- [x] 02-05: GAP CLOSURE -- Admin session fixes: remove signOut calls, create /auth/logout, fix profile cache key, admin layout guard (GAPs 2,3,7,10) [Wave 3]
- [x] 02-06: GAP CLOSURE -- Dashboard stats API fix, notificari hydration mismatch (GAPs 4,8,9) [Wave 4, depends on 02-04]
- [x] 02-07: GAP CLOSURE -- Remaining bugs + Map widget theme-aware upgrade: Leaflet map, duplicate heading, loading flash, cross-primarie guard, redirectTo sanitization, sidebar prefetch (FIX-05, FIX-06, FIX-07) [Wave 4, depends on 02-04, 02-05]
- [ ] 02-08: GAP CLOSURE -- Remove signOut() from per-primarie admin access-control guards (FIX-03) [Wave 5, depends on 02-05]

### Phase 3: Registration & Approval
**Goal**: Users can register on any active primarie and receive approval from that primarie's admin before accessing modules
**Depends on**: Phase 1
**Requirements**: REG-01, REG-02, REG-03, REG-04, REG-05, REG-06
**Success Criteria** (what must be TRUE):
  1. User can register on a new primarie from the location selection flow
  2. Newly registered user sees a pending status screen and cannot access primarie modules until approved
  3. Primarie admin sees pending registrations in their dashboard and can approve or reject with a reason
  4. Approved user receives email notification and gains full access; rejected user sees the rejection reason
**Plans**: 3 plans (1 in Wave 1, 2 parallel in Wave 2)

Plans:
- [ ] 03-01-PLAN.md -- Database + registration flow: trigger extension, Realtime, RegisterForm metadata, auth callback, Server Actions (REG-01, REG-02) [Wave 1]
- [ ] 03-02-PLAN.md -- Pending/rejected status UI: Realtime hook, status page, dashboard integration, register button (REG-03, REG-06) [Wave 2, depends on 03-01]
- [ ] 03-03-PLAN.md -- Admin approval + notifications: Server Actions, email templates, admin dashboard widget, registration queue (REG-04, REG-05) [Wave 2, depends on 03-01]

### Phase 4: Cereri Processing
**Goal**: Cereri flow through a complete lifecycle with enforced rules -- from citizen submission through staff processing to resolution, with full audit trail
**Depends on**: Phase 1, Phase 2
**Requirements**: CER-01, CER-02, CER-03, CER-04, CER-05, CER-06
**Success Criteria** (what must be TRUE):
  1. Status transitions are enforced (invalid transitions rejected) and every change is recorded with actor, timestamp, and reason
  2. Cerere submission validates that all required documents for the cerere type are attached
  3. Overdue cereri display visual indicators based on SLA deadlines on both list and dashboard views
  4. Citizens and staff receive notifications when a cerere status changes
  5. Search across cereri works with filters for status, type, date range, and reference number
**Plans**: 3 plans (1 in Wave 1, 1 in Wave 2, 1 gap closure in Wave 3)

Plans:
- [x] 04-01-PLAN.md -- Database migration + TypeScript workflow engine: cerere_istoric table, role-based status transition triggers, SLA columns, documente_necesare JSONB, Server Actions, transition matrix, SLA utility (CER-01, CER-02, CER-03, CER-04, CER-05) [Wave 1]
- [x] 04-02-PLAN.md -- UI components + wiring: SlaIndicator, CerereTimeline, StatusTransitionDialog, InternalNoteForm, extend CereriTable/CereriFilters, update cerere detail page (CER-01, CER-02, CER-04, CER-05, CER-06) [Wave 2, depends on 04-01]
- [x] 04-03-PLAN.md -- GAP CLOSURE -- Fix cerere detail page: replace API route fetches with Server Actions for x-primarie-id header inheritance (CER-01, CER-02, CER-04, CER-05, CER-06) [Wave 3, depends on 04-02]

### Phase 5: Staff Dashboards
**Goal**: Staff can process cereri, manage registrations, and oversee primarie operations from role-appropriate dashboards
**Depends on**: Phase 3, Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, DASH-10, NOT-01, NOT-02
**Success Criteria** (what must be TRUE):
  1. Functionar sees an assigned cereri queue, can filter by status/type/deadline, change cerere status, add internal notes, and request additional documents from citizens
  2. Admin dashboard shows real user counts, cereri overview by status, registration approval queue, and staff invitation management
  3. Admin can edit primarie info and notification preferences from admin settings
  4. Primar dashboard shows cereri requiring primar-level approval, financial overview by period/type, and staff metrics
  5. Staff receive in-app notifications when citizens submit new cereri or when cereri require their action
**Plans**: 3 plans (1 in Wave 1, 2 parallel in Wave 2)

Plans:
- [x] 05-01-PLAN.md -- DB migration (notification triggers, Realtime fix, primarii UPDATE RLS) + Server Actions for all dashboard data (NOT-01, NOT-02, DASH-05, DASH-09) [Wave 1]
- [x] 05-02-PLAN.md -- Functionar dashboard (real stats + cereri queue) + Admin dashboard (user counts, cereri overview, activity feed) + admin settings page (DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08) [Wave 2, depends on 05-01]
- [x] 05-03-PLAN.md -- Primar dashboard (approval queue with inline approve/reject, financial overview, staff metrics) (DASH-09, DASH-10) [Wave 2, depends on 05-01]

### Phase 6: Citizen Features
**Goal**: Citizens have a complete document library, receive PDF receipts for payments, and see their primarie on an interactive map
**Depends on**: Phase 2, Phase 4
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, PAY-01, PAY-02, PAY-03, PAY-04, MAP-01, MAP-02, MAP-03
**Success Criteria** (what must be TRUE):
  1. /documente page lists documents attached to user's cereri and includes a public forms library with downloadable templates
  2. User can preview and download documents; dashboard "Documente Recente" widget shows actual recent documents
  3. Successful payment generates a PDF receipt with correct Romanian diacritics, stored in Supabase Storage with download link
  4. Dashboard shows real pending payment count; payment architecture uses feature flag to toggle mock vs production gateway
  5. Landing page shows a dynamic interactive map centered on the selected localitate with correct primarie location pin
**Plans**: 4 plans (3 parallel in Wave 1, 1 gap closure in Wave 2)

Plans:
- [x] 06-01-PLAN.md -- Documents page + dashboard widget: Server Actions for document fetching, populate /documente with categories, wire RecentDocumentsWidget (DOC-01, DOC-02, DOC-03, DOC-04) [Wave 1]
- [x] 06-02-PLAN.md -- PDF receipts + payment architecture: jsPDF receipt generator with Romanian fonts, QR code, Supabase Storage, chitanta endpoint, pending payment count, test mode banner (PAY-01, PAY-02, PAY-03, PAY-04) [Wave 1]
- [x] 06-03-PLAN.md -- Interactive map + Romanian labels: Leaflet zoom/flyTo/popup upgrade, PrimarieInfoCard, audit all status displays for Romanian labels (MAP-01, MAP-02, MAP-03) [Wave 1]
- [x] 06-04-PLAN.md -- GAP CLOSURE -- Landing page interactive map, wire TestModeBanner to payment pages, fix documents totalCount (DOC-04, PAY-04, MAP-01, MAP-02) [Wave 2, depends on 06-01, 06-02, 06-03]

### Phase 7: Cross-Primarie Notifications
**Goal**: Users registered at multiple primarii see aggregated notifications and can switch primarie context seamlessly from any notification
**Depends on**: Phase 1, Phase 5
**Requirements**: NOT-03, NOT-04, NOT-05
**Success Criteria** (what must be TRUE):
  1. Notification list aggregates notifications from all primarii where the user is registered
  2. Clicking a notification from a different primarie shows a confirmation popup before switching context
  3. After confirming context switch, user is redirected to the source module/page referenced by the notification
**Plans**: 2 plans (1 in Wave 1, 1 sequential in Wave 2)

Plans:
- [ ] 07-01-PLAN.md -- Foundation hooks + components: useUserPrimarii, usePrimarieSwitch, ContextSwitchDialog, primarie badges on NotificationCard and NotificationDropdownItem (NOT-03, NOT-04, NOT-05) [Wave 1]
- [ ] 07-02-PLAN.md -- Wire into NotificationDropdown header and /notificari page: cross-primarie click handling, primarie filter dropdown, context switch integration (NOT-03, NOT-04, NOT-05) [Wave 2, depends on 07-01]

### Phase 8: Compliance & Testing
**Goal**: Platform meets GDPR requirements for handling citizen data and has verified test coverage for critical security and user flows
**Depends on**: Phase 1 (for RLS tests), Phase 5 (for E2E admin tests), Phase 6 (for E2E payment tests)
**Requirements**: GDPR-01, GDPR-02, GDPR-03, GDPR-04, TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07
**Success Criteria** (what must be TRUE):
  1. Privacy policy page is accessible from footer and registration flow
  2. Cookie consent banner appears on first visit with accept/reject options that persist across sessions
  3. User can request data export and account deletion from the settings page
  4. pgTAP tests verify that RLS prevents cross-primarie data access (user A cannot see user B's data)
  5. E2E tests cover cerere submission flow, payment flow, auth flow, and admin workflows end-to-end
**Plans**: 5 plans (3 parallel in Wave 1, 2 parallel in Wave 2)

Plans:
- [ ] 08-01-PLAN.md -- Cookie consent banner, footer privacy links, /termeni page, registration privacy checkbox (GDPR-01, GDPR-02) [Wave 1]
- [ ] 08-02-PLAN.md -- Data export + account deletion: GDPR Server Actions, settings Confidentialitate tab (GDPR-03, GDPR-04) [Wave 2, depends on 08-01]
- [ ] 08-03-PLAN.md -- Unit tests: auth functions (requireAuth, requireRole, requireOwnership) + validation schemas (TEST-01, TEST-02) [Wave 1]
- [ ] 08-04-PLAN.md -- pgTAP RLS isolation tests: cross-primarie data isolation for cereri, plati, documente, notificari, user_primarii (TEST-03) [Wave 1]
- [ ] 08-05-PLAN.md -- E2E Playwright tests: auth flow, cereri submission, payment flow, admin workflows (TEST-04, TEST-05, TEST-06, TEST-07) [Wave 2, depends on 08-01]

### Phase 9: Audit Gap Closure
**Goal**: Close all gaps identified by the v1.0 milestone audit -- fix integration bugs, broken flows, and sync requirement tracking with code reality
**Depends on**: Phase 8
**Requirements**: REG-04, REG-05, DASH-07
**Gap Closure:** Closes gaps from v1.0-MILESTONE-AUDIT.md
**Success Criteria** (what must be TRUE):
  1. AdminDashboard "Invita Staff" and "Invitatii Pending" buttons navigate to working routes (not 404)
  2. Dashboard stats finalizate count reflects actual completed cereri (correct enum values)
  3. Landing page map section loads without 404 errors when a location is selected
  4. Dashboard does not flash "Eroare la incarcarea profilului" on initial load after auth redirect
  5. REQUIREMENTS.md marks REG-04 and REG-05 as Complete (matching verified code)
**Plans**: 1 plan (1 in Wave 1)

Plans:
- [ ] 09-01-PLAN.md -- Fix stats enum values, landing map query pattern, profile race condition; verify AdminDashboard nav and REQUIREMENTS.md tracking (REG-04, REG-05, DASH-07) [Wave 1]

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9
(Phases 3 and 4 can partially overlap since they share only Phase 1 as dependency. Phase 6 can begin once Phase 2 and Phase 4 are complete.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security Foundation | 3/3 | Complete | 2026-03-02 |
| 2. Infrastructure & Stabilization | 8/8 | Complete | 2026-03-02 |
| 3. Registration & Approval | 3/3 | Complete | 2026-03-03 |
| 4. Cereri Processing | 3/3 | Complete | 2026-03-03 |
| 5. Staff Dashboards | 3/3 | Complete | 2026-03-03 |
| 6. Citizen Features | 4/4 | Complete   | 2026-03-04 |
| 7. Cross-Primarie Notifications | 2/2 | Complete   | 2026-03-04 |
| 8. Compliance & Testing | 5/5 | Complete   | 2026-03-04 |
| 9. Audit Gap Closure | 0/1 | Not Started |  |

---
*Roadmap created: 2026-03-02*
*Last updated: 2026-03-04*
