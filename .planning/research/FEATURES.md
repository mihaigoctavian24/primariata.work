# Feature Landscape — Admin Primărie Design Revamp (v2.0)

**Domain:** e-Government SaaS — Admin role dashboard revamp
**Researched:** 2026-03-05
**Source:** Figma Make export (`Revamp Primarie Admin/src/app/components/pages/`) analyzed directly

---

## Scope Clarification

This research covers only **what is NEW** in the Figma design vs. what already exists. The existing v1.0 admin panel has: basic stats, activity feed, user approval flow, staff invitation, basic cereri list, basic plăți list, basic documente page, notification system, and basic settings form.

The v2.0 revamp adds a completely new layout shell (collapsible sidebar, new top bar) plus 8 redesigned pages and a set of shared components. The Figma export (`Revamp Primarie Admin/`) is the authoritative source of truth for all UI decisions.

---

## Table Stakes

Features users (admin role) expect. Missing = product feels incomplete or professionally inadequate.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Collapsible sidebar with sections** | Standard SaaS admin pattern; nav sections (Principal / Administrare / Gestiune / Sistem) | Low | Figma export uses 260px expanded → 72px collapsed with Framer Motion spring animation |
| **Role badge in header** | Admin must know their scope at a glance ("Admin Primărie") | Low | Pink gradient badge in top-left of dashboard, uses ShieldCheck icon |
| **Welcome banner with personalized greeting** | Modern admin dashboards always personalize; "Bine ai revenit, Elena!" | Low | Full-width gradient (pink → purple → indigo), floating orb animations, ProgressRings for uptime/SLA |
| **User stats by role on dashboard** | Admin's primary job is user management; cetățeni / funcționari / primar / admini / pending counts | Low-Med | 5 StatsCard components with AnimatedCounter, trend arrows, hover glow. Depends on real DB queries |
| **System health widget** | Any platform admin expects CPU / storage / API response / active sessions overview | Med | 4 metric tiles. CPU and sessions from Supabase; API response time from Better Stack |
| **Cereri donut chart overview** | Visual snapshot of cereri pipeline by status | Med | Recharts PieChart with 6 segments; legend cards; navigates to Supervizare Cereri on click |
| **Funcționari performance table** | Admin supervises staff; needs quick performance snapshot | Med | 4-item list with avatar initials, cereri resolved count, resolution rate %, online presence dot |
| **Admin alerts panel** | Actionable items the admin must address (pending accounts, inactive staff, backups, SSL) | Med | Color-coded left border, action buttons per alert. Data must come from real heuristics |
| **Live activity feed** | Real-time awareness of platform events | Med | Existing in v1.0 as Supabase Realtime; needs visual revamp to match new design system |
| **Command palette (⌘K)** | Power-user navigation; expected in any modern SaaS | Med | Fuzzy search across nav items + actions + shortcuts; keyboard arrow navigation; grouped by category |
| **Notification drawer** | User needs access to all notifications without leaving context | Med | Slide-in drawer from right; grouped by read/unread; links to relevant pages |
| **Utilizatori — user list with role filter** | Core admin function; cetățeni / funcționari / primar / admini tabs | Med | Table with search, role pills, status badges, pagination. Role hierarchy enforced (admin ≠ super_admin) |
| **Utilizatori — approve / suspend / invite actions** | Existing flow, but needs UI revamp to match new design | Med | Existing Server Actions; only UI layer changes |
| **Cereri supervizare — table view** | Admin needs to see all cereri across funcționari | Med | Search, status filter, priority filter, sort by SLA remaining; pagination |
| **Cereri — priority system (4 levels)** | SLA management requires urgenta / ridicata / medie / scazuta | Low | Color-coded: red / orange / amber / gray. Priority set by admin or auto-escalated |
| **Cereri — SLA countdown display** | Legal compliance; admin must see which cereri are at risk | Med | Days remaining with color coding (green / yellow / red), blocked state |
| **Financiar — transaction list with status filtering** | Admin oversees payments; must see success / pending / failed / refunded | Med | Paginated table with search, status filter, amount display in RON, gateway field |
| **Setări — 5 tabs** | Comprehensive settings expected; profil / primărie / notificări / securitate / aspect | Med | Existing settings has only basic primărie config; add profil, notificări granularity, securitate (2FA), aspect |
| **Setări — maintenance mode toggle** | Platform admin needs ability to take primărie offline for maintenance | Low | Boolean toggle → stored in primarii table; middleware reads it |
| **Dark mode support** | Already shipped in v1.0; must be preserved and extended to new components | Low | Tailwind CSS 4 dark variant; accent color affects both modes |

---

## Differentiators

