# Stack Research

**Domain:** Admin UI design revamp — v2.0 milestone additions only
**Researched:** 2026-03-05
**Confidence:** HIGH (all library compatibility verified against npm, official docs, Figma export source)

## Context

This is a **targeted milestone research** for the v2.0 admin design revamp. The base stack (Next.js 15.5.9, React 19, TypeScript 5 strict, Tailwind CSS 4, shadcn/ui, Supabase, Zustand 5, React Query 5, Framer Motion 12, Recharts, React Hook Form 7 + Zod 4) is validated and untouched.

**Reference implementation:** `Revamp Primarie Admin/` — Figma Make export with 8 pages, Vite + React 18. All 5 questions below are answered by examining what the Figma export uses and whether those packages are already installed in the Next.js project.

**Already installed in the Next.js project (do NOT re-add):**
- `cmdk@^1.1.1` — command palette
- `react-day-picker@^9.11.1` — calendar (newer than Figma's v8)
- `sonner@^2.0.7` — toast notifications
- `framer-motion@^12.23.24` + `motion@^12.23.24` — animations
- `recharts` — charts (already used in dashboards)

---

## Question 1: CSS Custom Properties for Dynamic Accent Colors

### How the Figma Export Does It

The Figma export (`Revamp Primarie Admin/src/styles/theme.css`) uses Tailwind CSS 4's `@theme inline` block to bridge CSS custom properties and utility classes:

```css
@theme inline {
  --color-accent: var(--accent);
  --color-primary: var(--primary);
  /* ... all tokens bridged via @theme inline */
}

.dark {
  --accent: oklch(0.269 0 0);
  --primary: oklch(0.985 0 0);
}
```

### The Production Pattern for Runtime Accent Customization

Tailwind CSS 4 (already in the project) makes this native — **no new packages required.**

**How it works:**
1. Define `--color-accent-*` tokens in `:root` inside `@theme inline`
2. Override at runtime via `document.documentElement.style.setProperty()`
3. Tailwind utility classes (`bg-accent`, `text-accent`, `border-accent`) immediately reflect the change

**Implementation in a Zustand store (theme engine):**

```typescript
// src/lib/stores/themeStore.ts
interface ThemeStore {
  accentColor: string; // oklch value
  setAccentColor: (oklch: string) => void;
}

const ACCENT_PRESETS = {
  blue: 'oklch(0.6 0.2 250)',
  rose: 'oklch(0.65 0.22 10)',
  emerald: 'oklch(0.7 0.17 160)',
  violet: 'oklch(0.65 0.25 280)',
} as const;

export const useThemeStore = create<ThemeStore>((set) => ({
  accentColor: ACCENT_PRESETS.blue,
  setAccentColor: (oklch: string) => {
    document.documentElement.style.setProperty('--color-accent', oklch);
    // Also update foreground if needed for contrast
    set({ accentColor: oklch });
    localStorage.setItem('accent-color', oklch);
  },
}));
```

**CSS setup (`globals.css` additions):**

```css
@theme inline {
  /* Existing tokens ... */
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
}

/* Sidebar-specific accent variables */
:root {
  --sidebar-active-bg: rgba(59, 130, 246, 0.15);
  --sidebar-active-border: rgba(59, 130, 246, 0.2);
  --sidebar-active-icon: oklch(0.6 0.2 250);
}
```

**Confidence: HIGH** — Verified via official Tailwind CSS v4 theme docs and the `setProperty()` runtime override pattern.

### What the Setări Page Needs

The Aspect tab in Setări (5-tab settings page from Figma) lets users pick accent colors. This is pure CSS custom property manipulation — no library needed. Persist selection to:
1. `localStorage` for immediate reload persistence
2. `user_metadata` via Supabase Auth for cross-device sync

---

## Question 2: Command Palette (cmdk)

### Status: Already Installed

`cmdk@^1.1.1` is in the project's `package.json`. React 19 compatibility confirmed in v1.0.1 via PR #318 (adds React 19 as peer dep). v1.1.x adds no breaking changes.

### What the Figma Export Does (Correctly)

The Figma export's `CommandPalette.tsx` **does NOT use the cmdk package.** It implements a custom keyboard-navigable list using `AnimatePresence` + `motion.div` with `useRef` for focus management. This approach works fine but misses accessibility wins.

**Recommendation: Use cmdk (already installed) instead of the custom implementation.** The cmdk package provides:
- ARIA role management (`role="dialog"`, `aria-label`, `role="option"`)
- Keyboard navigation out of the box
- Built-in filtering via `Command.Input` value prop
- shadcn/ui already ships a `<Command>` component wrapping cmdk

### Integration Pattern

```typescript
// src/components/admin/CommandPaletteDialog.tsx
'use client';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPaletteDialog({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const handleSelect = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Caută comenzi, pagini, acțiuni..." />
      <CommandList>
        <CommandGroup heading="Navigare">
          <CommandItem onSelect={() => handleSelect('/admin')}>
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/admin/monitorizare')}>
            Monitorizare Sistem
          </CommandItem>
          {/* ... */}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Acțiuni">
          <CommandItem onSelect={() => handleSelect('/admin/utilizatori/invite')}>
            Invită Utilizator Nou
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

**Global keyboard shortcut (in admin layout):**

```typescript
// src/app/admin/layout.tsx (Client Component wrapper)
'use client';
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen(prev => !prev);
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);
```

**No additional packages required.** cmdk is already installed.

---

## Question 3: Calendar Component

### Status: react-day-picker@9 Already Installed

The project has `react-day-picker@^9.11.1`. The Figma export uses `react-day-picker@8.10.1` (older). The project's version is newer and has an updated API.

**Important:** react-day-picker v9 has a breaking API change from v8. The shadcn/ui `Calendar` component in the project must align with the installed v9 API.

### What the Figma Calendar Does

The Figma `CalendarPage.tsx` implements a **completely custom calendar grid** — it does not use react-day-picker at all. It manually calculates `daysInMonth`, `firstDayOffset`, and renders a `grid-cols-7` layout with `motion.button` per day cell.

The custom approach has advantages for this design:
- Full control over day cell rendering (dot indicators for events, gradient highlights)
- Framer Motion `whileHover`/`whileTap` per cell
- `layoutId="selectedDay"` for animated selection

### Recommendation: Keep the Custom Calendar Grid + react-day-picker for Date Inputs

**For the Calendar page:** Build the custom grid (as in Figma export) — react-day-picker's rendered output would require heavy CSS overrides to match the dark glassmorphism aesthetic.

**For date picker inputs** (wizard forms, event creation modal): Use react-day-picker v9 via shadcn's `<Calendar>` component wrapped in a `<Popover>`.

**Key react-day-picker v9 differences from v8 (used in Figma):**

| Feature | v8 (Figma export) | v9 (Project installed) |
|---------|-------------------|------------------------|
| Import | `import { DayPicker } from 'react-day-picker'` | Same |
| CSS import | `react-day-picker/dist/style.css` | `react-day-picker/style.css` |
| Month navigation | `fromDate`/`toDate` props | `startMonth`/`endMonth` props |
| Selected styling | CSS `.rdp-day_selected` | CSS `[data-selected]` |

**Custom calendar grid pattern (translated to Next.js):**

```typescript
// src/components/admin/calendar/CalendarGrid.tsx
'use client';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface CalendarEvent {
  id: string;
  date: Date;
  color: string;
  title: string;
}

