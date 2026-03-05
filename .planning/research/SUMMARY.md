# Project Research Summary

**Project:** primariaTa.work — Admin UI Design Revamp (v2.0)
**Domain:** Romanian e-government SaaS — per-primărie admin role dashboard
**Researched:** 2026-03-05
**Confidence:** HIGH

## Executive Summary

The v2.0 admin design revamp is a UI-layer milestone that upgrades an existing, functioning admin panel to match a Figma Make reference export (`Revamp Primarie Admin/`). The underlying platform — Supabase, Next.js 15 App Router, Tailwind CSS 4, shadcn/ui, Framer Motion 12, React Query 5, Zustand 5 — is already validated and production-deployed. This is not a greenfield build: it is a surgical graft of a new shell (sidebar + top bar + 8 redesigned pages) into a live codebase without disturbing existing citizen, funcționar, or primar role flows. The critical implementation insight is that the Figma export is a Vite + React Router SPA and must be treated as a visual reference only — every component requires a mandatory substitution pass to remove React Router hooks, hardcoded hex colors, MUI packages, and mock data before integration into the Next.js project.

The recommended approach is a strict dependency-ordered build: foundation utilities first (Zustand store, CSS token system, shared atomic components), then the layout shell, then the dashboard page as a design system proof point, then settings to wire the accent color system end-to-end, then the remaining operational pages in parallel. This order is driven by architecture — the Zustand `admin-ui` store is a dependency of both the sidebar and the top bar, the sidebar and top bar must exist before any page can render, and the dashboard is the highest-visibility proof of concept that de-risks all subsequent pages. Only one new npm package is required for the entire revamp: `@dnd-kit/core` + `@dnd-kit/sortable` for the kanban view, replacing the Figma export's `react-dnd` which has an open React 19 compatibility issue.

The primary risks are not technical complexity but integration discipline. The Figma export has 12 identified pitfalls covering React Router leakage, hardcoded hex colors, MUI contamination, Client Component overuse, admin role enforcement gap, mock data shipping to production, accent color not propagating, sidebar collapse FOUC, Framer Motion layoutId conflicts, notification drawer losing real-time subscriptions, Better Stack API key exposure, and command palette firing inside form inputs. Every one of these is preventable with explicit pre-conditions at the start of each phase. The two non-negotiable security items — admin role enforcement in middleware and Better Stack credentials server-side only — must be addressed in Phase 1 before any UI is accessible on staging.

---

## Key Findings

### Recommended Stack

The existing stack requires no changes for the revamp, with one addition. The Figma export uses `react-dnd` for kanban drag-and-drop, but this package has an open React 19 compatibility issue and is poorly maintained. The replacement is `@dnd-kit/core@^6.3.1` + `@dnd-kit/sortable@^8.0.0` + `@dnd-kit/utilities@^3.2.2` — actively maintained, half the bundle size, built-in accessibility, and confirmed working with React 19 in community usage.

**Core technologies (existing — no changes needed):**
- **Next.js 15.5.9 + React 19**: App Router nested layouts enable the admin shell override without disturbing other role layouts; `usePathname()` suppression in parent layout prevents double sidebar
- **Tailwind CSS 4 + `@theme inline`**: CSS custom properties bridge enables runtime accent color via `document.documentElement.style.setProperty()` — no library needed, fully native
- **Framer Motion 12**: All 8 animation patterns from the Figma export are supported (sidebar spring collapse, stagger entrance, notification drawer slide, AnimatePresence popLayout, layoutId active nav indicator); import from `framer-motion`, not `motion/react`
- **Zustand 5**: New `admin-ui.ts` store owns sidebar collapsed state, command palette open state, notification drawer open state — prevents prop drilling across the shell and enables `getState()` in keyboard event handlers
- **React Query 5**: Used for admin dashboard stats (no polling), monitoring metrics (30s poll interval), calendar events (60s stale time); always wraps Server Actions, never exposes credentials client-side
- **cmdk@1.1.1**: Already installed; use shadcn `<Command>` wrapper rather than Figma's custom implementation — provides ARIA roles, focus trapping, and keyboard navigation that the custom implementation lacks
- **react-day-picker@9.11.1**: Already installed; v9 API has breaking changes from v8 used in Figma export (`startMonth`/`endMonth` vs `fromDate`/`toDate`, CSS selector `[data-selected]` vs `.rdp-day_selected`)

