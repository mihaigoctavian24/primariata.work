# Architecture Research

**Domain:** Admin UI Revamp — Next.js 15 App Router + Figma-driven design system
**Researched:** 2026-03-05
**Confidence:** HIGH (based on direct codebase inspection + Figma export reference)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Root Layout (Server)                           │
│  ThemeProvider + BetterStack + Toaster + CookieConsentBanner          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │   /app/[judet]/[localitate]/   (Client Layout — parent shell)   │  │
│  │   [For non-admin routes: DashboardSidebar + DashboardHeader]    │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  /admin/*   (Nested Client Layout — admin v2 shell)      │  │  │
│  │  │                                                           │  │  │
│  │  │  ┌──────────────┐   ┌──────────────────────────────┐    │  │  │
│  │  │  │  AdminSidebar│   │     Main Content Area          │    │  │  │
│  │  │  │  (grouped    │   │                                │    │  │  │
│  │  │  │   sections)  │   │  ┌──────────────────────────┐ │    │  │  │
│  │  │  │              │   │  │       AdminTopBar          │ │    │  │  │
│  │  │  │  [Principal] │   │  │  location + weather +     │ │    │  │  │
│  │  │  │  Dashboard   │   │  │  cmd palette + notif +    │ │    │  │  │
│  │  │  │  Monitorizare│   │  │  theme toggle + user menu │ │    │  │  │
│  │  │  │              │   │  └──────────────────────────┘ │    │  │  │
│  │  │  │  [Administr.]│   │                                │    │  │  │
│  │  │  │  Utilizatori │   │  ┌──────────────────────────┐ │    │  │  │
│  │  │  │  Cereri      │   │  │       Page Content        │ │    │  │  │
│  │  │  │              │   │  │  (Server or Client        │ │    │  │  │
│  │  │  │  [Gestiune]  │   │  │   Component)              │ │    │  │  │
│  │  │  │  Documente   │   │  └──────────────────────────┘ │    │  │  │
│  │  │  │  Financiar   │   └──────────────────────────────────┘   │  │  │
│  │  │  │  Calendar    │                                            │  │  │
│  │  │  │              │  ┌──────────────────────────────────────┐ │  │  │
│  │  │  │  [Sistem]    │  │  CommandPalette (Portal/Dialog)      │ │  │  │
│  │  │  │  Setari      │  │  NotificationDrawer (Sheet, right)   │ │  │  │
│  │  │  └──────────────┘  └──────────────────────────────────────┘ │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐ │
│  │  Zustand: admin-ui.ts   │  │  React Query Cache                  │ │
│  │  - sidebarCollapsed     │  │  - admin dashboard stats            │ │
│  │  - cmdOpen              │  │  - monitoring metrics (poll 30s)    │ │
│  │  - notifOpen            │  │  - calendar events                  │ │
│  └─────────────────────────┘  └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| `AdminSidebar` | Role-adaptive nav with grouped sections, collapsible, cmd palette trigger | Client Component — replaces DashboardSidebar for admin role |
| `AdminTopBar` | Location badge, weather, cmd palette button, notification bell, theme toggle, user avatar | Client Component — replaces DashboardHeader for admin role |
| `CommandPalette` | Full-text search + navigation + quick actions, keyboard-driven (⌘K) | Client Component using shadcn `Command` + backdrop overlay |
| `NotificationDrawer` | Slide-in Sheet from right, filter all/unread, mark-read, dismiss | Client Component using shadcn `Sheet` |
| `StatsCard` | Animated metric card with trend indicator (up/down/flat) | Client Component (requires AnimatedCounter) |
| `DonutChart` | SVG donut chart with animated segments + hover interaction | Client Component (pure SVG + Framer Motion, no recharts) |
| `ProgressRing` | Small SVG ring showing percentage with animated stroke draw | Client Component |
| `AnimatedCounter` | requestAnimationFrame count-up with easeOutExpo curve | Client Component (pure, no deps beyond React) |
| `LiveActivityFeed` | Supabase Realtime subscription → animated list with AnimatePresence | Client Component (wires to existing hooks) |
| `AccentColorEngine` | CSS custom property `--accent-admin` persisted to localStorage + user metadata | Utility function in `lib/accent-color.ts` (no UI) |

---

## Recommended Project Structure

The revamp does NOT restructure the existing app. It adds a new nested layout and new component subtrees that slot into the existing routing path.

```
src/
├── app/
│   └── app/[judet]/[localitate]/
│       ├── layout.tsx                    # MODIFIED: suppress sidebar/header when path is /admin/*
│       └── admin/
│           ├── layout.tsx                # NEW: admin v2 shell (AdminSidebar + AdminTopBar + portals)
│           ├── page.tsx                  # MODIFIED: renders AdminDashboardContent
│           ├── monitorizare/             # NEW route
│           │   └── page.tsx
│           ├── utilizatori/              # EXISTING route — enhanced
│           │   └── page.tsx
│           ├── cereri/                   # EXISTING route — enhanced (4 tabs)
│           │   └── page.tsx
│           ├── documente/                # NEW route
│           │   └── page.tsx
│           ├── financiar/                # NEW route
│           │   └── page.tsx
│           ├── calendar/                 # NEW route
│           │   └── page.tsx
│           ├── setari/                   # NEW route (5-tab settings with accent color)
│           │   └── page.tsx
│           ├── registrations/            # EXISTING route (unchanged)
│           └── settings/                 # EXISTING route (keep, eventually redirect to setari/)
│
├── components/
│   ├── ui/                               # UNCHANGED (shadcn primitives already present)
│   │   ├── command.tsx                   # Reused by CommandPalette
│   │   └── sheet.tsx                     # Reused by NotificationDrawer
│   │
│   ├── admin-v2/                         # NEW: all v2 admin components
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx          # Sectioned nav, collapsible, ⌘K button
│   │   │   └── AdminTopBar.tsx           # Location, weather, cmd, notif, theme, user
│   │   ├── shell/
│   │   │   ├── CommandPalette.tsx        # ⌘K overlay
│   │   │   └── NotificationDrawer.tsx    # Slide-in notification panel
│   │   ├── shared/                       # Reusable across all future role revamps
│   │   │   ├── StatsCard.tsx
│   │   │   ├── DonutChart.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── AnimatedCounter.tsx
│   │   │   └── LiveActivityFeed.tsx
│   │   └── pages/                        # Page-specific composite components
│   │       ├── AdminDashboardContent.tsx
│   │       ├── MonitorizareContent.tsx
│   │       ├── UtilizatoriContent.tsx
│   │       ├── CereriSupervizareContent.tsx
│   │       ├── DocumenteContent.tsx
│   │       ├── FinanciarContent.tsx
│   │       ├── CalendarContent.tsx
│   │       └── SetariContent.tsx
│   │
│   └── dashboard/                        # EXISTING — unchanged (other roles still use these)
│       ├── DashboardSidebar.tsx
│       └── DashboardHeader.tsx
│
├── hooks/
│   ├── use-admin-stats.ts                # NEW: React Query wrapping admin Server Actions
│   ├── use-monitoring-metrics.ts         # NEW: polling hook (refetchInterval: 30s)
│   └── use-admin-calendar.ts             # NEW: cereri SLA deadlines + admin_events
│
├── stores/
│   └── admin-ui.ts                       # NEW: Zustand store (sidebar, cmd, notif state)
│
├── lib/
│   └── accent-color.ts                   # NEW: CSS var set/get + localStorage + metadata persist
│
└── app/
    └── api/
        └── admin/
            └── monitoring/
                └── metrics/
                    └── route.ts          # NEW: Route Handler calling Better Stack API
```

**Structure rationale:**
- `components/admin-v2/` is isolated so existing `components/dashboard/` and `components/admin/` continue working for other roles during this milestone — zero risk of breaking cetățean, funcționar, or primar views.
- `components/admin-v2/shared/` is explicitly named "shared" because StatsCard, DonutChart, etc. will be promoted to `components/shared/` when future role revamps begin. At that point it is a rename + re-export only — no logic changes.
- Pages stay thin: `page.tsx` imports and renders the matching `*Content.tsx` component. This enables Suspense streaming and keeps page files under 30 lines.
- Zustand store in `stores/admin-ui.ts` (not inside component files) so the cmd palette open state is accessible from both the sidebar button, the topbar button, and the keyboard shortcut listener in the layout — without prop drilling.

---

## Architectural Patterns

### Pattern 1: Nested Layout for Shell Override

**What:** App Router supports nested layouts. A new `admin/layout.tsx` nested inside `[localitate]/layout.tsx` renders the admin v2 shell. The parent layout must not render its own sidebar/header when inside admin routes, or two sidebars appear simultaneously.

**When to use:** Whenever a route group needs a completely different UI shell from its parent. This is the correct App Router pattern.

**Trade-offs:** The parent layout `[localitate]/layout.tsx` is already a Client Component that reads user role. Adding a `usePathname()` check is minimal. Alternatively, refactor the parent to a Server Component — but that is a larger change with regression risk. The `usePathname()` check is pragmatic and safe.

**Recommended implementation:**

```typescript
// src/app/app/[judet]/[localitate]/layout.tsx — MODIFIED
// Add these lines to suppress the old shell for admin routes:

const pathname = usePathname();
const isAdminV2Route = pathname.includes('/admin');

// In JSX: conditionally skip DashboardSidebar + DashboardHeader
if (isAdminV2Route) {
  return <QueryProvider>{children}</QueryProvider>;
}
// Otherwise: existing DashboardSidebar + DashboardHeader layout

// src/app/app/[judet]/[localitate]/admin/layout.tsx — NEW
'use client';
export default function AdminV2Layout({ children, params }) {
  const { judet, localitate } = use(params);
  const { sidebarCollapsed, cmdOpen, notifOpen } = useAdminUiStore();

  // Register ⌘K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useAdminUiStore.getState().openCmd();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Apply accent color on mount
  useEffect(() => {
    applyAccentColor(loadAccentColor());
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar collapsed={sidebarCollapsed} judet={judet} localitate={localitate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar judet={judet} localitate={localitate} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {cmdOpen && <CommandPalette />}
      <NotificationDrawer open={notifOpen} />
    </div>
  );
}
```

### Pattern 2: Grouped Nav Sections in AdminSidebar

**What:** The Figma reference groups nav items into labelled sections (Principal / Administrare / Gestiune / Sistem). Each section has a title shown when expanded. Items carry optional badge counts.

**When to use:** Always for admin role. Section structure is static (defined in the component). Badges are data-driven from React Query.

**Trade-offs:** Static section array avoids a DB round-trip for navigation config. Badges are the only dynamic part. Badge counts come from the same React Query cache used by dashboard stats — no extra fetch.

```typescript
// Navigation sections — defined in AdminSidebar.tsx

const navSections = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', segment: 'admin' },
      { icon: Activity, label: 'Monitorizare', segment: 'admin/monitorizare' },
    ],
  },
  {
    title: 'Administrare',
    items: [
      { icon: Users, label: 'Utilizatori', segment: 'admin/utilizatori', badgeKey: 'pendingRegistrations' },
      { icon: FileText, label: 'Supervizare Cereri', segment: 'admin/cereri', badgeKey: 'pendingCereri' },
    ],
  },
  {
    title: 'Gestiune',
    items: [
      { icon: FolderOpen, label: 'Documente', segment: 'admin/documente' },
      { icon: CreditCard, label: 'Financiar', segment: 'admin/financiar' },
      { icon: CalendarDays, label: 'Calendar', segment: 'admin/calendar' },
    ],
  },
  {
    title: 'Sistem',
    items: [{ icon: Settings, label: 'Setari', segment: 'admin/setari' }],
  },
];
// Full href = `/app/${judet}/${localitate}/${segment}`
```

### Pattern 3: Accent Color via CSS Custom Property

**What:** Admin selects an accent color in Setari → Aspect tab. Color immediately applies across the admin shell by setting `--accent-admin` on `document.documentElement`. All components reference `var(--accent-admin)` instead of hardcoded hex values.

**When to use:** This is the only theming mechanism needed. Tailwind 4 supports arbitrary CSS variables natively without config changes.

**Trade-offs:** CSS custom property changes are synchronous and zero-cost (no re-render). Persistence to Supabase user metadata is a fire-and-forget Server Action (cross-device sync). localStorage provides instant restore on refresh.

```typescript
// src/lib/accent-color.ts
const DEFAULT_ACCENT = '#ec4899';

export function applyAccentColor(hex: string): void {
  document.documentElement.style.setProperty('--accent-admin', hex);
  localStorage.setItem('accent-admin', hex);
}

export function loadAccentColor(): string {
  return localStorage.getItem('accent-admin') ?? DEFAULT_ACCENT;
}

// Async: persist to Supabase (import server action, call after localStorage)
export async function persistAccentColor(hex: string): Promise<void> {
  const { updateAdminAccentColor } = await import('@/actions/admin-settings');
  await updateAdminAccentColor(hex);
}
```

Usage in components:
```typescript
// Tailwind arbitrary value:
<div className="bg-[var(--accent-admin)]" />

// Inline style (when conditional opacity needed):
<div style={{ color: 'var(--accent-admin)', opacity: 0.8 }} />
```

In `globals.css`, define the default so server-rendered HTML does not flash:
```css
:root {
  --accent-admin: #ec4899;
}
```

### Pattern 4: Data Fetching for Monitoring and Calendar Pages

**What:** Monitoring and Calendar require different data freshness strategies. Neither fits the Server Component pattern cleanly because both need periodic updates or user interactions.

**Monitoring** — polls Better Stack API every 30 seconds. Better Stack credentials are server-side only, so data must route through a Next.js Route Handler. The page uses static mock data first; the Route Handler is the swap point.

**Calendar** — data is a union of cereri SLA deadlines (from `cereri` table) and manual admin events (new `admin_events` table or user metadata JSON). Loaded once on mount, no polling.

**When to use:** Always prefer React Query for client-side data that needs caching, deduplication, or polling. Prefer Server Actions for one-time fetches that can be server-rendered.

```typescript
// src/hooks/use-monitoring-metrics.ts
export function useMonitoringMetrics() {
  return useQuery({
    queryKey: ['admin', 'monitoring', 'metrics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/monitoring/metrics');
      if (!res.ok) throw new Error('Monitoring fetch failed');
      return res.json() as Promise<MonitoringMetrics>;
    },
    refetchInterval: 30_000,   // 30s live polling
    staleTime: 15_000,
    retry: 2,
  });
}

// src/app/api/admin/monitoring/metrics/route.ts
export async function GET() {
  // Phase 1: return mock data matching MonitoringMetrics shape
  // Phase 2: call Better Stack Telemetry API with server-side credentials
  return Response.json(getMockMetrics());
}

// src/hooks/use-admin-calendar.ts
export function useAdminCalendar(judet: string, localitate: string) {
  return useQuery({
    queryKey: ['admin', 'calendar', judet, localitate],
    queryFn: () => getAdminCalendarEvents(), // Server Action
    staleTime: 60_000,
  });
}
```

### Pattern 5: CommandPalette with Zustand + Global Keyboard Shortcut

**What:** ⌘K shortcut is registered once in the admin layout. Both AdminSidebar (has a ⌘K button when expanded) and AdminTopBar (has a ⌘K button) trigger the same Zustand action. The CommandPalette component reads `cmdOpen` from the store.

**When to use:** Any globally-triggered overlay. This pattern avoids duplicated event listener registrations.

**Trade-offs:** Zustand `getState()` (not hook) is used inside the event listener to avoid stale closure — this is the correct Zustand pattern for non-React contexts.

```typescript
// Registration in admin/layout.tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      useAdminUiStore.getState().openCmd(); // getState() avoids stale closure
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);

// CommandPalette.tsx reads from store:
export function CommandPalette() {
  const { cmdOpen, closeCmd } = useAdminUiStore();
  if (!cmdOpen) return null;
  return (
    <div className="fixed inset-0 z-[--z-modal] flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCmd} />
      <Command className="relative z-10 w-[600px] ...">
        {/* shadcn Command component */}
      </Command>
    </div>
  );
}
```

---

## Data Flow

### Admin Dashboard Request Flow

```
[Navigate to /app/cluj/cluj-napoca/admin]
    ↓
