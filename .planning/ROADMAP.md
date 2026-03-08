# Roadmap: primariaTa.work

## Milestones

- [x] **v1.0 MVP** - Phases 1-11 (shipped 2026-03-05)
- [ ] **v2.0 Design Revamp** - Phases 12-18 (in progress)

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
- [x] **Phase 14: Admin Dashboard** - Welcome banner, user stats, system health, cereri overview, performance table, activity feed (completed 2026-03-05)
- [x] **Phase 15: Admin Settings** - 5-tab settings with accent color picker wired end-to-end (completed 2026-03-06)
- [x] **Phase 16: Accent Color Propagation & Polish** - Make all UI elements responsive to accent color, align with Figma design, integrate avatar upload, fix admin routing, dedicated admin login page (completed 2026-03-06)
- [x] **Phase 19: All Admin Pages from Figma** - Pixel-perfect Monitorizare, Utilizatori, Cereri, Documente, Financiar, Calendar (replaces original Phase 17+18) (completed 2026-03-07)

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
- [ ] 14-01-PLAN.md — Data layer: TypeScript types, server-side query functions, API route for polling, health_checks infrastructure (migration + Edge Function)
- [ ] 14-02-PLAN.md — Dashboard UI: 8 Client Component sections (welcome banner, user stats, system health, cereri overview, activity chart, performance table, alerts, live feed) + admin page rewrite

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
- [x] 15-01-PLAN.md — Data layer: Zod schemas, Server Actions (profile, primarie config, notifications, password, appearance), verify_user_password RPC, maintenance mode middleware
- [x] 15-02-PLAN.md — Settings UI: 5-tab layout with Framer Motion animations, per-tab RHF forms (profile, primarie, notifications, security, appearance)

### Phase 16: Accent Color Propagation & Polish
**Goal**: Every UI element responds to accent color selection, visual design matches Figma references, avatar upload works, admin routing is correct, and admin staff have a dedicated login experience
**Depends on**: Phase 15
**Success Criteria** (what must be TRUE):
  1. Changing accent color in Appearance tab updates ALL gradient buttons, toggles, chart highlights, avatar backgrounds, tab indicators, and welcome banner — no hardcoded pink/violet hex values remain
  2. Gradient buttons use dynamic algorithm: selected accent color + programmatically shifted darker/lighter shade (not fixed hex pairs)
  3. Admin settings visual treatment closely matches Figma reference (inline input icons, gradient save buttons, card contrast, tab indicator)
  4. Admin can click avatar in Profile and Primarie tabs to upload a new image (using existing AvatarUpload component + Supabase Storage)
  5. Admin is redirected to /app/[judet]/[localitate]/admin after login (not citizen route), and admin cannot access citizen routes
  6. Admin staff (super_admin, admin_primarie, functionar) have a dedicated login page (/admin/login) with separate UI design from citizen login — same Supabase Auth backend but professional, staff-oriented visual experience
**Plans**: 3 plans

Plans:
- [ ] 16-01-PLAN.md — CSS accent gradient engine + systematic hex replacement + Figma visual match verification (SC-1, SC-2, SC-3)
- [ ] 16-02-PLAN.md — ClickableAvatar component + avatar upload in settings, sidebar, top bar (SC-4)
- [ ] 16-03-PLAN.md — Dedicated admin login page + admin routing fix + landing page links (SC-5, SC-6)