interface CalendarGridProps {
  month: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function CalendarGrid({ month, events, selectedDate, onSelectDate }: CalendarGridProps) {
  const days = useMemo(() => buildCalendarDays(month), [month]);

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, i) => {
        if (!day) return <div key={`empty-${i}`} />;
        const dayEvents = events.filter(e => isSameDay(e.date, day));
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);

        return (
          <motion.button
            key={day.toISOString()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectDate(day)}
            className={`relative flex flex-col items-center py-2 rounded-xl transition-all ${
              isSelected ? 'ring-1 ring-accent/40' : ''
            }`}
            style={{
              background: isToday
                ? 'linear-gradient(135deg, rgba(var(--color-accent), 0.15), rgba(var(--color-accent), 0.08))'
                : isSelected
                ? 'rgba(255,255,255,0.04)'
                : 'transparent',
              minHeight: 60,
            }}
          >
            <span className={isToday ? 'text-accent' : 'text-foreground'}>
              {day.getDate()}
            </span>
            <div className="flex gap-0.5 mt-1">
              {dayEvents.slice(0, 3).map((e) => (
                <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
              ))}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
```

**Data source for events:** Query the `cereri` table for deadlines (`data_limita`) and a new `calendar_events` table for ședințe. Use React Query with `supabase.from('calendar_events').select('*')`.

**No new packages needed for the Calendar page.** date-fns (already installed as transitive dependency) for date arithmetic.

---

## Question 4: Better Stack API for Real Monitoring Metrics

### What the Figma Monitorizare Page Uses

`MonitorizarePage.tsx` in the Figma export uses entirely mock data arrays (`uptimeData`, `responseTimeData`, `errorRateData`). There is no Better Stack API call anywhere.

### Better Stack API — What's Actually Available

**Uptime API** (confirmed via official docs, HIGH confidence):
- Base URL: `https://uptime.betterstack.com/api/v2/`
- Auth: `Authorization: Bearer $TOKEN`

| Endpoint | Returns |
|----------|---------|
| `GET /monitors` | List of all monitors with current status (`up`/`down`/`paused`) |
| `GET /monitors/{id}/response-times` | Response time breakdown by region (DNS, connection, TLS, data transfer, total) |
| `GET /monitors/{id}/availability` | Uptime percentage summary |

**Telemetry/Logs API** (confirmed via official docs, MEDIUM confidence):
- Base URL: `https://telemetry.betterstack.com/`
- Auth: Bearer token (team-scoped Telemetry API token, different from Uptime token)
- Available: Sources API, Metrics API, Query API (SQL over HTTP), Dashboards API

**Limitation:** The Telemetry Query API uses SQL-over-HTTP and is better suited to ad-hoc log querying, not a real-time dashboard widget. For the Monitorizare page, the Uptime API is the right integration point.

### Recommended Integration Pattern

**Server Action to fetch monitor data (avoids exposing the API token client-side):**

```typescript
// src/lib/betterstack/monitors.ts
'use server';

interface MonitorStatus {
  id: string;
  name: string;
  status: 'up' | 'down' | 'paused' | 'pending';
  url: string;
  uptimePercentage?: number;
}

export async function getMonitorStatuses(): Promise<MonitorStatus[]> {
  const token = process.env.BETTER_STACK_UPTIME_TOKEN;
  if (!token) return [];

  const res = await fetch('https://uptime.betterstack.com/api/v2/monitors', {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!res.ok) return [];
  const { data } = await res.json();
  return data.map((m: unknown) => ({
    id: m.id,
    name: m.attributes.pronounceable_name,
    status: m.attributes.status,
    url: m.attributes.url,
  }));
}

export async function getMonitorResponseTimes(monitorId: string) {
  const token = process.env.BETTER_STACK_UPTIME_TOKEN;
  if (!token) return null;

  const res = await fetch(
    `https://uptime.betterstack.com/api/v2/monitors/${monitorId}/response-times`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 }, // Cache for 5 minutes
    }
  );

  if (!res.ok) return null;
  const { data } = await res.json();
  return data.attributes.regions;
}
```

**React Query hook for the Monitorizare page:**

```typescript
// src/hooks/useMonitoringData.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { getMonitorStatuses } from '@/lib/betterstack/monitors';

