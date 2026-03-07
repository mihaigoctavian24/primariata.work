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

- [x] **SHELL-01**: Collapsible sidebar component (260px to 72px) with role-adaptive navigation sections and Framer Motion spring
- [x] **SHELL-02**: Sidebar nav config system -- each role defines its own sections/items/badges, sidebar renders generically
- [x] **SHELL-03**: Top bar component with role badge, location selector, weather widget, theme toggle, user avatar
- [x] **SHELL-04**: Command palette (Cmd+K) with searchable pages, actions, navigation -- content adapts per role
- [x] **SHELL-05**: Notification drawer (slide-in panel) with real-time Supabase subscriptions, read/dismiss/filter
- [x] **SHELL-06**: Sidebar collapse state persisted via cookie (server-readable, no hydration mismatch)
- [x] **SHELL-07**: Page transition animations (AnimatePresence) on route changes within shell
- [x] **SHELL-08**: Mobile responsive shell -- sidebar as sheet/drawer on small screens

### Shared Components

- [x] **SC-01**: AnimatedCounter with requestAnimationFrame easeOutExpo
- [x] **SC-02**: StatsCard with icon, value, label, trend indicator, color variants
- [x] **SC-03**: DonutChart (Recharts PieChart wrapper) with center label and legend
- [x] **SC-04**: ProgressRing (SVG strokeDashoffset) with value, label, color
- [x] **SC-05**: LiveActivityFeed with real-time event stream and auto-scroll
- [x] **SC-06**: CereriCard with value, label, color-coded status
- [x] **SC-07**: ActivityChart (Recharts AreaChart) for time-series data

### Security

- [x] **SEC-01**: Role enforcement in middleware -- each protected route validates user role before rendering
- [x] **SEC-02**: Admin routes accessible only to admin and super_admin roles

### Admin Dashboard

- [x] **DASH-01**: Welcome banner with admin name, primarie info, ProgressRings (uptime, cereri resolution, SLA)
- [x] **DASH-02**: User stats by role (cetateni, functionari, primar, admini, pending) with real DB counts
- [x] **DASH-03**: System health widget (sessions, storage, response time)
- [x] **DASH-04**: Cereri overview with DonutChart breakdown by status
- [x] **DASH-05**: Functionari performance table with resolution rate and online status
- [x] **DASH-06**: Admin alerts panel with actionable items
- [x] **DASH-07**: Live activity feed with real Supabase events

### Admin Monitorizare

- [x] **MON-01**: Uptime chart (AreaChart) showing platform availability
- [x] **MON-02**: Response time breakdown (API, DB, cache) with LineChart
- [x] **MON-03**: Error rate chart with BarChart visualization
- [x] **MON-04**: Security events log with filterable entries
- [x] **MON-05**: Audit trail viewer with actor, action, timestamp

### Admin Utilizatori

- [x] **UTL-01**: User list with role filter tabs
- [x] **UTL-02**: User approve/suspend/reactivate with confirmation
- [x] **UTL-03**: Staff invitation flow with role selection
- [x] **UTL-04**: User profile detail drawer with activity stats, 2FA status
- [x] **UTL-05**: Registration growth chart

### Admin Cereri Supervizare

- [x] **CER-01**: Overview tab with cereri stats, status distribution, SLA summary
- [x] **CER-02**: Table view with status/priority filters, SLA countdown, pagination
- [x] **CER-03**: Kanban view with click-to-move status columns
- [x] **CER-04**: Alerts tab showing SLA breaches, blocked cereri, escalations
- [x] **CER-05**: Priority system (urgenta/ridicata/medie/scazuta) with color indicators
- [x] **CER-06**: Admin notes on cereri with audit trail
- [x] **CER-07**: Cerere reassignment to different functionar

### Admin Documente

- [x] **DOC-01**: Folder navigation with breadcrumb
- [x] **DOC-02**: Grid/list view toggle
- [x] **DOC-03**: Drag-and-drop file upload to Supabase Storage
- [x] **DOC-04**: File preview with signed URLs
- [x] **DOC-05**: Star/favorite documents
- [x] **DOC-06**: Storage stats bar

### Admin Financiar