AdminV2Layout (Client) — loads accent color, registers ⌘K handler
    ↓
admin/page.tsx (Server Component) — triggers data prefetch
    ↓
AdminDashboardContent (Client Component, receives initial props)
    ↓  parallel via React Query
  ├── use-admin-stats: getAdminDashboardStats() → Supabase (cereri counts, user counts, revenue)
  ├── getPendingRegistrations() → Supabase user_primarii WHERE status='pending'
  └── LiveActivityFeed: useNotificationsRealtime() → Supabase Realtime channel
    ↓
StatsCard x4 — Framer Motion enter animation (stagger delay)
DonutChart — cereri status breakdown, animated segments
LiveActivityFeed — new events appear with AnimatePresence (slide in from left)
FuncționariTable — cereri resolved counts per funcționar
ProgressRing x3 — SLA compliance, approval rate, satisfaction
```

### Accent Color Flow

```
[User opens Setari → Aspect tab]
    ↓
AccentColorPicker (color swatches + custom hex input)
    ↓ onChange
applyAccentColor(hex) → document.documentElement CSS var (synchronous, instant)
                      → localStorage.setItem (synchronous)
    ↓ async, fire-and-forget
persistAccentColor(hex) → Server Action → supabase.auth.updateUser({ data: { accent_color: hex } })
```

### Notification Drawer Flow (replaces existing dropdown)

```
[Bell icon click in AdminTopBar]
    ↓