export function useMonitoringData() {
  return useQuery({
    queryKey: ['monitoring', 'monitors'],
    queryFn: () => getMonitorStatuses(),
    refetchInterval: 60_000, // Poll every 60 seconds
    staleTime: 30_000,
  });
}
```

**Environment variables needed:**

```bash
BETTER_STACK_UPTIME_TOKEN=<uptime-api-token>   # From Better Stack Uptime dashboard
# BETTER_STACK_SOURCE_TOKEN already set for logging (different token)
```

**Graceful degradation:** When the API token is absent (local dev), fall through to mock data. The Monitorizare page should render mock data that matches the Figma design in development, and switch to live data in production.

**No new npm packages required.** Uses native `fetch` with Next.js cache directives.

---

## Question 5: Framer Motion Patterns for Micro-Animations

### Already Installed (no changes)

Both `framer-motion@^12.23.24` and `motion@^12.23.24` are installed. The Figma export imports from `motion/react` — this is the same package (Motion's React package, exported under the `motion` npm name). In the Next.js project, import from `framer-motion` (same underlying code, just different package name resolution).

**Import alias:** The Figma export uses `import { motion, AnimatePresence } from 'motion/react'`. In the Next.js project, use `import { motion, AnimatePresence } from 'framer-motion'` — they resolve to the same code.

### Specific Patterns Used in the Figma Export

**1. Sidebar active indicator with shared layout animation:**

```typescript
// Framer Motion layoutId — shared element transition between nav items
{isActive && (
  <motion.div
    layoutId="activeNav"
    className="absolute inset-0 rounded-xl"
    style={{ background: 'rgba(var(--color-accent), 0.12)', border: '1px solid rgba(var(--color-accent), 0.15)' }}
    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
  />
)}
```

This is the key micro-animation in the sidebar — the background pill slides between nav items. `layoutId="activeNav"` is the only change needed.

**2. Page entry animations (staggered children):**

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Usage:
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {statsCards.map(card => (
    <motion.div key={card.id} variants={itemVariants}>
      <StatsCard {...card} />
    </motion.div>
  ))}
</motion.div>
```

