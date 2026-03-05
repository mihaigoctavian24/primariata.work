# Requirements: primariaTa.work

**Defined:** 2026-03-05
**Core Value:** Citizens can submit cereri and complete plati digitally for any primarie where they're registered, with complete data isolation between primarii and proper role-based access for all user types.

## v2.0 Requirements

Requirements for the Design Revamp milestone. Starting with admin primarie module, building app-wide foundation for all future role revamps.

### Design System Foundation

- [x] **DSF-01**: CSS design token system (surfaces, borders, accents, text colors) in globals.css supporting dark + light themes
- [x] **DSF-02**: Dynamic accent color engine via CSS custom properties, persisted per-user in Supabase metadata
- [x] **DSF-03**: Theme engine integrated with next-themes supporting dark/light toggle + accent color, no FOUC
- [x] **DSF-04**: Typography scale and spacing tokens matching Figma design language (Inter font, size scale)
- [x] **DSF-05**: Motion system -- standardized Framer Motion variants (fadeIn, slideIn, stagger, spring) reusable across all roles

### App Shell

- [ ] **SHELL-01**: Collapsible sidebar component (260px to 72px) with role-adaptive navigation sections and Framer Motion spring
- [ ] **SHELL-02**: Sidebar nav config system -- each role defines its own sections/items/badges, sidebar renders generically
- [ ] **SHELL-03**: Top bar component with role badge, location selector, weather widget, theme toggle, user avatar
- [ ] **SHELL-04**: Command palette (Cmd+K) with searchable pages, actions, navigation -- content adapts per role
- [ ] **SHELL-05**: Notification drawer (slide-in panel) with real-time Supabase subscriptions, read/dismiss/filter
- [ ] **SHELL-06**: Sidebar collapse state persisted via cookie (server-readable, no hydration mismatch)
- [ ] **SHELL-07**: Page transition animations (AnimatePresence) on route changes within shell
- [ ] **SHELL-08**: Mobile responsive shell -- sidebar as sheet/drawer on small screens

### Shared Components

- [ ] **SC-01**: AnimatedCounter with requestAnimationFrame easeOutExpo
- [ ] **SC-02**: StatsCard with icon, value, label, trend indicator, color variants
- [ ] **SC-03**: DonutChart (Recharts PieChart wrapper) with center label and legend
- [ ] **SC-04**: ProgressRing (SVG strokeDashoffset) with value, label, color
- [ ] **SC-05**: LiveActivityFeed with real-time event stream and auto-scroll
- [ ] **SC-06**: CereriCard with value, label, color-coded status
- [ ] **SC-07**: ActivityChart (Recharts AreaChart) for time-series data

### Security

- [ ] **SEC-01**: Role enforcement in middleware -- each protected route validates user role before rendering
- [ ] **SEC-02**: Admin routes accessible only to admin and super_admin roles

### Admin Dashboard

- [ ] **DASH-01**: Welcome banner with admin name, primarie info, ProgressRings (uptime, cereri resolution, SLA)
- [ ] **DASH-02**: User stats by role (cetateni, functionari, primar, admini, pending) with real DB counts
- [ ] **DASH-03**: System health widget (sessions, storage, response time)
- [ ] **DASH-04**: Cereri overview with DonutChart breakdown by status
- [ ] **DASH-05**: Functionari performance table with resolution rate and online status
- [ ] **DASH-06**: Admin alerts panel with actionable items
- [ ] **DASH-07**: Live activity feed with real Supabase events

### Admin Monitorizare

- [ ] **MON-01**: Uptime chart (AreaChart) showing platform availability
- [ ] **MON-02**: Response time breakdown (API, DB, cache) with LineChart
- [ ] **MON-03**: Error rate chart with BarChart visualization
- [ ] **MON-04**: Security events log with filterable entries
- [ ] **MON-05**: Audit trail viewer with actor, action, timestamp

### Admin Utilizatori

- [ ] **UTL-01**: User list with role filter tabs
- [ ] **UTL-02**: User approve/suspend/reactivate with confirmation
- [ ] **UTL-03**: Staff invitation flow with role selection
- [ ] **UTL-04**: User profile detail drawer with activity stats, 2FA status
- [ ] **UTL-05**: Registration growth chart

### Admin Cereri Supervizare

- [ ] **CER-01**: Overview tab with cereri stats, status distribution, SLA summary
- [ ] **CER-02**: Table view with status/priority filters, SLA countdown, pagination
- [ ] **CER-03**: Kanban view with click-to-move status columns
- [ ] **CER-04**: Alerts tab showing SLA breaches, blocked cereri, escalations
- [ ] **CER-05**: Priority system (urgenta/ridicata/medie/scazuta) with color indicators
- [ ] **CER-06**: Admin notes on cereri with audit trail
- [ ] **CER-07**: Cerere reassignment to different functionar

### Admin Documente

- [ ] **DOC-01**: Folder navigation with breadcrumb
- [ ] **DOC-02**: Grid/list view toggle
- [ ] **DOC-03**: Drag-and-drop file upload to Supabase Storage
- [ ] **DOC-04**: File preview with signed URLs
- [ ] **DOC-05**: Star/favorite documents
- [ ] **DOC-06**: Storage stats bar

### Admin Financiar

- [ ] **FIN-01**: Monthly revenue AreaChart with target comparison
- [ ] **FIN-02**: Daily transaction volume BarChart
- [ ] **FIN-03**: Payment method breakdown DonutChart
- [ ] **FIN-04**: Category breakdown with progress bars
- [ ] **FIN-05**: Transaction list with status filtering