- [x] **FIN-01**: Monthly revenue AreaChart with target comparison
- [ ] **FIN-02**: Daily transaction volume BarChart
- [ ] **FIN-03**: Payment method breakdown DonutChart
- [ ] **FIN-04**: Category breakdown with progress bars
- [ ] **FIN-05**: Transaction list with status filtering

### Admin Calendar

- [x] **CAL-01**: Full month grid (Monday-start) with event dot indicators
- [x] **CAL-02**: Event types with distinct colors
- [x] **CAL-03**: Event creation modal
- [x] **CAL-04**: Day detail panel for selected day

### Admin Setari

- [x] **SET-01**: Profil Admin tab (name, email, phone)
- [x] **SET-02**: Configurare Primarie tab (CUI, maintenance mode)
- [x] **SET-03**: Notificari tab (channel + category preferences)
- [x] **SET-04**: Securitate tab (2FA status, password change)
- [x] **SET-05**: Aspect tab with accent color picker applying across entire app

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
| SC-01 | Phase 12 | Complete |
| SC-02 | Phase 12 | Complete |
| SC-03 | Phase 12 | Complete |
| SC-04 | Phase 12 | Complete |
| SC-05 | Phase 12 | Complete |
| SC-06 | Phase 12 | Complete |
| SC-07 | Phase 12 | Complete |
| SHELL-01 | Phase 13 | Complete (13-01) |
| SHELL-02 | Phase 13 | Complete (13-01) |
| SHELL-03 | Phase 13 | Complete (13-01) |
| SHELL-04 | Phase 13 | Complete |
| SHELL-05 | Phase 13 | Complete |
| SHELL-06 | Phase 13 | Complete (13-01) |
| SHELL-07 | Phase 13 | Complete (13-01) |
| SHELL-08 | Phase 13 | Complete (13-01) |
| SEC-01 | Phase 13 | Complete (13-01) |
| SEC-02 | Phase 13 | Complete (13-01) |
| DASH-01 | Phase 14 | Complete |
| DASH-02 | Phase 14 | Complete |
| DASH-03 | Phase 14 | Complete |
| DASH-04 | Phase 14 | Complete |
| DASH-05 | Phase 14 | Complete |
| DASH-06 | Phase 14 | Complete |
| DASH-07 | Phase 14 | Complete |
| SET-01 | Phase 15 | Complete |
| SET-02 | Phase 15 | Complete |
| SET-03 | Phase 15 | Complete |
| SET-04 | Phase 15 | Complete |
| SET-05 | Phase 15 | Complete |
| UTL-01 | Phase 17 | Complete |
| UTL-02 | Phase 17 | Complete |
| UTL-03 | Phase 17 | Complete |
| UTL-04 | Phase 17 | Complete |
| UTL-05 | Phase 17 | Complete |
| CER-01 | Phase 17 | Complete |
| CER-02 | Phase 17 | Complete |
| CER-03 | Phase 17 | Complete |
| CER-04 | Phase 17 | Complete |
| CER-05 | Phase 17 | Complete |
| CER-06 | Phase 17 | Complete |
| CER-07 | Phase 17 | Complete |
| MON-01 | Phase 18 | Complete |
| MON-02 | Phase 18 | Complete |
| MON-03 | Phase 18 | Complete |
| MON-04 | Phase 18 | Complete |
| MON-05 | Phase 18 | Complete |
| DOC-01 | Phase 18 | Complete |
| DOC-02 | Phase 18 | Complete |
| DOC-03 | Phase 18 | Complete |
| DOC-04 | Phase 18 | Complete |
| DOC-05 | Phase 18 | Complete |
| DOC-06 | Phase 18 | Complete |
| FIN-01 | Phase 18 | Complete |
| FIN-02 | Phase 18 | Pending |
| FIN-03 | Phase 18 | Pending |
| FIN-04 | Phase 18 | Pending |
| FIN-05 | Phase 18 | Pending |
| CAL-01 | Phase 18 | Complete |
| CAL-02 | Phase 18 | Complete |
| CAL-03 | Phase 18 | Complete |
| CAL-04 | Phase 18 | Complete |

**Coverage:**
- v2.0 requirements: 66 total
- Mapped to phases: 66
- Unmapped: 0

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-06 after phase 16 plan revision*