**3. Notification drawer (slide from right):**

The Figma uses spring physics — this is the exact pattern to replicate:

```typescript
<motion.div
  initial={{ x: 400, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: 400, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  className="fixed right-0 top-0 h-screen w-full max-w-md z-[95]"
>
```

**4. AnimatedCounter (no Framer Motion dependency):**

The Figma export's `AnimatedCounter.tsx` is a pure `requestAnimationFrame` loop — no Framer Motion. This is intentional: Framer Motion's spring isn't needed for number counting. The RAF + easeOutExpo approach is more performant and self-contained. Translate directly.

**5. ProgressRing (SVG + Framer Motion strokeDashoffset):**

The Figma's `ProgressRing.tsx` animates `strokeDashoffset` on an SVG `<circle>` using `motion.circle`. This is supported in Framer Motion 12. The pattern translates directly.

**6. DonutChart hover state (segment expansion):**

The Figma animates SVG `strokeWidth` on hover using `motion.circle` with `whileHover`. The `drop-shadow` filter is applied via inline `style`. This also translates directly.

**7. Notification list items (layout animation with exit):**

```typescript
<AnimatePresence mode="popLayout">
  {notifications.map(notif => (
    <motion.div
      key={notif.id}
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40, height: 0 }}
    >
```

`mode="popLayout"` prevents layout shift when items are removed. This is a Framer Motion 12 feature — confirmed available.