useAdminUiStore().openNotif()
    ↓
NotificationDrawer (Sheet) slides in from right with Framer Motion
    ↓ existing hooks — no changes needed
useNotificationsList() → Supabase query (cross-primarie notifications)
useNotificationsRealtime() → Supabase Realtime subscription (already live)
    ↓
Renders NotificationCard items inside Sheet > ScrollArea
Mark-read and dismiss call existing Server Actions
```

### Monitoring Page Flow

```
[Navigate to /admin/monitorizare]
    ↓
MonitorizarePage (Server Component) — minimal, just renders MonitorizareContent
    ↓
MonitorizareContent (Client Component)
    ↓
useMonitoringMetrics() → GET /api/admin/monitoring/metrics (every 30s)
    ↓ Phase 1: mock data | Phase 2: Better Stack Telemetry API
recharts AreaChart, LineChart, BarChart render metrics
ServiceStatusGrid shows per-service health (Supabase, Vercel, Cloudflare, SendGrid)
EventLog shows last 50 log entries (mock initially)
```

---

## New vs Modified — Explicit Breakdown

### New Files (create from scratch)

| File | Purpose |
|------|---------|
| `src/app/app/[judet]/[localitate]/admin/layout.tsx` | Admin v2 shell (sidebar + topbar + portals) |
| `src/app/app/[judet]/[localitate]/admin/monitorizare/page.tsx` | System monitoring route |
| `src/app/app/[judet]/[localitate]/admin/documente/page.tsx` | Document management route |
| `src/app/app/[judet]/[localitate]/admin/financiar/page.tsx` | Financial analytics route |
| `src/app/app/[judet]/[localitate]/admin/calendar/page.tsx` | Calendar route |
| `src/app/app/[judet]/[localitate]/admin/setari/page.tsx` | 5-tab settings route (with accent color) |
| `src/app/api/admin/monitoring/metrics/route.ts` | Route Handler for monitoring data |
| `src/components/admin-v2/layout/AdminSidebar.tsx` | New sidebar (grouped sections, ⌘K button) |
| `src/components/admin-v2/layout/AdminTopBar.tsx` | New header (location, weather, cmd, notif) |
| `src/components/admin-v2/shell/CommandPalette.tsx` | ⌘K palette using shadcn Command |
| `src/components/admin-v2/shell/NotificationDrawer.tsx` | Slide-in notif panel using shadcn Sheet |
| `src/components/admin-v2/shared/StatsCard.tsx` | Ported from Figma reference |
| `src/components/admin-v2/shared/DonutChart.tsx` | Ported from Figma reference |
| `src/components/admin-v2/shared/ProgressRing.tsx` | Ported from Figma reference |
| `src/components/admin-v2/shared/AnimatedCounter.tsx` | Ported from Figma reference |
| `src/components/admin-v2/shared/LiveActivityFeed.tsx` | Ported + wired to Supabase Realtime |
| `src/components/admin-v2/pages/AdminDashboardContent.tsx` | Dashboard composite component |
| `src/components/admin-v2/pages/MonitorizareContent.tsx` | Monitoring composite component |
| `src/components/admin-v2/pages/UtilizatoriContent.tsx` | User management composite |
| `src/components/admin-v2/pages/CereriSupervizareContent.tsx` | Cereri 4-tab composite |
| `src/components/admin-v2/pages/DocumenteContent.tsx` | Documents composite |
| `src/components/admin-v2/pages/FinanciarContent.tsx` | Financial analytics composite |
| `src/components/admin-v2/pages/CalendarContent.tsx` | Calendar composite |
| `src/components/admin-v2/pages/SetariContent.tsx` | Settings 5-tab composite |
| `src/stores/admin-ui.ts` | Zustand store (sidebar, cmd, notif) |
| `src/hooks/use-admin-stats.ts` | React Query for admin dashboard data |
| `src/hooks/use-monitoring-metrics.ts` | React Query polling for monitoring |
| `src/hooks/use-admin-calendar.ts` | React Query for calendar events |
| `src/lib/accent-color.ts` | CSS var utility + localStorage + metadata |

### Modified Files (targeted, minimal changes)

| File | Change |
|------|--------|
| `src/app/app/[judet]/[localitate]/layout.tsx` | Add `usePathname()` check — if path includes `/admin`, return `<QueryProvider>{children}</QueryProvider>` only, suppressing old sidebar/header |
| `src/app/globals.css` | Add `--accent-admin: #ec4899;` to `:root`; add any v2 glass-effect tokens |
| `src/app/app/[judet]/[localitate]/admin/page.tsx` | Replace existing content with `<AdminDashboardContent />` |
| `src/app/app/[judet]/[localitate]/admin/utilizatori/page.tsx` | Replace content with `<UtilizatoriContent />` |
| `src/app/app/[judet]/[localitate]/admin/cereri/page.tsx` | Replace content with `<CereriSupervizareContent />` |