**New package to install:**
```bash
pnpm add @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2
```

**Packages to explicitly NOT install:** `react-dnd`, `react-dnd-html5-backend`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `full-calendar`, `react-big-calendar`, `canvas-confetti`.

### Expected Features

**Must have (table stakes — admin experience feels complete):**
- Collapsible sidebar with 4 grouped sections (Principal / Administrare / Gestiune / Sistem), 260px expanded → 72px collapsed with Framer Motion spring
- Top bar: location badge, weather widget, command palette trigger (⌘K), notification bell with unread count, theme toggle, user avatar menu
- Dashboard: welcome banner with ProgressRings (uptime/SLA/approval rate), user stats by role with AnimatedCounters, cereri donut chart overview, funcționari performance table, admin alerts panel, live activity feed
- Utilizatori page: role filter tabs (cetățeni / funcționari / primar / admini), approve/suspend/invite UI (existing Server Actions, UI revamp only)
- Cereri supervizare: table view with status/priority filter, SLA countdown display with color coding (green/yellow/red), priority system (4 levels: urgentă/ridicată/medie/scăzută), admin notes, cerere reassignment
- Setări: 5-tab layout (profil / primărie / notificări / securitate / aspect), accent color picker with preset swatches + custom hex, maintenance mode toggle, CUI field
- Dark mode preserved and extended across all new components

**Should have (differentiators — elevated admin capability):**
- Monitorizare page: Better Stack uptime chart (AreaChart), response time breakdown (LineChart), error rate chart (BarChart), security events log, audit trail viewer
- Documente: folder navigation with breadcrumb, grid/list toggle (Zustand persisted), drag-and-drop upload to Supabase Storage, file preview panel with signed URL, star/favorite, storage stats bar
- Financiar: monthly revenue AreaChart, daily transaction volume BarChart, payment method breakdown donut, category breakdown progress bars, transaction list with status filtering
- Calendar: custom month grid (Mon-start) with event dot indicators, 8 event type colors, event creation modal
- Cereri kanban view (click-to-move status columns), cereri bulk actions (multi-select + approve/reassign), cereri escalation flag
- Animated shared component library: AnimatedCounter (RAF easeOutExpo), ProgressRing (SVG strokeDashoffset), DonutChart (Recharts PieChart wrapper), StatsCard (trend arrows + AnimatedCounter)

**Defer (explicit anti-features for this milestone):**
- Real-time Better Stack API polling (use static snapshot with manual refresh — rate limits)
- True drag-and-drop kanban (use click-to-move — defer @dnd-kit until post-academic-milestone)
- Real Ghișeul.ro refund API (mock flow with toast — no credentials available)
- Custom event persistence in Calendar (Zustand-only for academic milestone — new table migration deferred)
- CSV export from all pages (UI placeholder only — Server Actions deferred)
- 2FA enforcement server-side (display-only — Supabase MFA configuration out of scope)
- In-platform document editing (preview via signed URLs only)

### Architecture Approach

The revamp uses App Router's nested layout capability to inject a new admin shell (`admin/layout.tsx`) that overrides the parent `[localitate]/layout.tsx` for all `/admin/*` routes. The parent layout adds a `usePathname()` check to suppress DashboardSidebar and DashboardHeader when inside admin routes, preventing the double-sidebar bug. The admin shell is a Client Component composing AdminSidebar, AdminTopBar, CommandPalette, and NotificationDrawer — all driven by a single Zustand store. All existing hooks, Server Actions, and Supabase RLS policies are reused without modification. New page files are thin wrappers (under 30 lines) that import and render a matching `*Content.tsx` composite from `src/components/admin-v2/pages/`. The `admin-v2` component directory is isolated from existing `dashboard/` and `admin/` directories — zero risk of breaking other role views during this milestone.