Features that set the product apart. Not expected, but valued (especially for academic context).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Monitorizare page — uptime chart** | Real-time system health visibility beyond basic stats | High | Recharts AreaChart with 24h uptime data from Better Stack API; togglable live refresh (10s interval) |
| **Monitorizare — response time breakdown (API / DB / cache)** | Granular performance insight; separates DB from cache latency | High | LineChart with 3 series; data from Better Stack structured logs |
| **Monitorizare — error rate chart** | Proactive alerting; admin sees spikes before users report them | High | BarChart with error categories; threshold lines |
| **Monitorizare — security events log** | GDPR and audit compliance; tracks login failures, suspicious access | High | Table with event type, IP, user, timestamp, severity badges |
| **Monitorizare — audit trail viewer** | Full platform action history browsable by admin | High | Paginated table with filters (actor, action type, date range); uses cerere_istoric + future audit tables |
| **Utilizatori — user profile drawer** | Rich user profiles without leaving the list; activity stats, login count, documents uploaded | High | Slide-in panel with user's full profile, last login, department, 2FA status, notes field |
| **Utilizatori — 2FA status column** | Security-aware admin UI; shows which staff have 2FA enabled | Med | Badge column; toggle available from profile drawer |
| **Utilizatori — registration growth chart** | Shows platform adoption trend; valuable for reporting | High | AreaChart of new registrations over 7 months by role |
| **Cereri — kanban view** | Visual pipeline management alternative to table | High | Drag-and-drop (or click-to-move) columns per status; card shows priority, SLA, assignee |
| **Cereri — alerts tab** | Dedicated view for SLA breaches, escalated, blocked cereri | High | Filtered view: urgenta + overdue + escalated; sorted by severity |
| **Cereri — admin notes** | Admin can annotate cereri with private notes | Med | Notes array per cerere; appended via Server Action; timestamped |
| **Cereri — reassignment** | Admin can move cerere from one funcționar to another | Med | Dropdown of available funcționari; updates cerere.functionar_id; triggers notification |
| **Cereri — bulk actions** | Efficiency for high-volume admins | High | Multi-select with checkboxes; bulk approve / reassign / export |
| **Cereri — escalation flag** | Visual marker for cereri escalated beyond normal flow | Med | Boolean field; badge on card/row; admin sets manually or auto-set by SLA breach |
| **Documente — folder navigation** | File manager pattern; group documents by category | High | Breadcrumb navigation; folder click drills down; back button; currently stored flat |
| **Documente — grid / list toggle** | Power-user preference control | Low | View state persisted in Zustand; grid = card tiles, list = compact rows |
| **Documente — drag-and-drop upload** | Modern file upload UX; expected in 2026 | Med | Drop zone detects dragover/dragleave/drop events; uploads to Supabase Storage |
| **Documente — file preview panel** | Preview without downloading; PDF in iframe, images inline | High | Slide-in panel; Supabase Storage signed URL for preview |
| **Documente — star / favorite** | Quick access to frequently used documents | Low | Boolean toggle per file; "starred" filter view |
| **Documente — storage stats bar** | Shows used vs. total storage quota visually | Low | Progress bar; "24.7 / 100 GB" text; links to Supabase Storage |
| **Financiar — monthly revenue area chart** | Trend visibility across 7 months; colectat vs. target vs. eșuat | High | Recharts AreaChart with 3 datasets; percentage vs. target label |
| **Financiar — daily transaction volume bar chart** | Weekly pattern visibility; tranzacții count + valoare dual axes | High | BarChart; 7 days; helps identify weekday/weekend patterns |
| **Financiar — payment method breakdown donut** | Shows channel mix (card / transfer / ghișeu.ro / numerar / POS) | Med | Recharts PieChart; percentage labels; count per method |
| **Financiar — category breakdown progress bars** | Revenue by cerere category vs. target | Med | Linear progress bars with colectat/target values; color per category |
| **Financiar — refund handling** | Admin initiates refunds from transaction detail | High | Refunded status; refund action button triggers mock or real Ghișeul.ro refund API |
| **Calendar — month grid view** | Administrative scheduling beyond cereri deadlines | High | Custom calendar grid (Mon-start); today highlight; event dots per day |
| **Calendar — event types with colors** | Ședință / Deadline / Audit / Întâlnire / Training / Vizită / Review / Evaluare | Low | Color config map; legend; event type badge in detail panel |
| **Calendar — new event creation modal** | Admin creates events directly in platform | Med | Modal with title / date / time / type / location fields; saves to new events table or localStorage for demo |
| **Setări — accent color picker** | Brand customization per primărie | High | Color picker with preset swatches + custom HEX input; accent color propagates to CSS custom properties; stored in primarii table |
| **Setări — CUI field for primărie** | Romanian legal requirement; CUI is used in all official documents | Low | Text field with Romanian CUI format validation (RO + 8 digits) |
| **AnimatedCounter component** | Numeric values count up on mount; engagement and polish | Low | requestAnimationFrame easeOutExpo; reusable; target prop |
| **ProgressRing component** | Circular progress indicator for KPIs in welcome banner | Low | SVG-based; value + label + color + size props |
| **DonutChart component** | Reusable across dashboard and cereri pages | Med | Recharts PieChart wrapper with inner label; data / size / color props |
| **Framer Motion micro-animations** | Page-level staggered entrance; card hover lift; sidebar collapse spring | Low-Med | initial/animate on motion.div; whileHover on cards; layout animations for sidebar |
| **Confetti on cerere approval** | Delightful feedback moment for positive actions | Low | canvas-confetti library already imported in CereriPage; triggers on approve |