**8. whileInView for dashboard entry:**

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.4 }}
>
```

Use `viewport={{ once: true }}` so cards animate in once on page load, not every scroll past.

---

## Question 6: Drag-and-Drop for Kanban View

### Status: NOT Currently Installed

The Figma export uses `react-dnd@16.0.1` + `react-dnd-html5-backend@16.0.1`. These packages are in the Figma's `package.json` but **NOT in the Next.js project**.

### React-dnd vs @dnd-kit/core

| Criterion | react-dnd@16 | @dnd-kit/core@6.3.1 |
|-----------|-------------|---------------------|
| React 19 peer dep | Specifies `>=16.8.0` — technically compatible via semver but has open React 19 issues (#3655) | Specifies `>=16.8.0` — same semver range, works with React 19 in practice |
| Maintenance | Low — last meaningful update 2023, open React 19 issue unresolved | Active — v6.3.x released 2025 |
| SSR / Next.js | Requires `HTML5Backend` which uses browser APIs — needs `'use client'` | Designed for SSR environments, lazy initialization |
| Bundle size | react-dnd + html5-backend ≈ 45KB | @dnd-kit/core ≈ 20KB |
| Accessibility | Basic | Built-in keyboard navigation and screen reader support |
| Next.js App Router | Works with `'use client'` boundary | Works with `'use client'` boundary |

**Recommendation: Use @dnd-kit/core + @dnd-kit/sortable** instead of react-dnd.

Rationale: react-dnd's GitHub shows an open React 19 issue with no activity. @dnd-kit is actively maintained, lighter, and has better accessibility. The kanban board is entirely client-side (cereri status columns), so the SSR benefits are secondary, but smaller bundle size matters for admin pages loaded by staff who may be on constrained networks.

### Installation

```bash
pnpm add @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2
```

### Kanban Integration Pattern

```typescript
// src/components/admin/cereri/KanbanBoard.tsx
'use client';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const STATUS_COLUMNS = ['depusa', 'in_verificare', 'in_procesare', 'in_aprobare', 'finalizata'] as const;