**Major components and responsibilities:**
1. `src/stores/admin-ui.ts` — Zustand store; single source of truth for sidebar collapse (initialized from cookie to prevent FOUC), command palette open/close, notification drawer open/close
2. `src/components/admin-v2/layout/AdminSidebar.tsx` — Grouped nav sections, collapse spring animation (260px → 72px), badge counts from React Query cache shared with dashboard, ⌘K trigger button
3. `src/components/admin-v2/layout/AdminTopBar.tsx` — Location badge, weather, ⌘K button, notification bell (unread count from existing hook), theme toggle, user avatar menu with real auth data
4. `src/components/admin-v2/shell/CommandPalette.tsx` — shadcn `<Command>` inside backdrop overlay; keyboard shortcut registered once in admin layout via `useAdminUiStore.getState().openCmd()` to avoid stale closure; guards against firing inside form inputs
5. `src/components/admin-v2/shared/` — AnimatedCounter, StatsCard, DonutChart, ProgressRing, LiveActivityFeed; consumed by 6 of 8 pages; isolated in `shared/` for future promotion to `components/shared/` when other roles are revamped
6. `src/lib/accent-color.ts` — CSS var utility: `applyAccentColor()` sets `--accent-admin` on `:root`, writes to localStorage synchronously, fires async Server Action to persist to Supabase user metadata
7. `src/app/api/admin/monitoring/metrics/route.ts` — Route Handler for Better Stack API; mock data first (Phase 4 swaps to real); API key uses `BETTERSTACK_UPTIME_TOKEN` (no `NEXT_PUBLIC_` prefix)

### Critical Pitfalls

1. **React Router imports surviving Figma extraction** — Run a mandatory substitution pass before extracting any component: `useNavigate` → `useRouter()` from `next/navigation`, `useLocation` → `usePathname()`, `<Outlet>` → `{children}`, `<Link to>` → `<Link href>`. Never install `react-router` into the Next.js project. This blocks Phase 1.

2. **Hardcoded hex colors bypassing the theme system** — The Figma export uses inline `style={{ background: "#09090f" }}` on every structural element. All colors must be converted to CSS custom properties (`var(--admin-surface)`, `var(--accent-admin)`) at extraction time. Retroactive conversion across 8 pages is 10x more expensive. Add admin-specific tokens to `globals.css` dark block before any component is committed.

3. **Admin role enforcement gap** — The existing admin layout only checks authentication, not role. Any authenticated user can reach admin routes via direct URL. Fix must be in middleware (not client-side) before any admin UI ships to staging. Middleware queries `user_primarii` for `rol IN ('admin', 'super_admin')` and redirects unauthorized users to `/auth/unauthorized`.

4. **Mock data shipping to production** — The Figma notification drawer uses a 12-second `setTimeout` that adds fake events; the monitoring page uses static arrays; the calendar has a hardcoded event list. The fake notification fires for real users in production. All mock data must be removed or replaced with real Supabase queries before staging deployment.

5. **Better Stack API key exposure** — Monitoring metrics must route through a Next.js Route Handler (`/api/admin/monitoring/metrics`) or Server Action. The key must use `BETTERSTACK_UPTIME_TOKEN` with no `NEXT_PUBLIC_` prefix. Any Client Component fetching the Better Stack API directly is a security violation.

6. **Sidebar collapse FOUC** — Using `localStorage` for sidebar state causes hydration mismatch: SSR renders expanded, client script collapses — visible layout shift. Fix: persist collapse state in a cookie (readable server-side), pass as `initialCollapsed` prop from layout Server Component, initialize Zustand store with this value.

7. **MUI / Emotion package contamination** — The Figma export's `package.json` includes `@mui/icons-material` and `@emotion/react`. Do not install these. Substitute all MUI icons with `lucide-react` equivalents (already installed). Verify with `pnpm why @mui/material` returning empty in CI.

---

## Implications for Roadmap

