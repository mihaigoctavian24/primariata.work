# Roadmap: primariaTa.work

## Milestones

- [x] **v1.0 MVP** - Phases 1-11 (shipped 2026-03-05)
- [ ] **v2.0 Design Revamp** - Phases 12-17 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-11) - SHIPPED 2026-03-05</summary>

- [x] Phase 1: Security Foundation (3/3 plans) - completed 2026-03-02
- [x] Phase 2: Infrastructure & Stabilization (8/8 plans) - completed 2026-03-02
- [x] Phase 3: Registration & Approval (3/3 plans) - completed 2026-03-03
- [x] Phase 4: Cereri Processing (3/3 plans) - completed 2026-03-03
- [x] Phase 5: Staff Dashboards (3/3 plans) - completed 2026-03-03
- [x] Phase 6: Citizen Features (4/4 plans) - completed 2026-03-04
- [x] Phase 7: Cross-Primarie Notifications (2/2 plans) - completed 2026-03-04
- [x] Phase 8: Compliance & Testing (5/5 plans) - completed 2026-03-04
- [x] Phase 9: Audit Gap Closure (1/1 plan) - completed 2026-03-04
- [x] Phase 10: Payment & GDPR Fixes (1/1 plan) - completed 2026-03-04
- [x] Phase 11: E2E Seed & Coverage (3/3 plans) - completed 2026-03-04

</details>

### v2.0 Design Revamp

**Milestone Goal:** Revamp the entire admin primarie experience based on Figma designs, establishing a shared design system (layout, components, animations, theming) that serves as the foundation for revamping all other roles in subsequent milestones.

- [x] **Phase 12: Design System Foundation** - CSS tokens, shared components, motion system, accent color engine (completed 2026-03-05)
- [x] **Phase 13: Layout Shell** - Collapsible sidebar, top bar, command palette, notification drawer, admin role enforcement (gap closure in progress) (completed 2026-03-05)
- [ ] **Phase 14: Admin Dashboard** - Welcome banner, user stats, system health, cereri overview, performance table, activity feed
- [ ] **Phase 15: Admin Settings** - 5-tab settings with accent color picker wired end-to-end
- [ ] **Phase 16: Enhanced Existing Pages** - Utilizatori management revamp + Cereri supervizare with kanban/SLA/priority
- [ ] **Phase 17: New Data Pages** - Monitorizare, Documente, Financiar, Calendar

## Phase Details

### Phase 12: Design System Foundation
**Goal**: Every admin component can reference a consistent token system for colors, spacing, typography, and motion -- with runtime accent color customization
**Depends on**: Nothing (first phase of v2.0)
**Requirements**: DSF-01, DSF-02, DSF-03, DSF-04, DSF-05, SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, SC-07
**Success Criteria** (what must be TRUE):
  1. Dark and light themes render all admin surfaces, borders, and text using CSS custom properties (no hardcoded hex colors)
  2. Changing the accent color at runtime visually updates every accent-colored element across the app without page reload
  3. Framer Motion animation variants (fadeIn, slideIn, stagger, spring) can be imported and applied to any component with a single prop
  4. All 7 shared components (AnimatedCounter, StatsCard, DonutChart, ProgressRing, LiveActivityFeed, CereriCard, ActivityChart) render correctly in both themes with sample data
  5. Typography and spacing follow a consistent scale matching the Figma design language
**Plans**: 2 plans

Plans:
- [x] 12-01-PLAN.md — oklch token system, accent color engine, typography scale, motion variants
- [ ] 12-02-PLAN.md — 7 shared admin components (AnimatedCounter, StatsCard, DonutChart, ProgressRing, LiveActivityFeed, CereriCard, ActivityChart)

### Phase 13: Layout Shell
**Goal**: Admin users see a new sidebar + top bar shell with navigation, command palette, and notification drawer -- enforced to admin role only
**Depends on**: Phase 12
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, SHELL-06, SHELL-07, SHELL-08, SEC-01, SEC-02
**Success Criteria** (what must be TRUE):
  1. Admin sees a collapsible sidebar (260px to 72px) with smooth spring animation, and collapse state persists across page reloads without layout shift
  2. Admin can open command palette with Cmd+K, search pages and actions, and navigate -- palette does not trigger inside form inputs
  3. Admin can open notification drawer showing real-time notifications from Supabase with read/dismiss/filter functionality
  4. Non-admin users navigating to /admin routes are redirected by middleware before any UI renders
  5. On mobile screens, sidebar renders as a slide-out drawer/sheet instead of a fixed panel
**Plans**: 4 plans