export function KanbanBoard({ cereri }: { cereri: Cerere[] }) {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Call Server Action to update status
    await updateCerereStatus(active.id as string, over.id as CerereStatus);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-5 gap-4">
        {STATUS_COLUMNS.map(status => {
          const columnCereri = cereri.filter(c => c.status === status);
          return (
            <SortableContext
              key={status}
              items={columnCereri.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn status={status} cereri={columnCereri} />
            </SortableContext>
          );
        })}
      </div>
    </DndContext>
  );
}
```

**Confidence: MEDIUM** — @dnd-kit peer deps say `>=16.8.0`, React 19 works in practice (confirmed by community usage), but the official peer dep hasn't been updated to explicitly state React 19.

---

## New Packages to Install

```bash
# Drag-and-drop (kanban view in Cereri Supervizare)
pnpm add @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2
```

**Everything else in the v2.0 revamp is already installed.**

---

## Already Installed — No Changes Needed

| Feature | Library | Installed Version | Notes |
|---------|---------|-------------------|-------|
| Command palette | `cmdk` | `^1.1.1` | React 19 compatible |
| Calendar date picker | `react-day-picker` | `^9.11.1` | v9 API differs from v8 used in Figma — check shadcn Calendar component |
| Notification toasts | `sonner` | `^2.0.7` | Use for action confirmations |
| Micro-animations | `framer-motion` | `^12.23.24` | All patterns from Figma export work |
| Charts | `recharts` | Already in project | DonutChart, AreaChart, LineChart, BarChart all available |
| Dynamic theming | Tailwind CSS 4 | Already in project | CSS custom property override via `setProperty()` — no library needed |
| Better Stack logging | `@logtail/next` | Already in project | Uptime API uses native `fetch`, no new SDK needed |
| Notification drawer | `framer-motion` | Already in project | Spring slide animation pattern documented above |
| Sidebar collapsible | `framer-motion` | Already in project | `animate={{ width: collapsed ? 72 : 260 }}` pattern |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-dnd` + `react-dnd-html5-backend` | Low maintenance, open React 19 compatibility issues, heavier | `@dnd-kit/core` + `@dnd-kit/sortable` |
| `full-calendar` or `react-big-calendar` | Heavy (FullCalendar is 500KB+), requires extensive CSS overrides to match dark theme | Custom calendar grid (as in Figma) + react-day-picker for inputs |
| `@mui/material` + `@emotion/react` | The Figma export includes MUI as a Figma Make artifact — it's not used in any component and conflicts with Tailwind CSS philosophy; MUI v7 + Emotion ≈ 200KB+ | shadcn/ui + Tailwind CSS (already in project) |
| `canvas-confetti` | Figma export includes it as a decoration artifact — no functional use in a government admin panel | Do not add |
| `react-slick` | Deprecated in practice, requires jQuery-style class manipulation | `embla-carousel-react` if carousels needed (already in Figma export's deps, not needed for revamp) |
| Separate color library for OKLCH | Not needed — Tailwind CSS 4 natively outputs OKLCH | CSS custom properties + `setProperty()` |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `cmdk@1.1.1` | React 19, Next.js 15 | Explicitly added React 19 peer dep in v1.0.1 |
| `react-day-picker@9.11.1` | React 19 | v9 supports React 18/19; shadcn Calendar component must use v9 API |
| `@dnd-kit/core@6.3.1` | React 19 (semver: `>=16.8.0`) | Works in practice; community-confirmed React 19 usage |
| `framer-motion@12.23.24` | React 19, Next.js 15 App Router | Both `framer-motion` and `motion` packages are the same release |
| `sonner@2.0.7` | React 19 | Toaster component works as Server Component wrapper |
| Tailwind CSS 4 `@theme inline` | CSS custom property runtime override | `setProperty()` works immediately, no rebuild needed |

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Custom calendar grid + react-day-picker for inputs | react-big-calendar | If you need week/agenda views built-in. For this project, the Figma only shows a month grid — custom is simpler. |
| @dnd-kit/core | react-dnd | Only if an existing component library forces react-dnd dependency. For new code, always prefer @dnd-kit. |
| CSS `setProperty()` for accent colors | CSS-in-JS (Emotion, styled-components) | Only if you need dynamic CSS generation at runtime. Pure CSS custom props are faster and Tailwind-native. |
| Native `fetch` for Better Stack API | `@betterstack/node-logtail` SDK | The SDK is for log shipping, not for querying the API. Native fetch with Next.js `next: { revalidate }` is the correct approach for Server Actions. |
| cmdk via shadcn `<Command>` | Custom keyboard-navigable list (as in Figma) | Only if you need highly custom rendering that cmdk's slot pattern can't support. For this project, cmdk + shadcn Command has all needed flexibility. |

---

## Sources

- Figma Make export `Revamp Primarie Admin/package.json` — confirmed library versions used in design reference
- Figma Make export `Revamp Primarie Admin/src/styles/theme.css` — CSS custom properties pattern
- Figma Make export `Revamp Primarie Admin/src/app/components/CommandPalette.tsx` — custom command palette implementation reviewed
- Figma Make export `Revamp Primarie Admin/src/app/components/AnimatedCounter.tsx` — RAF counter implementation
- Figma Make export `Revamp Primarie Admin/src/app/components/ProgressRing.tsx` — SVG + Framer Motion pattern
- Figma Make export `Revamp Primarie Admin/src/app/components/NotificationCenter.tsx` — spring slide drawer pattern
- [Better Stack Uptime API Docs](https://betterstack.com/docs/uptime/api/monitors/) — Monitor list endpoint confirmed (HIGH)
- [Better Stack Monitor Response Times](https://betterstack.com/docs/uptime/api/get-monitors-response-times/) — Response time endpoint URL and structure confirmed (HIGH)
- [Better Stack Telemetry API](https://betterstack.com/docs/logs/api/getting-started/) — Bearer auth confirmed, SQL-over-HTTP available (MEDIUM)
- [Tailwind CSS v4 Theme Docs](https://tailwindcss.com/docs/theme) — `setProperty()` runtime override pattern confirmed (HIGH)
- [cmdk GitHub Releases](https://github.com/pacocoursey/cmdk/releases) — v1.1.1 latest, React 19 support confirmed in v1.0.1 (HIGH)
- [react-dnd React 19 issue #3655](https://github.com/react-dnd/react-dnd/issues/3655) — Open, unresolved (HIGH confidence this is a risk)
- `npm show @dnd-kit/core peerDependencies` — `>=16.8.0`, React 19 semver-compatible (MEDIUM)
- `npm show @dnd-kit/sortable peerDependencies` — depends on `@dnd-kit/core ^6.3.0` (HIGH)
- `/Users/thor/Documents/GitHub/primariata.work/package.json` — confirmed what is already installed (HIGH)

---

*Stack research for: v2.0 admin design revamp — primariaTa.work*
*Researched: 2026-03-05*