### Phase 19: All Admin Pages from Figma
**Goal**: Admin has all 6 remaining pages implemented as pixel-perfect Figma matches: Monitorizare, Utilizatori, Cereri supervizare, Documente, Financiar, Calendar -- completing the full admin primarie experience
**Depends on**: Phase 16 (fully complete)
**Requirements**: MON-01, MON-02, MON-03, MON-04, MON-05, UTL-01, UTL-02, UTL-03, UTL-04, UTL-05, CER-01, CER-02, CER-03, CER-04, CER-05, CER-06, CER-07, DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, CAL-01, CAL-02, CAL-03, CAL-04
**Success Criteria** (what must be TRUE):
  1. Monitorizare page displays uptime, response time, and error rate charts (mock data) plus a filterable security events log and audit trail viewer
  2. Utilizatori page (full rewrite of /admin/users) has role filter tabs, user profile drawer, approve/suspend/reactivate actions, staff invitation flow, and registration growth chart
  3. Cereri supervizare page has 4 tabs (overview, table, kanban, alerts) + priority setting, admin notes, and functionar reassignment -- all using real cereri DB data
  4. Documente page supports folder navigation, grid/list toggle, drag-and-drop upload to Supabase Storage, file preview via signed URLs, and storage usage stats
  5. Financiar page shows monthly revenue chart, daily volume, payment method breakdown, category progress bars, and filterable transaction list -- all from real plati table data
  6. Calendar page displays full month grid (Monday-start), event creation modal, day detail panel -- Zustand-only event persistence
  7. All pages: pixel-perfect Figma match, full CSS token system (no hardcoded hex), full Framer Motion animations, skeleton loaders
**Plans**: 7 plans (Wave 0 shared setup + 6 parallel page plans)

Plans:
- [ ] 19-00-PLAN.md — Wave 0: DB migration (cereri admin columns), shared getAuthContext helper, calendar + financiar utility modules with unit tests
- [ ] 19-01-PLAN.md — Monitorizare page: uptime/response/error charts (mock), services grid, security events log
- [ ] 19-02-PLAN.md — Utilizatori page: role tabs, user profile drawer, approve/suspend/invite, registration growth chart
- [ ] 19-03-PLAN.md — Cereri supervizare page: 4 tabs (overview, table, kanban, alerts), priority + notes + reassignment actions
- [ ] 19-04-PLAN.md — Documente page: Storage folder nav, grid/list toggle, drag-and-drop upload, signed URL preview, starred docs
- [ ] 19-05-PLAN.md — Financiar page: monthly revenue chart, daily volume, payment method breakdown, transaction list
- [ ] 19-06-PLAN.md — Calendar page: month grid (Monday-start), event dots, day detail panel, event creation modal, Zustand persistence

### Phase 20: Pixel-perfect admin pages — Figma alignment for Monitorizare, Utilizatori, Cereri, Documente, Financiar, Calendar

**Goal:** Full rewrite of all 6 Phase 19 admin pages as pixel-perfect Figma matches connected to real Supabase data — role color tokens, no hardcoded hex, shared component directory, serial wave execution one page at a time
**Requirements**: UTL-01, UTL-02, UTL-03, UTL-04, UTL-05, CER-01, CER-02, CER-03, CER-04, CER-05, CER-06, CER-07, FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, CAL-01, CAL-02, CAL-03, CAL-04, MON-01, MON-02, MON-03, MON-04, MON-05
**Depends on:** Phase 19
**Plans:** 4/7 plans executed

Plans:
- [ ] 20-00-PLAN.md — Wave 0 prep: role color tokens in globals.css + shared/ directory with 7 migrated/new components
- [ ] 20-01-PLAN.md — Wave 1 Utilizatori: delete + rewrite, real users data, role tabs, profile drawer, invite modal, growth chart
- [ ] 20-02-PLAN.md — Wave 2 Cereri: delete + rewrite, 4-tab UI, real cereri data, kanban click-to-move, confetti approve
- [ ] 20-03-PLAN.md — Wave 3 Financiar: delete + rewrite, real plati data, 6 KPI cards, revenue charts, transaction list
- [ ] 20-04-PLAN.md — Wave 4 Documente: delete + rewrite, Supabase Storage folder nav, upload zone, signed URL preview
- [ ] 20-05-PLAN.md — Wave 5 Calendar: delete + rewrite, Zustand events, month grid (Monday-start), event creation modal
- [ ] 20-06-PLAN.md — Wave 6 Monitorizare: delete + rewrite, mock setInterval CPU/RAM/Disk, 5-tab layout, GaugeSVG

---
*Roadmap created: 2026-03-02*
*Last updated: 2026-03-08 — Phase 20 plans created (7 serial plans: Wave 0 prep + 6 page rewrites)*