### Phase 1: Foundation — Zustand Store, CSS Tokens, Shared Components
**Rationale:** Everything depends on these. The Zustand store is a dependency of AdminSidebar, AdminTopBar, CommandPalette, and NotificationDrawer — build it first or nothing composes. The CSS token system (`--accent-admin`, `--admin-surface`, etc.) must exist before any Figma component is extracted, or color conversion becomes retroactive and error-prone across hundreds of inline styles. Shared atomic components (AnimatedCounter, StatsCard, DonutChart, ProgressRing) are consumed by 6 of 8 pages — build once, use everywhere. This phase also includes the mandatory dependency audit to confirm MUI and react-router are absent.
**Delivers:** `admin-ui.ts` Zustand store, `accent-color.ts` utility, CSS admin tokens in `globals.css`, all 5 shared atomic components (AnimatedCounter, StatsCard, DonutChart, ProgressRing, LiveActivityFeed), dependency audit clean
**Addresses:** Design system foundation, accent color system prerequisites
**Avoids:** Hardcoded color pitfall (R2), MUI contamination pitfall (R8), accent color propagation pitfall (R9)
**Research flag:** Standard patterns — no deeper research needed

### Phase 2: Layout Shell — AdminSidebar, AdminTopBar, CommandPalette, NotificationDrawer
**Rationale:** The shell gates all 8 page revamps. No page renders correctly in the new design until the sidebar and top bar exist. The parent layout modification (pathname suppression) must happen in the same phase to prevent the double-sidebar bug. Admin role enforcement in middleware must be completed here before any UI is accessible on staging — this is a security prerequisite, not a feature.
**Delivers:** `admin/layout.tsx` (new nested shell), modified `[localitate]/layout.tsx` (suppression logic), AdminSidebar with grouped sections and collapse spring animation, AdminTopBar with real user data from auth, CommandPalette (⌘K) wired to Zustand with input-field guard, NotificationDrawer wired to existing Supabase Realtime hooks (not mock data), middleware admin role enforcement
**Addresses:** Table stakes — collapsible sidebar, command palette, notification drawer, real user info in shell
**Avoids:** React Router pitfall (R1), Server/Client boundary overuse (R3), admin role enforcement gap (R4), sidebar FOUC (R7), notification mock data (R5), command palette form input conflict (R12), double sidebar anti-pattern
**Research flag:** Standard patterns — architecture is fully specified in ARCHITECTURE.md with code examples

### Phase 3: Dashboard Page
**Rationale:** The dashboard is the highest-visibility page and the richest consumer of shared components. Building it immediately after the shell validates the entire design system end-to-end: AnimatedCounter, DonutChart, ProgressRing, StatsCard, and LiveActivityFeed all render together with real Supabase queries. It surfaces integration issues with the Zustand store and React Query hooks before those patterns are replicated across 7 more pages. A working dashboard is the most compelling academic milestone deliverable.
**Delivers:** `AdminDashboardContent.tsx` with all 7 sections (welcome banner with ProgressRings, user stats by role with AnimatedCounters and real DB queries, system health widget, cereri donut chart, funcționari performance table, admin alerts panel, live activity feed), `use-admin-stats.ts` React Query hook
**Addresses:** Table stakes — dashboard with real data, role-based user counts, live activity feed visual revamp
**Avoids:** Mock data shipping to production (all sections wired to real queries before staging)
**Research flag:** Standard patterns — Supabase aggregation queries and React Query hook patterns are well-documented

### Phase 4: Settings Page (Accent Color End-to-End)
**Rationale:** The Setări page with accent color picker is a cross-cutting feature that validates CSS variable propagation across every component built in Phases 1-3. Testing it early catches propagation failures before they are buried under 5 more pages. The maintenance mode toggle and notification preferences are straightforward form fields. Build settings before operational pages so the accent color system is verified working.
**Delivers:** `SetariContent.tsx` with 5 tabs (profil / primărie / notificări / securitate / aspect), accent color picker wired to `applyAccentColor()` + localStorage + Supabase user metadata, maintenance mode toggle writing to `primarii.maintenance_mode`, CUI field with Romanian format validation, notification preferences
**Addresses:** Differentiator — per-primărie brand customization, maintenance mode, granular notification preferences
**Avoids:** Accent color propagation pitfall (R9)
**Research flag:** Standard patterns — Tailwind 4 CSS custom property override and Supabase `updateUser()` are documented