### Unchanged Files

- All `src/components/dashboard/` files — other roles still use DashboardSidebar, DashboardHeader
- All `src/components/admin/` files — RegistrationQueue, StaffTable, etc., remain for admin sub-pages
- All hooks: `use-notifications-list`, `use-notifications-realtime`, `use-unread-notifications`, `use-cereri-list`, `use-cereri-notifications` — reused without modification
- All Server Actions in `src/actions/`
- All existing API routes (non-monitoring)
- Supabase schema — no migrations required for v2 layout (Calendar may add `admin_events` table as optional enhancement)
- Middleware — no changes to auth or x-primarie-id header logic

---

## Integration Points

### Existing Hooks Reused by New Components

| Hook | Reused By | Change Needed |
|------|-----------|---------------|
| `use-notifications-list.ts` | `NotificationDrawer` | None |
| `use-notifications-realtime.ts` | `NotificationDrawer` + `LiveActivityFeed` | None |
| `use-unread-notifications.ts` | `AdminTopBar` (bell badge count) | None |
| `use-cereri-notifications.ts` | `LiveActivityFeed` (cereri events) | None |
| `use-cereri-list.ts` | `CereriSupervizareContent` | None — existing filter params work |
| `use-dashboard-stats.ts` | `AdminDashboardContent` (partial) | New `use-admin-stats.ts` extends this with admin-specific queries |