---

## Anti-Features

Features to explicitly NOT build in this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Real-time metric polling from Better Stack API** | Better Stack API has rate limits; polling every few seconds would exhaust quota | Use static snapshot data on page load; add a "Reîmprospătează" button that polls on demand |
| **Drag-and-drop kanban reorder** | DnD libraries (dnd-kit) add significant bundle weight; complex touch handling; kanban is a bonus view | Implement kanban as visual-only with click-to-move status buttons; defer true drag-and-drop |
| **Real Ghișeul.ro refund API integration** | No credentials available; mock architecture is in place | Use mock refund flow with toast confirmation; swap when real credentials arrive |
| **In-platform document editing** | No document editor (Google Docs-like); would require massive third-party integration | Preview only via signed URLs; editing happens in native apps |
| **Multi-primărie admin view** | This is the per-primărie admin role; super_admin has cross-primărie view | Keep strict RLS isolation; do not expose other primărie data |
| **Real SSL certificate management** | Not in Supabase/Vercel scope; alert is informational only | Admin alert tile is display-only; links to Cloudflare or Vercel dashboard |
| **Custom event persistence in Calendar** | New events table requires migration; out of scope for UI revamp milestone | Use optimistic local state (Zustand) for new events; persist in next milestone |
| **Export CSV from all pages** | Each page having export adds Server Action overhead; defer | Add download button as UI placeholder; wire Server Action in follow-up |
| **Full audit trail backend** | cerere_istoric covers cereri; platform-wide audit requires new audit_events table | Display existing cerere_istoric in Monitorizare audit viewer; label others as coming soon |
| **2FA enforcement server-side** | Supabase Auth MFA requires specific configuration; out of scope | Show 2FA status as display-only; toggle is UI-only until Supabase MFA is configured |

---

## Feature Dependencies

Dependencies on existing v1.0 infrastructure (must not break) and inter-feature dependencies within v2.0.

```
Layout shell (sidebar + top bar) → ALL 8 pages depend on it; build first

Shared components → Used across pages:
  AnimatedCounter      → StatsCard → Dashboard user stats
  ProgressRing         → Dashboard welcome banner
  DonutChart           → Dashboard cereri overview, Cereri overview tab
  StatsCard            → Dashboard, Cereri overview tab
  LiveActivityFeed     → Dashboard (revamped from v1.0 realtime)
  CommandPalette       → TopBar → Layout shell
  NotificationCenter   → TopBar → Layout shell (uses existing Supabase Realtime)

Dashboard → depends on:
  Utilizatori page     (navigate link from user stats section)
  Cereri page          (navigate link from cereri overview section)
  Real DB queries      (user counts by role, system health values, activity feed events)

Utilizatori page → depends on:
  Existing approval Server Actions (approveUser, suspendUser, inviteStaff)
  utilizatori table with rol, status, twoFA columns
  user_primarii junction table for multi-primărie context

Cereri supervizare → depends on:
  cereri table with prioritate column (NEW — must add migration)
  cereri table with note_admin column (NEW — must add migration or use existing notes)
  cereri table with escaladata boolean (NEW — must add migration)
  Existing cerere lifecycle Server Actions (unchanged)
  Existing cerere_istoric for audit trail in detail panel

Documente → depends on:
  Supabase Storage bucket (already provisioned)
  Existing document upload infrastructure
  Folder metadata (NEW — either virtual folders by name prefix or new folders table)

Financiar → depends on:
  plati table (existing) with method, status, category columns
  AnimatedCounter for KPI cards
  Recharts (already used in v1.0 charts)

Calendar → depends on:
  events table (NEW — requires migration, or use localStorage for v2.0)

Setări → depends on:
  primarii table with cui, maintenance_mode, accent_color columns (some NEW — need migration check)
  utilizatori table with notif_email, notif_push, notif_sms preferences (NEW columns or JSON field)
  Existing AdminSettingsForm (will be replaced by new 5-tab UI)

Monitorizare → depends on:
  Better Stack Logs API (read-only; requires BETTER_STACK_SOURCE_TOKEN env var)
  Existing structured logger (@/lib/logger) for generating log data
  cerere_istoric for audit trail viewer section

Accent color system → depends on:
  CSS custom properties on :root (accent-color variable)
  Tailwind CSS 4 config to read CSS var
  primarii table accent_color column for persistence
```