### Phase 5: Enhanced Existing Pages — Utilizatori and Cereri Supervizare
**Rationale:** Both pages exist in v1.0 with functional Server Actions. The revamp risk is lower than new pages — the data layer is established. Only new DB work is adding `prioritate`, `note_admin`, and `escaladata` columns to the `cereri` table (with RLS extension). Both pages can be built in parallel since they share no components.
**Delivers:** `UtilizatoriContent.tsx` (role filter tabs, user profile drawer, 2FA status column, registration growth chart), `CereriSupervizareContent.tsx` (overview tab + table tab with SLA + kanban as click-to-move + alerts tab), DB migration for cereri new columns
**Addresses:** Table stakes — user management revamp, cereri supervision with SLA and priority; differentiator — user profile drawer, cereri escalation
**Avoids:** Framer Motion layoutId conflict pitfall (R6) in 4-tab layout (scope layoutId values to page instance)
**Research flag:** Verify cereri table column names against live Supabase schema before writing migration — assumed names (`prioritate`, `note_admin`, `escaladata`) may differ from actual schema

### Phase 6: New Data Pages — Monitorizare, Financiar, Documente, Calendar
**Rationale:** These pages introduce the most new data complexity and external integrations. Monitorizare requires the Better Stack Route Handler. Financiar requires plati table category aggregation and 5 Recharts chart types. Documente requires Supabase Storage folder navigation and signed URL previews. Calendar requires a pre-implementation DB decision (new table vs. Zustand-only). Building these last means the design system, shared components, and React Query patterns are fully validated before the most complex pages begin.
**Delivers:** All 4 new routes with composite `*Content.tsx` components, `/api/admin/monitoring/metrics` Route Handler (mock data first, Better Stack Uptime API swap), `use-monitoring-metrics.ts` polling hook (30s interval), Supabase Storage document list and drag-and-drop upload in Documente, Financiar charts with real plati data, Calendar with cereri SLA deadlines (DB) and new events (Zustand-only for academic milestone)
**Addresses:** Differentiators — monitoring, financial analytics, document management, calendar with event types
**Avoids:** Better Stack API key exposure (R11), Calendar mock data shipping to production (R10)
**Research flag:** Phase 6A (Monitorizare) — Better Stack Telemetry API account tier not confirmed; mock-first is mandatory. Phase 6D (Calendar) — explicit DB migration decision (new table vs. Zustand) must be made before UI work begins, not during.

### Phase Ordering Rationale

- **Foundation before shell:** The Zustand store and CSS tokens are imported by shell components. Building them first eliminates circular import risk and ensures the color system is correct from the first line of every component.
- **Shell before any page:** App Router requires the layout to exist before page components render. The double-sidebar bug (ARCHITECTURE.md Anti-Pattern 2) is catastrophic and must be resolved once in Phase 2 before any page work begins.
- **Dashboard before Settings:** The dashboard is the richest consumer of shared components, validating the design system end-to-end before settings relies on it for CSS variable propagation testing.
- **Existing pages before new pages:** Utilizatori and Cereri have established Server Actions. Their revamp risk is lower. Building them in Phase 5 validates the thin page.tsx + rich Content.tsx pattern before applying it to the more complex new pages.
- **Monitorizare and Calendar last:** Both have unresolved external dependencies (Better Stack account tier, Calendar DB decision). Mock-first is acceptable for the academic milestone; these are the phases where real data integration is the final step.

### Research Flags

Phases needing closer attention during implementation:

- **Phase 6A (Monitorizare):** Better Stack Telemetry API integration is MEDIUM confidence. The Uptime API (monitor list, response times) is HIGH confidence. The Telemetry/Logs query API (SQL-over-HTTP for log data) behavior under the project's current account tier is not confirmed. Mock-first is mandatory; test the real Uptime API in a dev environment before committing to the 30-second polling architecture.
- **Phase 6D (Calendar):** Requires a pre-implementation decision before any code is written: new `calendar_events` table (migration required, blocks page work until merged) vs. Zustand-only state (no migration, acceptable for academic milestone but creates permanent tech debt). This decision cannot be deferred until mid-phase.
- **Phase 5 (cereri DB migration):** The `prioritate`, `note_admin`, and `escaladata` column names are inferred from FEATURES.md requirements. Verify against the actual live Supabase schema before writing the migration — these columns may already exist under different names, or existing columns may need type changes rather than new additions.

Phases with standard, well-documented patterns (skip deeper research):