### shadcn/ui Primitives Required by New Components

| Primitive | Already Present | Used By |
|-----------|----------------|---------|
| `command.tsx` | Yes | `CommandPalette` |
| `sheet.tsx` | Yes | `NotificationDrawer` |
| `tabs.tsx` | Yes | `CereriSupervizareContent`, `SetariContent` |
| `calendar.tsx` | Yes | `CalendarContent` |
| `dialog.tsx` | Yes | Calendar event creation modal |
| `scroll-area.tsx` | Yes | `NotificationDrawer`, `LiveActivityFeed` |

All required shadcn primitives are already installed. No new `npx shadcn add` commands needed.

### External Service Touchpoints

| Page | External Service | New Integration Required |
|------|-----------------|--------------------------|
| Monitorizare | Better Stack Telemetry API | Yes — new Route Handler, mock first |
| Dashboard (LiveFeed) | Supabase Realtime | No — existing channels reused |
| Setari (Aspect) | Supabase Auth `updateUser()` | No — existing auth client |
| Calendar | Supabase DB | Minimal — new query for cereri SLA deadlines |

---

## Suggested Build Order (Dependency-Aware)

### Step 1 — Foundation (no UI dependencies, build first)

1. `src/stores/admin-ui.ts` — Zustand store (everything else depends on this)
2. `src/lib/accent-color.ts` — CSS var utility
3. `src/components/admin-v2/shared/AnimatedCounter.tsx` — pure, no deps
4. `src/components/admin-v2/shared/ProgressRing.tsx` — pure, no deps
5. `src/components/admin-v2/shared/DonutChart.tsx` — pure, Framer Motion only
6. `src/components/admin-v2/shared/StatsCard.tsx` — depends on AnimatedCounter
7. `globals.css` — add `--accent-admin` token