Plans:
- [x] 13-01-PLAN.md — Collapsible sidebar, top bar, nav config system, cookie persistence, page transitions, mobile responsive, middleware role enforcement
- [x] 13-02-PLAN.md — Command palette (Cmd+K) with live Supabase search, notification drawer with real-time updates and filtering
- [ ] 13-03-PLAN.md — Gap closure: Move admin shell from /admin/* to /app/[judet]/[localitate]/admin/*, revert Survey Admin layout, update middleware
- [ ] 13-04-PLAN.md — Gap closure: Redesign notification drawer (Figma match), fix unread badge, fix a11y console errors

### Phase 14: Admin Dashboard
**Goal**: Admin lands on a data-rich dashboard showing real platform metrics -- user counts, cereri status, staff performance, and live activity
**Depends on**: Phase 13
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07
**Success Criteria** (what must be TRUE):
  1. Dashboard displays real user counts by role (cetateni, functionari, primar, admini, pending) with animated counters sourced from the database
  2. Cereri status distribution renders as an interactive donut chart with accurate counts per status
  3. Functionari performance table shows resolution rates and online status for each staff member
  4. Live activity feed updates in real-time as events occur in the primarie (new cereri, status changes, user registrations)
  5. Welcome banner shows admin name, primarie info, and ProgressRings for uptime, cereri resolution rate, and SLA compliance
**Plans**: 2 plans

Plans:
- [ ] 14-01: TBD
- [ ] 14-02: TBD

### Phase 15: Admin Settings
**Goal**: Admin can configure their profile, primarie settings, notification preferences, security options, and visual appearance including accent color
**Depends on**: Phase 14
**Requirements**: SET-01, SET-02, SET-03, SET-04, SET-05
**Success Criteria** (what must be TRUE):
  1. Admin can update profile information (name, email, phone) and changes persist to database
  2. Admin can configure primarie settings (CUI, maintenance mode toggle) and changes take effect immediately
  3. Admin can select an accent color from presets or enter a custom hex, and the color applies across every themed element in the app instantly and persists across sessions
  4. Notification preferences (channel + category) save to user metadata and affect notification delivery
**Plans**: 2 plans

Plans:
- [ ] 15-01: TBD

### Phase 16: Enhanced Existing Pages
**Goal**: Admin has comprehensive user management with role filtering and staff invitation, plus cereri supervision with table/kanban views, SLA tracking, priority system, and escalation
**Depends on**: Phase 13
**Requirements**: UTL-01, UTL-02, UTL-03, UTL-04, UTL-05, CER-01, CER-02, CER-03, CER-04, CER-05, CER-06, CER-07
**Success Criteria** (what must be TRUE):
  1. Admin can filter users by role tabs (cetateni/functionari/primar/admini), view user profile details in a drawer, and approve/suspend/reactivate accounts with confirmation
  2. Admin can invite new staff members with role selection and the invitation flow completes end-to-end
  3. Admin can view cereri in both table and kanban (click-to-move) layouts with status/priority filters and SLA countdown indicators
  4. Admin can set cereri priority (urgenta/ridicata/medie/scazuta), add admin notes, and reassign cereri to different functionari
  5. Alerts tab surfaces SLA breaches, blocked cereri, and escalation flags requiring admin attention
**Plans**: 2 plans

Plans:
- [ ] 16-01: TBD
- [ ] 16-02: TBD

### Phase 17: New Data Pages
**Goal**: Admin has access to system monitoring, document management, financial analytics, and a calendar -- completing the full admin experience
**Depends on**: Phase 13
**Requirements**: MON-01, MON-02, MON-03, MON-04, MON-05, DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, CAL-01, CAL-02, CAL-03, CAL-04
**Success Criteria** (what must be TRUE):
  1. Monitorizare page displays uptime, response time, and error rate charts plus a filterable security events log and audit trail viewer
  2. Documente page supports folder navigation with breadcrumbs, grid/list view toggle, drag-and-drop file upload, file preview via signed URLs, and storage usage stats
  3. Financiar page shows monthly revenue chart with target comparison, daily transaction volume, payment method breakdown, category progress bars, and a filterable transaction list
  4. Calendar displays a full month grid (Monday-start) with color-coded event type indicators, event creation modal, and day detail panel
  5. All monitoring metrics route through a server-side handler (no API keys exposed to the client)
**Plans**: 2 plans

Plans:
- [ ] 17-01: TBD
- [ ] 17-02: TBD
- [ ] 17-03: TBD
- [ ] 17-04: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 12 > 13 > 14 > 15 > 16 > 17
Note: Phases 16 and 17 both depend on Phase 13 (not on each other) and could run in parallel.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Security Foundation | v1.0 | 3/3 | Complete | 2026-03-02 |
| 2. Infrastructure & Stabilization | v1.0 | 8/8 | Complete | 2026-03-02 |
| 3. Registration & Approval | v1.0 | 3/3 | Complete | 2026-03-03 |
| 4. Cereri Processing | v1.0 | 3/3 | Complete | 2026-03-03 |
| 5. Staff Dashboards | v1.0 | 3/3 | Complete | 2026-03-03 |
| 6. Citizen Features | v1.0 | 4/4 | Complete | 2026-03-04 |
| 7. Cross-Primarie Notifications | v1.0 | 2/2 | Complete | 2026-03-04 |
| 8. Compliance & Testing | v1.0 | 5/5 | Complete | 2026-03-04 |
| 9. Audit Gap Closure | v1.0 | 1/1 | Complete | 2026-03-04 |
| 10. Payment & GDPR Fixes | v1.0 | 1/1 | Complete | 2026-03-04 |
| 11. E2E Seed & Coverage | v1.0 | 3/3 | Complete | 2026-03-04 |
| 12. Design System Foundation | 2/2 | Complete    | 2026-03-05 | - |
| 13. Layout Shell | 4/4 | Complete   | 2026-03-05 | - |
| 14. Admin Dashboard | v2.0 | 0/2 | Not started | - |
| 15. Admin Settings | v2.0 | 0/1 | Not started | - |
| 16. Enhanced Existing Pages | v2.0 | 0/2 | Not started | - |
| 17. New Data Pages | v2.0 | 0/4 | Not started | - |

---
*Roadmap created: 2026-03-02*
*Last updated: 2026-03-05 after gap closure planning*