### Admin Calendar

- [ ] **CAL-01**: Full month grid (Monday-start) with event dot indicators
- [ ] **CAL-02**: Event types with distinct colors
- [ ] **CAL-03**: Event creation modal
- [ ] **CAL-04**: Day detail panel for selected day

### Admin Setari

- [ ] **SET-01**: Profil Admin tab (name, email, phone)
- [ ] **SET-02**: Configurare Primarie tab (CUI, maintenance mode)
- [ ] **SET-03**: Notificari tab (channel + category preferences)
- [ ] **SET-04**: Securitate tab (2FA status, password change)
- [ ] **SET-05**: Aspect tab with accent color picker applying across entire app

## v3.0 Requirements

Deferred to future milestones.

### Role Revamps

- **REV-01**: Cetatean role revamp using v2.0 design system and shell
- **REV-02**: Functionar role revamp using v2.0 design system and shell
- **REV-03**: Primar role revamp using v2.0 design system and shell
- **REV-04**: Super Admin role revamp using v2.0 design system and shell

### Integrations

- **INT-01**: Real Ghiseul.ro payment API integration
- **INT-02**: Real CertSign signature API integration
- **INT-03**: Real Better Stack Telemetry API (beyond Uptime API)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Drag-and-drop kanban (react-dnd) | Use click-to-move; @dnd-kit deferred to avoid React 19 peer dep risk |
| Real-time Better Stack polling | Rate limits; use manual refresh with cached snapshots |
| Calendar event DB persistence | Zustand-only for academic milestone; DB table deferred |
| CSV/Excel export from pages | UI placeholder only; Server Action generation deferred |
| 2FA enforcement server-side | Display-only; Supabase MFA configuration out of scope |
| In-platform document editing | Preview via signed URLs only |
| MUI components | Figma artifact; use shadcn/ui + lucide-react |
| react-router | Figma artifact; use Next.js App Router |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSF-01 | Phase 12 | Complete |
| DSF-02 | Phase 12 | Complete |
| DSF-03 | Phase 12 | Complete |
| DSF-04 | Phase 12 | Complete |
| DSF-05 | Phase 12 | Complete |
| SC-01 | Phase 12 | Pending |
| SC-02 | Phase 12 | Pending |
| SC-03 | Phase 12 | Pending |
| SC-04 | Phase 12 | Pending |
| SC-05 | Phase 12 | Pending |
| SC-06 | Phase 12 | Pending |
| SC-07 | Phase 12 | Pending |
| SHELL-01 | Phase 13 | Pending |
| SHELL-02 | Phase 13 | Pending |
| SHELL-03 | Phase 13 | Pending |
| SHELL-04 | Phase 13 | Pending |
| SHELL-05 | Phase 13 | Pending |
| SHELL-06 | Phase 13 | Pending |
| SHELL-07 | Phase 13 | Pending |
| SHELL-08 | Phase 13 | Pending |
| SEC-01 | Phase 13 | Pending |
| SEC-02 | Phase 13 | Pending |
| DASH-01 | Phase 14 | Pending |
| DASH-02 | Phase 14 | Pending |
| DASH-03 | Phase 14 | Pending |
| DASH-04 | Phase 14 | Pending |
| DASH-05 | Phase 14 | Pending |
| DASH-06 | Phase 14 | Pending |
| DASH-07 | Phase 14 | Pending |
| SET-01 | Phase 15 | Pending |
| SET-02 | Phase 15 | Pending |
| SET-03 | Phase 15 | Pending |
| SET-04 | Phase 15 | Pending |
| SET-05 | Phase 15 | Pending |
| UTL-01 | Phase 16 | Pending |
| UTL-02 | Phase 16 | Pending |
| UTL-03 | Phase 16 | Pending |
| UTL-04 | Phase 16 | Pending |
| UTL-05 | Phase 16 | Pending |
| CER-01 | Phase 16 | Pending |
| CER-02 | Phase 16 | Pending |
| CER-03 | Phase 16 | Pending |
| CER-04 | Phase 16 | Pending |
| CER-05 | Phase 16 | Pending |
| CER-06 | Phase 16 | Pending |
| CER-07 | Phase 16 | Pending |
| MON-01 | Phase 17 | Pending |
| MON-02 | Phase 17 | Pending |
| MON-03 | Phase 17 | Pending |
| MON-04 | Phase 17 | Pending |
| MON-05 | Phase 17 | Pending |
| DOC-01 | Phase 17 | Pending |
| DOC-02 | Phase 17 | Pending |
| DOC-03 | Phase 17 | Pending |
| DOC-04 | Phase 17 | Pending |
| DOC-05 | Phase 17 | Pending |
| DOC-06 | Phase 17 | Pending |
| FIN-01 | Phase 17 | Pending |
| FIN-02 | Phase 17 | Pending |
| FIN-03 | Phase 17 | Pending |
| FIN-04 | Phase 17 | Pending |
| FIN-05 | Phase 17 | Pending |
| CAL-01 | Phase 17 | Pending |
| CAL-02 | Phase 17 | Pending |
| CAL-03 | Phase 17 | Pending |
| CAL-04 | Phase 17 | Pending |

**Coverage:**
- v2.0 requirements: 66 total
- Mapped to phases: 66
- Unmapped: 0

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after roadmap creation*