### Step 2 — Shell Components (depends on Step 1)

8. `AdminSidebar.tsx` — depends on adminUiStore, navSections config
9. `AdminTopBar.tsx` — depends on adminUiStore, use-unread-notifications
10. `CommandPalette.tsx` — depends on adminUiStore, shadcn Command
11. `NotificationDrawer.tsx` — depends on adminUiStore, existing notification hooks, shadcn Sheet
12. `src/app/app/[judet]/[localitate]/admin/layout.tsx` — composes all of the above
13. **Modify** `[localitate]/layout.tsx` — add pathname suppression

**Checkpoint:** Navigate to `/app/[judet]/[localitate]/admin`. New sidebar + topbar should render. ⌘K opens palette. Bell opens drawer. Pages below are empty — that is fine.

### Step 3 — Dashboard Page (highest visibility, proves design system)

14. `src/hooks/use-admin-stats.ts` — React Query wrapping existing Server Actions
15. `src/components/admin-v2/shared/LiveActivityFeed.tsx` — wired to Supabase Realtime hooks
16. `src/components/admin-v2/pages/AdminDashboardContent.tsx` — composes all shared components
17. **Modify** `admin/page.tsx` — render `<AdminDashboardContent />`

**Checkpoint:** Dashboard shows animated stats, donut chart, live feed, progress rings. Accent color switch works from Zustand (hardcode a value to test before Setari page exists).