- **Phase 1:** All shared components are directly portable from the Figma export with known substitutions documented in STACK.md.
- **Phase 2:** Layout shell architecture is fully specified in ARCHITECTURE.md with complete code examples for all 5 patterns.
- **Phase 3:** Dashboard queries are standard Supabase aggregations; RLS context is already set by middleware.
- **Phase 4:** Settings 5-tab UI and accent color system are fully documented in both STACK.md and ARCHITECTURE.md with working code patterns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All existing packages verified against project `package.json`; only new addition (@dnd-kit) has community-confirmed React 19 compatibility; all Figma export patterns translated to Next.js equivalents with working code in STACK.md |
| Features | HIGH | Figma Make export is the authoritative source and was analyzed by direct code inspection of all 8 page components; feature list is exhaustive, not inferred |
| Architecture | HIGH | Based on direct codebase inspection of existing layouts, hooks, Server Actions, and shadcn primitives; nested layout pattern is App Router standard; all integration points confirmed present |
| Pitfalls | HIGH | 12 pitfalls identified from direct inspection of both the Figma export codebase and the existing Next.js codebase; each has a concrete warning sign list and a code-level prevention strategy |

**Overall confidence: HIGH**

### Gaps to Address

- **Better Stack Telemetry API account tier:** The Telemetry API (SQL-over-HTTP for log querying) is confirmed in docs but the project's account tier may not include query access. Validate with a test request before Phase 6A starts. If unavailable, the monitoring page ships with Uptime API data only — still sufficient for the academic milestone.
- **react-day-picker v9 + shadcn Calendar alignment:** The shadcn `calendar.tsx` component in the project was generated against the v9 API, but this file was not directly inspected. Verify that `startMonth`/`endMonth` props (v9) match the installed component before building any date picker UI in Phase 5 (wizard date fields) or Phase 6D (calendar event creation modal).
- **@dnd-kit React 19 peer dependency:** The package specifies `>=16.8.0` (not explicitly React 19). Works in community practice but no official React 19 peer dep declaration exists. If CI peer dep warnings become blockers, mitigation is `--legacy-peer-deps` flag or deferring the kanban view to post-milestone.
- **cereri table actual schema:** The `prioritate`, `note_admin`, and `escaladata` columns assumed in FEATURES.md and Phase 5 are inferred requirements. Inspect the live Supabase schema before writing the Phase 5 migration to avoid duplicate columns or type mismatches.

---

## Sources

### Primary (HIGH confidence)
- **Figma Make export** — `Revamp Primarie Admin/src/app/components/` — direct code analysis of all page and shared components (authoritative design reference for this milestone)
- **Existing codebase** — `src/app/app/[judet]/[localitate]/admin/`, `src/components/`, `src/hooks/`, `src/stores/` — direct inspection confirming existing infrastructure
- **`/Users/thor/Documents/GitHub/primariata.work/package.json`** — confirmed all installed packages and versions
- **Better Stack Uptime API Docs** (`betterstack.com/docs/uptime/api/`) — Monitor list and response-times endpoints confirmed
- **Tailwind CSS v4 Theme Docs** (`tailwindcss.com/docs/theme`) — `@theme inline` + `setProperty()` runtime override pattern confirmed
- **cmdk GitHub releases** — v1.1.1 latest; React 19 explicit support confirmed in v1.0.1 via PR #318

### Secondary (MEDIUM confidence)
- **Better Stack Telemetry API** (`betterstack.com/docs/logs/api/`) — Bearer auth confirmed; SQL-over-HTTP available; account tier for query access not verified
- **@dnd-kit/core npm peer deps** — `>=16.8.0`; React 19 works in community practice; no official React 19 peer dep statement
- **react-dnd GitHub issue #3655** — Open React 19 compatibility issue; confirmed unresolved as of research date (justifies @dnd-kit recommendation)

### Tertiary (LOW confidence — needs implementation validation)
- **cereri table current schema** — Assumed columns (`prioritate`, `note_admin`, `escaladata`) inferred from FEATURES.md requirements; not directly verified against live Supabase schema
- **shadcn calendar.tsx v9 alignment** — Assumed correct for installed react-day-picker@9.11.1; not directly inspected

---

*Research completed: 2026-03-05*
*Ready for roadmap: yes*