---

## MVP Recommendation

Build in this order to maximize visual progress while managing data complexity:

### Must Ship (Phase 1 — Layout Foundation)
1. **New sidebar layout** — collapsible, sectioned, animated. This gates ALL other pages.
2. **New top bar** — command palette trigger (⌘K), notification drawer, weather widget, user avatar.
3. **Shared component library** — AnimatedCounter, StatsCard, DonutChart, ProgressRing, LiveActivityFeed. These are consumed by 6 of 8 pages.
4. **Command palette (⌘K)** — keyboard-driven navigation; high perceived quality signal.

### Must Ship (Phase 2 — Core Pages)
5. **Dashboard revamp** — welcome banner, user stats by role, system health, cereri overview donut, funcționari performance table, admin alerts panel. Highest visibility page.
6. **Setări revamp** — 5 tabs; the profil + primărie tabs are straightforward; accent color picker is the key differentiator.
7. **Utilizatori revamp** — role filter tabs, profile drawer, approve/suspend UI. Builds on existing Server Actions.

### Must Ship (Phase 3 — Operational Pages)
8. **Cereri supervizare revamp** — overview + table tabs minimum; kanban and alerts tabs as enhancement.
9. **Documente revamp** — grid/list toggle, folder nav, drag-drop upload, star, storage stats.
10. **Financiar revamp** — monthly revenue chart, payment method donut, transaction list. KPI cards with AnimatedCounter.

### Defer to Next Milestone
11. **Calendar** — requires new events table migration; UI is complete in Figma but data layer is absent. Deliver as UI-only with Zustand state for the academic milestone.
12. **Monitorizare** — requires real Better Stack API integration; complex. Deliver as charts with static snapshot data; add live refresh button.

---

## Complexity Notes per Page

| Page | UI Complexity | Data Complexity | New DB Work | Dependencies |
|------|---------------|-----------------|-------------|--------------|
| Dashboard | High (7 sections, animations) | Medium (4 real queries) | None | StatsCard, DonutChart, ProgressRing, ActivityFeed |
| Monitorizare | Very High (5 chart types, filters, live) | Very High (Better Stack API) | Audit events table optional | Better Stack API token |
| Utilizatori | High (profile drawer, growth chart, filters) | Medium (existing queries) | twoFA column check | Existing approval actions |
| Cereri supervizare | Very High (4 tabs, kanban, SLA, bulk) | High (prioritate + escaladata) | prioritate, note_admin, escaladata columns | cereri + cerere_istoric |
| Documente | High (folder nav, grid/list, drag-drop, preview) | Medium | folders table or naming convention | Supabase Storage |
| Financiar | High (5 charts, transaction table) | High (plati + categories) | category column on plati | plati table + Recharts |
| Calendar | Medium (month grid, event panel, modal) | Low (static ok for v2.0) | events table (defer) | None for static version |
| Setări | Medium (5 tabs, toggles, color picker) | Low (simple form) | accent_color, cui, maintenance_mode, notif prefs | primarii table |
| Sidebar + TopBar | Medium (animations, collapse, badges) | Low (nav only) | None | Framer Motion, Zustand for collapse state |
| Command Palette | Medium (search, keyboard nav, categories) | None | None | Zustand for open state |
| Notification Drawer | Low (existing Realtime; new visual) | None (existing) | None | Existing notification system |
| Shared Components | Low-Med (port from Figma export) | None | None | Framer Motion, Recharts |

---

## Sources

- **Figma Make export** — `/Revamp Primarie Admin/src/app/components/pages/` — direct code analysis (HIGH confidence; this IS the design reference)
- **Existing codebase** — `/src/app/app/[judet]/[localitate]/admin/` — establishes what already exists (HIGH confidence)
- **PROJECT.md** — confirms v2.0 scope, constraints, tech stack (HIGH confidence)
- Architecture inference from component imports and data shapes in Figma export (HIGH confidence for features; MEDIUM confidence for exact DB schema changes needed)