### Step 4 — Settings Page (enables accent color customization)

18. `src/components/admin-v2/pages/SetariContent.tsx` — 5 tabs including Aspect tab
19. `src/app/app/[judet]/[localitate]/admin/setari/page.tsx`

**Checkpoint:** Accent color picker works end-to-end. Sidebar + topbar + cards all update when color changes. localStorage persists across refresh.

### Step 5 — Enhanced Existing Pages (parallel, no cross-dependencies)

20. `UtilizatoriContent.tsx` + enhanced `admin/utilizatori/page.tsx`
21. `CereriSupervizareContent.tsx` + enhanced `admin/cereri/page.tsx`

### Step 6 — New Data Pages (depends on Steps 1–3)

22. `src/app/api/admin/monitoring/metrics/route.ts` (mock data first)
23. `use-monitoring-metrics.ts`
24. `MonitorizareContent.tsx` + `admin/monitorizare/page.tsx`
25. `FinanciarContent.tsx` + `admin/financiar/page.tsx`
26. `DocumenteContent.tsx` + `admin/documente/page.tsx`
27. `use-admin-calendar.ts`
28. `CalendarContent.tsx` + `admin/calendar/page.tsx`

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current scale (1 admin per primărie) | No adjustments needed. All queries are RLS-scoped. Admin dashboard data is small (hundreds of cereri per primărie). |
| 1,000+ active primării | Admin dashboard stats queries stay fast due to RLS isolation. Monitoring API calls are per-primărie scoped. No change needed. |
| Heavy monitoring polling | Better Stack API has rate limits. Add `cache: 'revalidate=30'` to the Route Handler response. Cache at Vercel edge. |
| Calendar with many events | Current design (cereri deadlines + manual events) stays performant. If events grow to thousands, add pagination to `getAdminCalendarEvents()` — hook interface stays the same. |

---

## Anti-Patterns

### Anti-Pattern 1: Importing react-router in Next.js App

**What people do:** Copy Figma reference code directly. The reference uses `react-router` (`useLocation`, `useNavigate`, `Outlet`).

**Why it's wrong:** Next.js 15 uses its own router. react-router is not installed and must not be added.

**Do this instead:** `useLocation()` → `usePathname()` from `next/navigation`. `useNavigate(path)` → `router.push(path)` from `useRouter()`. `Outlet` → `{children}` in the layout component. The Figma reference is a visual and logic reference, not copy-paste source.

### Anti-Pattern 2: Double Sidebar from Nested Layout Without Parent Suppression

**What people do:** Add `admin/layout.tsx` with AdminSidebar but forget to suppress DashboardSidebar in the parent `[localitate]/layout.tsx`.

**Why it's wrong:** Two sidebars render simultaneously. The parent layout always renders DashboardSidebar.

**Do this instead:** In the parent layout, add `const isAdminV2 = pathname.includes('/admin');` and short-circuit to `<QueryProvider>{children}</QueryProvider>` for admin routes. The nested layout owns the full shell.

### Anti-Pattern 3: Hardcoding Accent Color Hex Values

**What people do:** Port the Figma reference with `#ec4899` hardcoded in inline styles and className strings.

**Why it's wrong:** The accent color customization feature (Setari → Aspect) becomes a grep-and-replace exercise. Every component must be updated manually.

**Do this instead:** From the first component built, use `var(--accent-admin)` everywhere the Figma reference uses the pink hex. Tailwind arbitrary value: `bg-[var(--accent-admin)]`. One CSS variable controls the entire admin color palette.

### Anti-Pattern 4: Fat page.tsx Files

**What people do:** Put all monitoring page content (700+ lines of mock data + charts + filters) directly in `admin/monitorizare/page.tsx`.

**Why it's wrong:** Page files should be thin. Fat pages are hard to test, slow HMR, and cannot be wrapped in Suspense boundaries.

**Do this instead:** `page.tsx` imports and renders `<MonitorizareContent />`. All logic lives in the content component. `page.tsx` handles only `export const metadata` and Suspense wrapping if needed.

### Anti-Pattern 5: Client-Side Auth Check in Layout (Redundant Flash)

**What people do:** The existing survey `admin/layout.tsx` does `useEffect` auth checking and shows "Se verifica autorizarea..." spinner before rendering. This pattern is copied into the new admin layout.

**Why it's wrong:** Middleware already protects all authenticated routes via JWT validation. The client-side check is redundant and causes a visible loading flicker.

**Do this instead:** Remove the auth check from the layout. Trust the middleware. For role validation (admin-only routes), use a Server Component at the page level that calls a Server Action to verify role and calls `redirect('/app/...')` if wrong role.

### Anti-Pattern 6: Storing Sidebar Collapsed State Only in localStorage

**What people do:** Read/write sidebar state directly from localStorage in the sidebar component itself, as the current DashboardSidebar does.

**Why it's wrong:** Multiple components (AdminTopBar toggle button, AdminSidebar toggle button, mobile overlay) need to react to sidebar state. Without a shared store, they duplicate localStorage reads or communicate via props through the layout.

**Do this instead:** Sidebar collapsed state lives in `useAdminUiStore`. The layout reads initial value from localStorage once on mount and writes it to the store. All components subscribe to the store — zero prop drilling.

---

## Sources

- Direct codebase inspection: `src/app/app/[judet]/[localitate]/layout.tsx` — existing Client Component layout, DashboardSidebar/DashboardHeader usage
- Direct codebase inspection: `src/app/admin/layout.tsx` — existing survey admin layout, auth check anti-pattern documented above
- Direct codebase inspection: `src/components/dashboard/DashboardSidebar.tsx` — current sidebar props interface, navigation structure
- Direct codebase inspection: `src/app/globals.css` — existing CSS custom property pattern (`--primary`, `--sidebar-background`, etc.)
- Direct codebase inspection: `src/components/ui/` — confirmed present: `command.tsx`, `sheet.tsx`, `tabs.tsx`, `calendar.tsx`, `dialog.tsx`, `scroll-area.tsx`
- Figma reference: `Revamp Primarie Admin/src/app/components/Sidebar.tsx` — navSections structure, grouped labels, badge support
- Figma reference: `Revamp Primarie Admin/src/app/components/Layout.tsx` — shell orchestration (sidebar, topbar, cmd palette, notif drawer, ⌘K event listener)
- Figma reference: `Revamp Primarie Admin/src/app/components/TopBar.tsx` — topbar elements (location, weather, cmd button, theme, notif, user)
- Figma reference: `Revamp Primarie Admin/src/app/components/CommandPalette.tsx` — command list, categories, keyboard navigation
- Figma reference: `Revamp Primarie Admin/src/app/components/NotificationCenter.tsx` — slide-in panel, Notification interface, filter/mark-read/dismiss
- Figma reference: `Revamp Primarie Admin/src/app/components/StatsCard.tsx`, `DonutChart.tsx`, `ProgressRing.tsx`, `AnimatedCounter.tsx`, `LiveActivityFeed.tsx` — component signatures and animation patterns
- Figma reference: `Revamp Primarie Admin/src/app/components/pages/SetariPage.tsx` — 5-tab structure, accent color state, Toggle component
- Figma reference: `Revamp Primarie Admin/src/app/components/pages/MonitorizarePage.tsx` — mock data shapes for monitoring metrics
- Figma reference: `Revamp Primarie Admin/src/app/components/pages/CalendarPage.tsx` — CalEvent interface, calendar grid structure

---

*Architecture research for: Admin UI Revamp — primariaTa.work v2.0*
*Researched: 2026-03-05*
