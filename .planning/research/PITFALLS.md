# Pitfalls Research

**Domain:** Romanian e-government multi-tenant SaaS (primarie digitization platform)
**Researched:** 2026-03-02 (v1.0 platform) + 2026-03-05 (v2.0 admin design revamp)
**Confidence:** HIGH (based on codebase audit, Supabase official docs, GDPR enforcement data, direct Figma export inspection)

---

## v2.0 Design Revamp — Figma Make Adaptation Pitfalls

*These pitfalls are specific to integrating the `Revamp Primarie Admin/` Figma Make export (Vite + React Router) into the existing Next.js 15 App Router codebase. Based on direct inspection of both codebases on 2026-03-05.*

---

### Pitfall R1: React Router imports surviving into Next.js

**What goes wrong:**
The Figma export (`Revamp Primarie Admin/src/`) uses `react-router` 7.13.0 throughout every component: `useLocation`, `useNavigate`, and `<Outlet />` appear in `Sidebar.tsx`, `Layout.tsx`, and all page components. Copy-pasting these into the Next.js project fails at runtime because no React Router context exists. If a developer installs `react-router` to "fix" the error, both routing systems co-exist and conflict silently.

**Why it happens:**
Developers copy component files wholesale without a systematic substitution pass. The module resolves (react-router is listed in the Figma export's package.json nearby) so the error is not immediately obvious until runtime.

**How to avoid:**
Run a mandatory substitution pass before extracting any component:
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useLocation()` → `usePathname()` + `useSearchParams()` from `next/navigation`
- `<Outlet />` → `{children}` prop from Next.js layout
- `<Link to="…">` → `<Link href="…">` from `next/link`

Never install `react-router` into the Next.js root. Enforce via CI: `pnpm why react-router` must return empty.

**Warning signs:**
- `No router instance found` or `useLocation is not a function` in browser console
- `react-router` in `node_modules` of the Next.js root project
- `<Outlet />` rendering nothing (no-op outside React Router context)

**Phase to address:**
Phase 1 — Layout & Sidebar foundation. Fix routing imports before any page component is extracted.

---

### Pitfall R2: Theme conflict — Figma's hardcoded dark palette vs. next-themes CSS variables

**What goes wrong:**
The Figma export uses hardcoded hex colors on every structural element: `style={{ background: "#09090f" }}`, `style={{ background: "linear-gradient(180deg, #0c0c18 0%, #08080f 100%)" }}`, `style={{ color: "#ec4899" }}`. The existing Next.js project uses `next-themes` with CSS custom properties (`var(--background)`, `var(--foreground)`) defined in `src/app/globals.css`. When Figma components are copied into Next.js, they bypass the theme system entirely — toggling the `dark` class has no effect on them, and existing light-mode pages look broken alongside the always-dark Figma components.

**Why it happens:**
Figma Make exports assume a single fixed dark theme (`#09090f`). Every color is hardcoded inline rather than token-driven. Developers focus on the visual result and don't notice the theme system bypass until they toggle light mode.

**How to avoid:**
Map Figma's hardcoded colors to CSS custom properties before integrating any component. Add admin-specific tokens to `globals.css`:
```css
/* .dark block in globals.css */
--admin-surface: #09090f;
--admin-surface-elevated: #0c0c18;
--admin-border: rgba(255,255,255,0.05);
--admin-accent: #ec4899; /* overridden by accent color picker */
```
Convert every `style={{ background: "#09090f" }}` to `className="bg-[var(--admin-surface)]"`. The `SetariPage` accent color picker must write to `document.documentElement.style.setProperty('--admin-accent', color)` and persist to localStorage + Supabase user preferences — not stay in local state.

**Warning signs:**
- Components look correct in isolation but ignore theme class toggling
- `style=` attribute with hex values appearing hundreds of times in React DevTools
- Toggling dark/light mode changes surrounding UI but not the new admin components

**Phase to address:**
Phase 1 — Design system foundation. Establish CSS variable mapping before extracting any page.

---

### Pitfall R3: Server vs. Client Component boundary violations

**What goes wrong:**
Every component in the Figma export is effectively a Client Component (`useState`, `useEffect`, `useNavigate` throughout). The instinct is to slap `"use client"` on every file and move on. If the new admin `Layout.tsx` becomes a monolithic Client Component, all child pages lose Server Component capabilities — they cannot `await` directly, cannot access server-only secrets, and push all data fetching to the client, reintroducing loading waterfalls the App Router was designed to eliminate.

**Why it happens:**
The Figma `Layout.tsx` holds `collapsed`, `darkMode`, `cmdOpen`, `notifOpen`, `notifications`, and `modalType` state — all interactive. Developers mark the whole file `"use client"` because it has `useState`, forgetting that Next.js layouts can be split into a Server Component shell with isolated Client Component islands.

**How to avoid:**
Split the layout:
1. `AdminLayout` (Server Component) — fetches user role, primarie data; renders static shell
2. `AdminSidebarClient` (Client Component) — collapse state, keyboard navigation
3. `AdminHeaderClient` (Client Component) — command palette open state, theme toggle
4. `AdminNotificationProvider` (Client Component) — Supabase Realtime subscription state

Rule: `"use client"` boundary goes on the smallest component that actually needs browser APIs or `useState`. Data fetching stays in Server Components above.

**Warning signs:**
- `"use client"` at the top of a layout file that also contains `async` functions
- `useEffect` used to fetch data that could be server-fetched (e.g., current user, primarie info)
- `error: You're importing a component that needs 'useState'. It only works in a Client Component` on a page that should be a Server Component

**Phase to address:**
Phase 1 — Layout architecture. Define component boundaries in the design doc before writing code.

---

### Pitfall R4: Admin-only UI leaking to non-admin roles

**What goes wrong:**
The current `src/app/admin/layout.tsx` only checks if a user is authenticated (`supabase.auth.getUser()` → redirect to `/admin/login` if null). It does NOT verify the `admin` or `super_admin` role. Any authenticated user — `cetatean`, `functionar`, `primar` — who navigates directly to `/admin/primariata` currently sees the admin UI. When the new revamp rebuilds this layout, the role check may be omitted or deferred.

**Why it happens:**
The existing layout uses a client-side auth check (not middleware-level), and role validation was deferred in v1.0. The Figma export has no auth logic at all — it hardcodes "Elena Dumitrescu · Admin Primărie" in the sidebar. Developers integrating the visual target overlook re-wiring the security gate.

**How to avoid:**
Move admin role enforcement to middleware where it cannot be bypassed by direct URL:
```typescript
// middleware.ts — inside isAdminRoute block:
if (isAdminRoute && user) {
  const { data: association } = await serviceClient
    .from("user_primarii")
    .select("rol")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .in("rol", ["admin", "super_admin"])
    .single();

  if (!association) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/unauthorized";
    return redirectWithCookies(url, supabaseResponse);
  }
}
```
The layout must also server-fetch the user role and pass it down so role-conditional UI renders server-side, not behind a client-side `if (role === 'admin')` that is visible in source.

**Warning signs:**
- Admin layout only redirects unauthenticated users, not non-admin authenticated users
- Role checked only in Client Components (bypassable via direct URL)
- Sidebar user info shows "Elena Dumitrescu" (hardcoded) instead of authenticated user's real name

**Phase to address:**
Phase 1 — Security gate. Must be in place before any admin UI is accessible, even in development on staging.

---

### Pitfall R5: Notification drawer replacing realtime subscription with mock data

**What goes wrong:**
The Figma export's `NotificationCenter.tsx` uses a hardcoded `initialNotifications` array and a `setTimeout` that adds a fake "Cerere Nouă" after 12 seconds. The existing production system has a Supabase Realtime subscription on the `notificari` table. When the new drawer is integrated, developers wire up the Figma component's mock state and forget to connect the real `useRealtimeNotifications` hook — or remove the existing hook because the new UI "has notifications."

**Why it happens:**
The Figma notification component looks complete: it shows notifications, marks them read, deletes them. Developers see a working UI and ship it without noticing the data source is entirely synthetic. The 12-second `setTimeout` makes it appear "live" during demos.

**How to avoid:**
- New `NotificationCenter` must accept a `notifications` prop sourced from the real Supabase Realtime subscription
- Keep the subscription in a provider-level Client Component, not inline layout state
- Reference pattern: `src/app/app/[judet]/[localitate]/notificari/page.tsx`
- Mark-as-read must call a Server Action updating `notificari.citita = true` in the DB
- Remove the `setTimeout` fake notification entirely — it fires for real users in production

**Warning signs:**
- Notifications disappear on page refresh (state not persisted to DB)
- Mark-as-read only updates local state, not the `notificari.citita` column
- New cereri from other users don't appear without full page reload
- The 12-second `setTimeout` triggers in production

**Phase to address:**
Phase 3 — Header & notification drawer. Connect to Supabase Realtime before the component ships to staging.

---

### Pitfall R6: Framer Motion `layoutId` conflicts across AnimatePresence boundaries

**What goes wrong:**
The Figma export uses `layoutId="activeNav"` in `Sidebar.tsx` for the active nav highlight and `layoutId="settingsTab"` in `SetariPage.tsx`. If the same `layoutId` appears in two simultaneously mounted components, Framer Motion glitches — the shared layout animation jumps between unrelated elements. In Next.js with `AnimatePresence mode="wait"` on route changes, old and new page content overlap briefly, so `layoutId` conflicts occur during transitions.

**Why it happens:**
The Figma export was designed as a Vite SPA where only one page is ever mounted. Next.js `AnimatePresence mode="wait"` keeps the exiting page mounted until the animation completes. During that overlap, duplicate `layoutId` values conflict.

**How to avoid:**
- Prefix `layoutId` with a stable scope: `layoutId={`settingsTab-${pageKey}`}`
- Sidebar `layoutId` for active nav is safe since the sidebar is always mounted (not inside `AnimatePresence`)
- Page-scoped `layoutId` values (settings tab, kanban column) must be scoped to the page instance
- Test with `transition={{ duration: 2 }}` temporarily to expose overlap issues

**Warning signs:**
- Active nav indicator jumps to wrong element during page transitions
- Framer Motion console warning about layout animation target measurement
- Settings tab highlight disappears or animates to wrong position during navigation

**Phase to address:**
Phase 2 — Page transitions and animation system.

---

### Pitfall R7: Sidebar collapse state lost on navigation

**What goes wrong:**
The Figma `Layout.tsx` stores `collapsed` in `useState(false)`. Client-side navigations preserve this state, but full page loads (direct URL, refresh, middleware redirects) reset it to the default. Users who prefer the sidebar collapsed will see it expand on every return to the admin panel, causing a visible layout shift.

**Why it happens:**
It works during development (no full reloads) so the issue isn't noticed until production. Using `localStorage` for persistence causes a different problem: SSR renders expanded, then JS collapses it — visible layout shift (FOUC equivalent).

**How to avoid:**
Persist collapse state in a cookie (readable server-side) to avoid hydration mismatch:
```typescript
// On toggle:
document.cookie = `admin-sidebar-collapsed=${newCollapsed}; path=/; max-age=31536000`;
// In Server Component render:
const collapsed = (await cookies()).get('admin-sidebar-collapsed')?.value === 'true';
// Pass as initialCollapsed prop to client sidebar
```
This renders the correct initial width server-side, preventing layout shift.

**Warning signs:**
- Sidebar visually jumps from expanded to collapsed after hydration
- `localStorage` used for collapse state (not server-readable)
- Sidebar state resets on any hard refresh

**Phase to address:**
Phase 1 — Sidebar component. Fix persistence before the first visual demo.

---

### Pitfall R8: MUI / Emotion packages contaminating the Next.js project

**What goes wrong:**
The Figma `package.json` lists `@mui/icons-material`, `@mui/material`, `@emotion/react`, and `@emotion/styled`. If any are accidentally installed into the Next.js root, they conflict with shadcn/ui's Radix UI base, add runtime CSS-in-JS incompatible with React Server Components, and balloon the bundle (~500KB gzipped for MUI core).

**Why it happens:**
A developer sees `import { CheckCircle } from '@mui/icons-material'` and installs the package to resolve the error instead of substituting with `lucide-react` (already in the project).

**How to avoid:**
Before extracting any component, audit MUI imports in the Figma source:
```bash
grep -r "@mui" "Revamp Primarie Admin/src/" --include="*.tsx"
```
Substitute all MUI icons with lucide-react equivalents. Never install `@mui/*` or `@emotion/*` into the Next.js root. Verify with `pnpm why @mui/material` returning empty in CI.

**Warning signs:**
- `@mui` in `node_modules` of the Next.js root
- Emotion `<style>` tags injected into `<head>` at runtime
- `Can't use server-side rendering with @emotion/react` errors
- Bundle size regression >200KB after adding a component

**Phase to address:**
Phase 1 — Dependency audit. Run the grep before any code extraction begins.

---

### Pitfall R9: Accent color customization doesn't propagate beyond the settings page

**What goes wrong:**
`SetariPage.tsx` has an accent color picker that updates `accentColor` local state. The color change affects nothing else — no other component reads this state. Sidebar active highlights, badge fills, progress rings, and gradient buttons all remain hardcoded pink (`#ec4899`) regardless of the user's selection.

**Why it happens:**
The Figma export is a UI demo. The accent color state was never wired beyond showing a checkmark and a toast. Developers may ship the phase thinking "the color picker works" without testing downstream propagation.

**How to avoid:**
Apply the selected color as a CSS custom property on `:root` and persist it:
```typescript
// On color selection:
document.documentElement.style.setProperty('--admin-accent', selectedColor);
localStorage.setItem('admin-accent-color', selectedColor);
// Also persist to Supabase user preferences table
```
All gradient fills and accent references in Sidebar, StatsCard, badges, and progress rings must reference `var(--admin-accent)` rather than hardcoded `#ec4899`. On page load, read from user preferences (server fetch) or localStorage and apply before first paint.

**Warning signs:**
- Accent color picker shows checkmark but nothing else in the UI changes
- Sidebar active highlight always pink regardless of selected color
- Accent color resets to default on page reload

**Phase to address:**
Phase 6 — Settings page (aspect tab). Validate with an E2E test that asserts CSS variable propagation across multiple components.

---

### Pitfall R10: Calendar page ships with mock data because migration wasn't pre-planned

**What goes wrong:**
`CalendarPage.tsx` renders calendar events (ședințe, deadlines, administrative events) but the existing database schema has no `calendar_events` table. Without a pre-planned migration, the page ships with a hardcoded static array and the migration is deferred indefinitely — creating a permanent mock in production.

**Why it happens:**
The Figma page looks complete with realistic data. Developers build the UI, discover there's no table, add a `// TODO: connect to DB` comment, and ship to meet a deadline.

**How to avoid:**
Define the `calendar_events` table schema before writing any UI code:
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primarie_id UUID REFERENCES primarii(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  event_type TEXT CHECK (event_type IN ('sedinta', 'deadline', 'cerere', 'general')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
-- RLS: admin + primar read/write, functionar read
```
The migration must be written and reviewed before the Calendar phase starts. Static mock data is only acceptable in development seeds, never in production page components.

**Warning signs:**
- `CalendarPage.tsx` imports a static `const events = [...]` array
- No Supabase query in the calendar page component
- "TODO: replace with real data" comment in committed code

**Phase to address:**
Phase 5 — Calendar page. Migration must be the first task, blocking UI work.

---

### Pitfall R11: Monitoring page fetches Better Stack API from Client Component, exposing the API key

**What goes wrong:**
`MonitorizarePage.tsx` shows system health metrics — uptime, response times, error rates. These require the Better Stack API. If fetched in a Client Component (`useEffect` + `fetch`), the Better Stack API key is either bundled client-side (if `NEXT_PUBLIC_` prefixed) or exposed through an unprotected route handler.

**Why it happens:**
The Figma export shows charts with mock data and no fetching logic. Developers adding real data reach for `useEffect` because they are already in a Client Component context (Framer Motion animations). The API key ends up with `NEXT_PUBLIC_` prefix or in a route handler with no auth check.

**How to avoid:**
Data fetching for the monitoring page must be a Server Action or Server Component:
```typescript
// src/app/admin/primariata/monitorizare/page.tsx (Server Component)
async function MonitorizarePage() {
  const metrics = await fetchBetterStackMetrics(); // server-side; key never exposed
  return <MonitorizareClient initialData={metrics} />;
}
```
The key must use `BETTERSTACK_API_KEY` (no `NEXT_PUBLIC_`). Client-side refresh uses React Query with `queryFn` calling a Server Action, not a direct API call.

**Warning signs:**
- `NEXT_PUBLIC_BETTERSTACK_API_KEY` in any `.env` file
- `fetch('https://uptime.betterstack.com/api/v2/...')` in a Client Component
- No authentication check on any `/api/monitoring` route handler

**Phase to address:**
Phase 4 — Monitoring page. API key security must be verified before staging deployment.

---

### Pitfall R12: Command palette keyboard shortcut conflicts with form inputs

**What goes wrong:**
The Figma `Layout.tsx` adds `window.addEventListener('keydown', handleKeyDown)` that opens the command palette on `⌘K` / `Ctrl+K`. This fires even when the user is typing in a form input on the Settings page — triggering the palette mid-word. Multiple components attaching competing `keydown` listeners can also cause double-firing.

**Why it happens:**
The Figma export's `handleKeyDown` is correct for a standalone demo with no forms. In the integrated app with `SetariPage` forms (name, email, phone, CUI, password inputs), the listener fires during typing.

**How to avoid:**
Guard the shortcut against focused inputs:
```typescript
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    const target = e.target as HTMLElement;
    const isInput =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;
    if (isInput) return;
    e.preventDefault();
    setCmdOpen((prev) => !prev);
  }
}, []);
```
Use a single keyboard context provider at the layout level. Consider using the `cmdk` package (already in the Figma export's dependencies and listed in the project's existing shadcn/ui components) which handles keyboard management and focus trapping correctly.

**Warning signs:**
- `⌘K` opens command palette while typing in Settings page inputs
- Command palette opens twice on a single `⌘K` press
- `cmdk` package is in the Figma export's deps but the implementation uses a custom input instead

**Phase to address:**
Phase 3 — Header, command palette, keyboard shortcuts.

---

## Technical Debt Patterns (v2.0 Revamp)

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `"use client"` on entire admin layout | Fast initial integration | All child pages lose SSR; data fetching moves to client; waterfalls reappear | Never — split into islands |
| Hardcoded mock data in page components | Faster visual progress | Mock data ships to production; DB migrations deferred indefinitely | Only in Storybook/dev seeds, never in production page files |
| Copy inline `style={{ background: "#..." }}` from Figma as-is | Zero conversion effort | Theme system bypassed; dark/light toggle broken; accent color picker has no effect | Never — convert to CSS vars in first commit |
| `localStorage` for sidebar collapse | Simple persistence | Hydration mismatch (SSR renders expanded, JS collapses → layout shift) | Never for layout state — use cookies |
| Skip role check in new admin layout | Faster setup | Admin UI accessible to all authenticated users | Never — security requirement |
| Keep `setTimeout` fake notification | "Looks alive" in demos | Fake notifications fire for real users in production | Remove before first staging deployment |
| Use Figma's `motion` package version without checking | Works locally | Figma uses `motion` 12.23.24 (`motion/react` import); project must match to avoid duplicate Framer installations | Verify versions match; don't install both `framer-motion` and `motion` |

---

## Integration Gotchas (v2.0 Revamp)

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Realtime (notifications) | Wire new UI to local state; forget subscription | `useEffect` subscribes to `notificari` channel; mark-as-read calls Server Action updating `notificari.citita` |
| next-themes | New components use `style={{ background: '#000' }}`, ignoring theme class | All colors use CSS custom properties; `ThemeProvider` wraps admin layout at root level |
| Better Stack API | `NEXT_PUBLIC_` prefix on key; client-side fetch | Server Action fetches with `BETTERSTACK_API_KEY`; Client Component receives data as prop |
| Supabase RLS | New admin pages query without primarie context | Every Server Action calls `set_request_context(primarie_id)`; middleware sets `x-primarie-id` header |
| cmdk package | Custom keyboard input built from scratch | Use `cmdk` (in Figma export deps) with Radix Dialog; handles keyboard, focus trap, accessibility |
| Framer Motion package name | Import from `"framer-motion"` (old name) | Figma export uses `"motion/react"` (correct for v12) — don't rename back |
| Supabase Storage (documents page) | Documents page shows mock file list | Server Component fetches `supabase.storage.from('documente').list()` with bucket RLS |
| Sidebar user info | Hardcoded "Elena Dumitrescu / ED" | Server Component fetches `supabase.auth.getUser()` and passes name/avatar to sidebar props |

---

## Performance Traps (v2.0 Revamp)

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| All admin pages are Client Components | Visible loading spinners; CLS; slower TTI | Data-fetching pages are Server Components; only interactive parts are Client islands | Immediately at any load |
| Framer Motion `AnimatePresence` on every component | Janky animations as Exit animations block subsequent renders | Limit to route-level transitions and key overlays (command palette, notification drawer) | At 5+ simultaneous animations |
| `layoutId` animations on every nav item without memoization | Expensive layout measurements on every navigation | Single `layoutId` for the active highlight shape; other items don't need it | On low-end devices |
| `AnimatedCounter` component reruns on every parent render | Numbers animate redundantly | `React.memo`; counter only triggers when value actually changes | Immediately if parent has frequent state updates |
| Recharts (from Figma) not code-split | Large charting library on initial load | Dynamic import for chart pages; verify bundle size before/after | First load if not split |
| Weather widget in header fetching on every render | Excessive WeatherAPI calls | Cache with React Query `staleTime: 15 * 60 * 1000`; weather doesn't change frequently | Immediately without caching |

---

## Security Mistakes (v2.0 Revamp)

| Mistake | Risk | Prevention |
|---------|------|------------|
| Admin role check only in Client Component | Any authenticated user accesses admin UI via direct URL | Role check in middleware via Supabase service role query; layout also server-fetches role |
| Better Stack API key with `NEXT_PUBLIC_` prefix | Key exposed in client bundle | Use `BETTERSTACK_API_KEY` (no `NEXT_PUBLIC_`); only Server Actions/Edge Functions access it |
| RLS context not set in new admin Server Actions | Admin queries return wrong primărie data or leak cross-tenant data | Every Server Action calls `set_request_context()` before any DB query |
| Command palette "Deconectare" navigates without signing out | Session persists server-side; user appears logged out but JWT is still valid | Logout command must call `supabase.auth.signOut()` then `router.push('/admin/login')` |
| Sidebar user info hardcoded ("Elena Dumitrescu") | Obvious demo artifact; destroys trust if shown to real admin | Sidebar user info from `supabase.auth.getUser()` in server render; never hardcoded |

---

## UX Pitfalls (v2.0 Revamp)

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Sidebar collapse state resets on reload | Admin must re-collapse every session | Persist in cookie; server-render correct initial width |
| Notification drawer shows mock data | Admin makes decisions based on fake notifications | Connect Supabase Realtime before any staging demo |
| Accent color picker resets to pink on reload | Personalization feels broken | Persist to Supabase user preferences; apply on server render |
| Page transitions animate even for instant navigations | Perceptible delay on fast navigations | Respect `prefers-reduced-motion`; skip animation if transition < 100ms |
| Command palette shows all commands regardless of role | Funcționar sees admin-only commands they can't execute | Filter command list by user role before rendering |
| Romanian language in UI but error messages in English | Inconsistent language breaks trust | All toast messages, error states, validation messages in Romanian (CLAUDE.md requirement) |

---

## "Looks Done But Isn't" Checklist (v2.0 Revamp)

- [ ] **Sidebar:** Collapse state persists across hard refreshes — verify with a hard refresh after collapsing
- [ ] **Sidebar user info:** Shows logged-in admin's real name and avatar initials, not "Elena Dumitrescu / ED"
- [ ] **Notifications:** Real Supabase Realtime events appear (not the 12-second mock); mark-as-read updates DB `citita` column
- [ ] **Accent color:** Changing color actually changes sidebar active highlight, badges, and progress rings (not just shows a checkmark)
- [ ] **Command palette:** `⌘K` does not fire when typing in Settings page form inputs
- [ ] **Admin role gate:** A `cetatean` user navigating to `/admin/primariata` is redirected — verify with a test cetatean account
- [ ] **Better Stack monitoring:** Monitoring page shows real uptime/latency numbers, not Figma mock chart values
- [ ] **Calendar:** Events loaded from `calendar_events` table, not a static const array
- [ ] **Dark/Light theme:** All new admin components respond to next-themes class toggle (no hardcoded background colors on structural elements)
- [ ] **Log out:** Command palette logout actually calls `supabase.auth.signOut()` — session is terminated server-side
- [ ] **MUI packages absent:** `pnpm why @mui/material` returns empty — no MUI in the Next.js root
- [ ] **react-router absent:** `pnpm why react-router` returns empty in Next.js root

---

## Recovery Strategies (v2.0 Revamp)

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| React Router imports survived into Next.js | LOW | Systematic find-replace: `useNavigate` → `useRouter`, `useLocation` → `usePathname`, `Outlet` → `{children}`. 1-2 hours |
| MUI accidentally installed | LOW | `pnpm remove @mui/material @mui/icons-material @emotion/react @emotion/styled`; replace icon imports with lucide-react |
| All admin pages became Client Components | HIGH | Refactor layout: extract Server Component shell, push state to client islands; retest all pages. 1-2 days |
| Admin UI accessible to non-admin roles | HIGH (security) | Add middleware role check immediately; audit all admin routes; cannot defer |
| Mock notifications shipped to production | MEDIUM | Connect Supabase Realtime subscription; add DB mark-as-read mutation; hotfix deploy |
| Accent color picker doesn't propagate | MEDIUM | Introduce CSS custom property; refactor all hardcoded color refs to `var(--admin-accent)`. 4-8 hours |
| Better Stack API key exposed | HIGH (security) | Rotate key immediately; move to server-only env var; redeploy |

---

## Pitfall-to-Phase Mapping (v2.0 Revamp)

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| React Router imports (R1) | Phase 1 — Layout foundation | `pnpm why react-router` empty; no `useLocation`/`useNavigate` in admin src |
| Theme conflict — hardcoded colors (R2) | Phase 1 — Design system | All admin components pass dark/light toggle test; no `style={{ background: '#...' }}` on structural elements |
| Server/Client boundary violations (R3) | Phase 1 — Architecture | Admin layout Server Component renders without `"use client"`; child pages can use `async`/`await` |
| Admin role leak (R4) | Phase 1 — Security gate | E2E test: cetatean user redirected from `/admin/primariata`; middleware role check confirmed |
| Notification mock data (R5) | Phase 3 — Header & notifications | Real Supabase event triggers notification; mark-as-read updates DB |
| Framer Motion `layoutId` conflicts (R6) | Phase 2 — Animation system | Route transitions between pages with `layoutId` elements show no glitches |
| Sidebar collapse persistence (R7) | Phase 1 — Sidebar | Sidebar state survives hard refresh; no layout shift on load |
| MUI package contamination (R8) | Phase 1 — Dependency audit | Pre-integration grep for `@mui` imports; `pnpm why @mui/material` clean |
| Accent color propagation (R9) | Phase 6 — Settings | E2E: select color → CSS var changes → sidebar highlight updates → reload → color persists |
| Calendar missing migration (R10) | Phase 5 — Calendar | Migration file in repo; page fetches from `calendar_events` table |
| Monitoring API key security (R11) | Phase 4 — Monitoring | `NEXT_PUBLIC_BETTERSTACK_API_KEY` absent from all env files; no client direct API calls |
| Command palette input conflicts (R12) | Phase 3 — Header | `⌘K` in Settings form input does not open palette |

---

---

## v1.0 Platform Pitfalls

*Original platform pitfalls from v1.0 development. Still relevant for ongoing maintenance and v2.0 data integration work.*

---

### Pitfall 1: Multi-Tenant Data Leakage Through RLS Policy Gaps

**What goes wrong:**
A user registered on multiple primarii sees data from Primarie A while viewing Primarie B. Or worse, a cerere/plata from one primarie leaks to another primarie's staff dashboard. This is already flagged as a critical bug in the codebase: RLS policies filter on `judet_id + localitate_id` from user metadata, but metadata reflects the user's *registration location*, not their *currently selected primarie context*.

**Why it happens:**
The multi-primarie model (users can register on multiple primarii) creates a fundamental tension with Supabase RLS. RLS policies use `auth.jwt() -> 'user_metadata'` which is set at registration and stored in the JWT. When a user switches primarie context, the JWT metadata does not change -- only the URL slug and localStorage change. This means RLS may filter against stale/wrong metadata.

**How to avoid:**
1. Audit every RLS policy to confirm it filters against the correct source of truth (app_metadata or a session-level variable, not just user_metadata from registration).
2. Implement a `set_current_primarie(primarie_id)` database function that sets a session-level variable (`SET LOCAL`) on each request, and base RLS policies on that variable.
3. Create integration tests that simulate: User A in Primarie 1 cannot see User B's cereri in Primarie 2. Run these tests against the actual Supabase instance (not mocked).
4. Test the context-switch flow end-to-end: user switches primarie, all subsequent queries return only data for the new primarie.

**Warning signs:**
- Dashboard shows data counts that seem too high (aggregating across primarii)
- E2E tests pass with a single-primarie user but fail with a multi-primarie user
- Staff user sees cereri from a primarie they don't administer
- The `primarie_id` column in query results doesn't match the URL slug

**Phase to address:**
First phase (Security & Data Isolation). This is the single most critical bug. Ship nothing else until data isolation is verified.

---

### Pitfall 2: Unverified Payment Webhooks Enabling Fraud

**What goes wrong:**
An attacker sends a forged POST to `/api/plati/webhook` or `/api/webhooks/ghiseul` with `status: "completed"` and a valid-looking `transaction_id`. The system marks the payment as completed, generates a chitanta, sends confirmation SMS/email -- all without money actually changing hands. The cerere proceeds through the workflow as if paid.

**Why it happens:**
Webhook signature verification is explicitly skipped in the current codebase (comments in `src/app/api/plati/webhook/route.ts` lines 18-19 and `src/app/api/webhooks/ghiseul/route.ts` lines 16, 45 say "Phase 2"). The `verifyWebhookSignature()` method in `ghiseul-client.ts` returns `false`. This is understandable for mock mode but creates a security hole the moment the endpoint is reachable.

**How to avoid:**
1. Implement HMAC-SHA256 verification immediately, even in mock mode (use a test secret). The pattern: read raw request body, compute HMAC, use `crypto.timingSafeEqual()` to compare (never `===`).
2. Add timestamp validation (reject webhooks older than 5 minutes) to prevent replay attacks.
3. Never parse JSON before verifying the signature -- signature is computed over raw bytes.
4. Add IP whitelist validation for the payment gateway (when real Ghiseul credentials arrive).
5. Make webhook verification toggleable via feature flag, not deletable code.

**Warning signs:**
- `verifyWebhookSignature()` returns hardcoded `false`
- No `X-Signature` or `X-Webhook-Signature` header validation in route handler
- Webhook route handler begins with JSON parsing, not signature verification
- Payment success emails/SMS fire without corresponding bank transaction

**Phase to address:**
First phase (Security & Data Isolation). Even if payments remain in mock mode, the verification architecture must be in place. When real credentials arrive, there should be zero security work remaining.

---

### Pitfall 3: GDPR Non-Compliance in a Public Sector Context

**What goes wrong:**
Romania's ANSPDCP has fined organizations EUR 25,000+ for inadequate data protection measures (March 2025 enforcement action). A primarie digitization platform handling citizen PII (name, CNP/personal identification, address, cerere details, payment records) without proper GDPR measures faces regulatory risk. The platform processes data *on behalf of* local government (primarii), making it a data processor -- requiring a Data Processing Agreement (DPA) with each primarie.

**Why it happens:**
Academic projects focus on features, not compliance paperwork. But the moment real citizen data flows through the platform, GDPR applies fully. Romania's Law 190/2018 supplements GDPR at national level, and the EU Web Accessibility Directive (OUG 112/2018) adds public sector requirements. Common gaps: no privacy policy, no cookie consent, no data retention policy, no right-to-deletion implementation, no data breach notification procedure, audit logs that themselves store excessive PII.

**How to avoid:**
1. Implement a clear privacy policy page (Romanian language) explaining what data is collected, why, legal basis (public task under Art. 6(1)(e) GDPR for government services), retention periods, and user rights.
2. Add a cookie consent mechanism (the platform uses localStorage and Supabase cookies).
3. Implement data subject access request (DSAR) functionality: users must be able to export and delete their data.
4. Ensure audit_log entries (275 entries currently) don't store excessive PII -- log actions and IDs, not full personal data.
5. Document the data processing relationship: the platform (processor) acts on behalf of the primarie (controller).
6. Implement data retention policies: auto-delete or anonymize old cereri/plati after the legally required retention period.

**Warning signs:**
- No `/politica-confidentialitate` or `/termeni-si-conditii` route exists
- No cookie consent banner on landing page
- No "delete my account" or "export my data" button in user settings
- Audit log stores full user names/emails instead of user IDs
- No documented data breach notification procedure

**Phase to address:**
Second or third phase (after security fixes). Must be complete before any real citizen data enters the system. A lightweight privacy page can ship early; full DSAR implementation can follow.

---

### Pitfall 4: 488 Console.log Statements Leaking Sensitive Data in Production

**What goes wrong:**
Console.log statements in API routes and server components output user data, Supabase queries, payment details, and error objects to server logs and (for client components) to the browser console. In production on Vercel, server-side console.log goes to Vercel's log drain. Client-side console.log is visible to any user opening DevTools. Sensitive data (emails, payment IDs, cerere details, JWT metadata) gets exposed.

**Why it happens:**
Rapid development uses console.log for debugging. With 488 instances across the codebase, many are in API routes (`src/app/api/cereri/route.ts`, `src/app/api/plati/webhook/route.ts`) and contain error details that could reveal database schema, internal state, or user data. The CI pipeline has `--passWithNoTests` and no lint rule enforcing `no-console`.

**How to avoid:**
1. Add `no-console` ESLint rule set to `warn` for `console.log` and `error` for `console.debug`/`console.info`.
2. Replace all production logging with Better Stack (`@logtail/next`) -- the migration is already planned. Create a `logger` utility with levels (debug, info, warn, error) that only sends to Better Stack in production.
3. Use the Next.js 15 `compiler.removeConsole` option in `next.config.ts` to strip console.log in production builds as a safety net.
4. For the 488 instances: batch-replace with a codemod script, not manual editing. Categorize: (a) remove entirely (debug), (b) replace with logger.error (actual errors), (c) replace with logger.info (operational events like webhook received).

**Warning signs:**
- `pnpm test:ci` passes despite console.log everywhere (because `--passWithNoTests`)
- Browser DevTools shows server response internals
- Vercel function logs contain user PII
- Error messages in production responses contain stack traces or SQL queries

**Phase to address:**
First phase. This is a prerequisite for production deployment. The Better Stack migration and console cleanup should be a single coordinated effort.

---

### Pitfall 5: Stub Admin Dashboards Deployed as "Complete"

**What goes wrong:**
The Functionar, Primar, and Admin dashboards are stubs (TODO comments from M4 in the code). A functionar logs in and sees a placeholder with no ability to process cereri, view assignments, or manage workflows. The platform appears non-functional for 3 of the 5 user roles. Staff users lose trust immediately and revert to paper-based processes.

**Why it happens:**
The cetatean dashboard was built first (the primary user flow), and role-specific dashboards were deferred. But in e-government, staff users (functionari, primari) are the ones who approve/reject cereri, process payments, and generate documents. Without their dashboards, the entire pipeline stalls -- citizens submit cereri that nobody can process.

**How to avoid:**
1. Implement admin dashboards in priority order: Functionar (processes cereri daily) > Primar (approves/signs) > Admin (manages primarie config, staff, types of cereri).
2. Define minimum viable dashboard per role: Functionar needs cereri queue, status transitions, document viewing. Primar needs overview stats + approval queue. Admin needs user management + cerere type configuration.
3. Do not ship to a real primarie until at least the Functionar dashboard can process a cerere from submission to completion.
4. Use the existing CetateanDashboard component patterns (stats, charts, quick actions) as templates for consistency.

**Warning signs:**
- Dashboard components contain `TODO (M4)` comments
- Role-specific pages render generic placeholder text
- No API routes exist for staff-specific operations (cereri assignment, status transitions by staff)
- E2E tests for admin flows don't exist or are skipped

**Phase to address:**
Dedicated phase after security fixes. This is the largest feature gap and requires significant development effort.

---

### Pitfall 6: Database Functions Vulnerable to Search Path Injection

**What goes wrong:**
22 database functions (including `handle_new_user`, `validate_plata_cerere`, `generate_numar_chitanta`, `current_user_role`) lack explicit `SET search_path TO 'public'`. An attacker who can create objects in a non-default schema could shadow public functions, intercepting calls. Functions with `SECURITY DEFINER` execute with the *creator's* privileges (typically superuser), amplifying the impact.

**Why it happens:**
The Supabase Security Advisor flags this (lint code 0011), but developers dismiss it as a low-priority warning. In practice, this is a real PostgreSQL attack vector: if any user can create schemas or temporary tables (and Supabase's default permissions sometimes allow this), they can redirect function calls.

**How to avoid:**
1. Create a single migration that adds `SET search_path TO 'public'` to all 22 affected functions. This is a safe, non-breaking change.
2. Add a CI check (SQL lint) that flags any new function missing `search_path`.
3. Review the `trigger_debug_log` table (RLS disabled) -- delete it from production or move to a restricted schema.
4. Move the hardcoded service role key out of `send_cerere_email_notification()` into Supabase Secrets.

**Warning signs:**
- Supabase Security Advisor dashboard shows 21+ warnings for lint 0011
- Functions use `SECURITY DEFINER` without `search_path`
- `trigger_debug_log` table accessible without authentication
- Service role key visible in function source code

**Phase to address:**
First phase (Security & Data Isolation). Single migration, low risk, high impact.

---

## Technical Debt Patterns (v1.0 Platform)

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `any` type in validation schemas (`src/lib/validations/common.ts`) | Quick DOMPurify integration | Type safety gaps in the most security-critical code path (input validation). XSS bugs harder to catch statically | Never in validation/sanitization code. Fix with proper generic types and `unknown` |
| Hardcoded `0` for pending payment count (`CetateanDashboard.tsx` line 382) | Avoids query implementation | Users think they have no pending payments; missed payment deadlines | Only during initial MVP; must query actual count before production |
| `--passWithNoTests` in CI | CI doesn't fail when test directories are empty | Encourages shipping code with zero test coverage. Current state: 6 test files for entire codebase | Never. Remove flag; add minimum coverage threshold (even 10% is better than 0%) |
| Mock CertSign returning success for all signatures | Unblocks digital signature UI development | When real CertSign is connected, mock behavior masks integration bugs. Certificate validation logic never tested | Only with clear `MOCK_CERTSIGN=true` feature flag and log warnings on every mock call |
| React Query prefetch with placeholder `queryFn` | Avoids implementing server-side data fetching | Components suspend/flash loading states instead of pre-loading. Poor UX on dashboard page load | Never ship placeholder queryFn to production. Either implement or remove prefetch configuration |
| SMS failures silently swallowed | Cerere/payment processing doesn't fail | Users miss critical notifications about their cereri/payments. No retry mechanism, no monitoring of delivery failures | Acceptable only if alternative notification channel (email) is guaranteed to work |

## Integration Gotchas (v1.0 Platform)

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Ghiseul.ro payment webhooks | Parsing JSON body before signature verification; using `===` for signature comparison | Read raw body bytes first, verify HMAC with `crypto.timingSafeEqual()`, then parse JSON. Add timestamp validation (5-minute window) |
| Supabase RLS with multi-primarie users | Assuming `auth.jwt() -> 'user_metadata'` reflects current context | Use a server-side `SET LOCAL` session variable updated on each request, or store active_primarie_id in a session table that RLS policies reference |
| SendGrid via Edge Function | Hardcoding service role key in database function (`send_cerere_email_notification`) | Store in Supabase Secrets (vault); rotate on a schedule. If the function source is exposed, the key is compromised |
| Twilio SMS rate limiting | Trusting client-side rate limit display; not handling Twilio 429 responses | Enforce rate limits server-side via `sms_logs` table (already done), but also handle Twilio's own rate limiting with exponential backoff and queue failed messages for retry |
| CertSign digital signatures | Shipping mock implementation without a clear interface contract | Define the real CertSign API contract (PKCS#7 envelope format, certificate chain validation) as TypeScript interfaces now. Mock must implement the exact same interface. This prevents surprises when real credentials arrive |
| Better Stack / Logtail migration | Removing Sentry before Better Stack is fully configured and verified | Run both in parallel for 1-2 weeks. Verify Better Stack captures the same errors Sentry does. Only then remove `@sentry/nextjs` and its config files |
| DOMPurify client-side loading | Assuming sanitization is ready before form renders (race condition in `src/lib/validations/common.ts`) | Move sanitization to server-side only for security-critical paths. Client-side DOMPurify is a defense-in-depth layer, not the primary guard |

## Performance Traps (v1.0 Platform)

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Survey dashboard loading full dataset into memory | Browser tab uses 500MB+ RAM; page becomes unresponsive | Implement server-side aggregation; paginate response tables; pre-compute analytics | 50,000+ survey responses (currently 0, but architecture matters for when surveys launch) |
| PDF export loading entire dataset before rendering (`src/lib/export/pdf-exporter.ts`) | Export request times out; Vercel function hits 10s limit | Stream PDF generation; use server-side rendering; for large exports, generate async and email download link | 10,000+ rows in a single export |
| 797-line HeroSection component re-rendering | Landing page LCP degrades; excessive JavaScript bundle | Split into sub-components; extract animation logic to separate modules; lazy-load below-fold content | Noticeable at any scale; affects Core Web Vitals |
| Missing indexes on RLS policy columns | Query time increases linearly with table size; dashboard loads slowly | Verify indexes exist on every column referenced in RLS USING clauses (judet_id, localitate_id, primarie_id, user_id) | 10,000+ rows per table |
| `database.types.ts` at 1,882 lines loaded by every server component | Build times increase; IDE performance degrades | Split into per-domain type files with barrel exports; only import needed types | Noticeable immediately in development; worse as schema grows |
| Supabase Realtime subscriptions without cleanup | Memory leaks in long-lived sessions; connection pool exhaustion | Verify all `useEffect` cleanup functions call `.unsubscribe()`. Check `useNotificationsRealtime()` for proper cleanup | After 30+ minutes of active use; multiple tab users |

## Security Mistakes (v1.0 Platform)

| Mistake | Risk | Prevention |
|---------|------|------------|
| Webhook endpoints accept unverified callbacks | Attacker forges payment completions; fraudulent cerere processing; financial loss to primarie | HMAC signature verification with timing-safe comparison on every webhook. IP whitelist for payment gateway. Rate limit webhook endpoint |
| CSRF protection inconsistently applied | State-changing POST to `/api/cereri` could be triggered from a malicious site the user visits while logged in | Make CSRF middleware mandatory on ALL POST/PUT/DELETE/PATCH routes. Current state: only some routes validate CSRF tokens |
| Service role key hardcoded in database function | If function source code leaks (via SQL injection, backup exposure, or developer error), full database access is compromised | Move to Supabase Secrets (vault). Rotate the key. Audit who has access to function source code |
| `trigger_debug_log` table has RLS disabled | Anyone with the anon key can read debug logs, which may contain function execution traces, error details, and internal state | Delete the table from production, or enable RLS with a `DENY ALL` policy. It should never exist outside development |
| Error responses may include stack traces in production | Attacker learns database schema, file paths, library versions from error details | Implement structured error responses: return generic messages to client, log full details to Better Stack. Never include `error.stack` in API responses |
| No leaked password protection in Supabase Auth | Users register with passwords known to be compromised (in HaveIBeenPwned database) | Enable leaked password protection in Supabase Auth settings. One toggle, zero code changes required |

## UX Pitfalls (v1.0 Platform)

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Broken `/cereri/new` route (0/10 score in E2E audit) | Citizens cannot submit new cereri -- the core value proposition of the platform. They see an error page | Fix is highest-priority UX item. Debug the route; likely a missing Server Component or broken form state. Test with Playwright |
| Gamification points inconsistency (50 pts desktop vs 25 pts mobile) | Users lose trust when they see different point values on different devices. Perceived as a bug or unfairness | Use a single constant for point values. Debug why responsive breakpoint changes the value (likely a conditional render bug) |
| No loading states during primarie context switch | User clicks notification from Primarie B while viewing Primarie A. Page goes blank during context switch | Show a transition overlay: "Se incarca datele pentru [Primarie B]..." with spinner. Only dismiss when new data is loaded |
| Staff dashboards show stub content | Funcionari/primari login, see placeholder text, conclude the platform doesn't work. They never come back | Even before full implementation: show a "Coming soon" state with expected feature list and timeline, not an empty stub |
| Search in dashboard returning 404 for plati | User searches for a payment and gets a broken page instead of "no results found" | Fix the search route handler to return empty results, not 404. Add proper empty state UI |
| Missing document download functionality | User completes a cerere but cannot download the receipt or attached documents. Button exists but does nothing | Wire the download handler. If ZIP archive is not ready, at least support single-file download with signed Supabase Storage URLs |

## "Looks Done But Isn't" Checklist (v1.0 Platform)

- [ ] **Payment Processing:** Webhook signature verification returns hardcoded `false` -- verify HMAC validation is real before accepting any payment callback
- [ ] **Cerere Submission:** Document validation is stubbed (`src/app/api/cereri/[id]/submit/route.ts` line 89) -- cereri can be submitted without required documents
- [ ] **PDF Receipts (Chitante):** Routes return placeholder URL `/storage/chitante/{id}.pdf` -- verify actual PDF files are generated and stored in Supabase Storage
- [ ] **Admin Dashboards:** Components render but display only placeholder content with TODO comments -- verify each role has functional CRUD operations
- [ ] **React Query Prefetch:** `queryFn` is a placeholder comment -- verify prefetch actually fetches data and doesn't cause waterfall loading
- [ ] **Pending Payment Count:** Dashboard shows hardcoded `0` -- verify it queries actual pending plati count from database
- [ ] **Staff Notifications:** API routes have comments for future implementation -- verify funcționari receive notifications when cereri are submitted or status changes
- [ ] **Multi-Tenant Isolation:** RLS policies exist but may filter against wrong context for multi-primarie users -- verify with cross-primarie test scenarios
- [ ] **Monitoring (Better Stack):** Planned migration from Sentry but not yet implemented -- verify error tracking captures exceptions before removing Sentry config
- [ ] **Digital Signatures:** Mock CertSign always returns success -- verify certificate validation actually validates (or clearly indicates mock mode to users)
- [ ] **Email Edge Function:** Function exists and is deployed but JWT key is hardcoded -- verify emails actually send in production and key is in Secrets vault
- [ ] **Accessibility (WCAG 2.1 AA):** Alt text check passes in E2E but keyboard navigation, focus management, and screen reader compatibility not verified -- run axe-core audit on every page

## Recovery Strategies (v1.0 Platform)

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Multi-tenant data leakage discovered in production | HIGH | Immediately disable affected routes. Audit all data access logs. Notify affected primarii. Fix RLS policies. Re-test with multi-primarie fixtures. Deploy hotfix. File data breach notification with ANSPDCP within 72 hours if real PII exposed |
| Forged payment webhook accepted | HIGH | Freeze payment processing. Audit all recent payment status changes. Reverse fraudulent completions. Implement HMAC verification. Notify affected users. Review financial reconciliation |
| GDPR complaint filed by citizen | MEDIUM | Respond within 30 days (GDPR requirement). Implement requested right (access, deletion, portability). Document response. Add automated DSAR processing to prevent recurrence |
| Console.log leaking PII in Vercel logs | MEDIUM | Purge Vercel log history. Deploy `compiler.removeConsole` as emergency fix. Then properly migrate to structured logging |
| Stub dashboards shipped to real primarie | LOW | Communicate timeline to staff users. Ship incremental dashboard updates (weekly). Provide manual workaround documentation for staff operations |
| Database function search path exploited | HIGH | Revoke public schema creation privileges immediately. Apply `SET search_path` migration. Audit for any unauthorized schema objects. Rotate service role key |

## Pitfall-to-Phase Mapping (v1.0 Platform)

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Multi-tenant data leakage | Phase 1: Security & Data Isolation | Integration tests with multi-primarie users pass. Manual QA with 2+ primarii |
| Unverified payment webhooks | Phase 1: Security & Data Isolation | HMAC verification test passes. Forged webhook returns 401. Timing-safe comparison confirmed in code review |
| GDPR non-compliance | Phase 2: Compliance & Monitoring | Privacy policy page exists. Cookie consent works. User can export and delete data. DPA template available |
| Console.log cleanup | Phase 1: Security & Data Isolation | `grep -r "console.log" src/` returns 0 results (or only debug-flagged lines). Better Stack receives production errors |
| Stub admin dashboards | Phase 3: Staff Workflows | Functionar can process cerere from submission to completion. Primar can view and approve. Admin can manage staff |
| Database function search path | Phase 1: Security & Data Isolation | Supabase Security Advisor shows 0 search_path warnings. `trigger_debug_log` table deleted |
| PDF generation placeholder | Phase 3: Staff Workflows | Clicking "download chitanta" returns actual PDF with correct payment details. File exists in Supabase Storage |
| DOMPurify race condition | Phase 1: Security & Data Isolation | Server-side sanitization confirmed for all form submissions. Client-side is defense-in-depth only |
| CSRF inconsistency | Phase 1: Security & Data Isolation | All POST/PUT/DELETE/PATCH routes validate CSRF. Test: cross-origin POST without token returns 403 |
| Accessibility compliance | Phase 4: Polish & Accessibility | axe-core scan on all pages returns 0 critical/serious violations. Keyboard-only navigation works for all user flows |
| Missing test coverage | Phase 2: Compliance & Monitoring | Coverage above 40% for `src/lib/auth/`, `src/lib/payments/`, `src/lib/validations/`. E2E tests cover auth, cereri, plati, admin flows |
| Leaked password protection | Phase 1: Security & Data Isolation | Enable in Supabase Auth settings. Verify: registration with password from HaveIBeenPwned database is rejected |

---

## Sources

**v2.0 Revamp Sources (2026-03-05):**
- Direct inspection of `Revamp Primarie Admin/src/` Figma Make export — `Layout.tsx`, `Sidebar.tsx`, `SetariPage.tsx`, `CommandPalette.tsx`, `NotificationCenter.tsx`, `package.json`, `styles/theme.css`
- Direct inspection of `src/app/admin/layout.tsx` — existing admin layout with client-side auth check
- Direct inspection of `src/middleware.ts` — existing route protection and role check patterns
- Direct inspection of `src/app/globals.css` — existing CSS custom property theme system
- Next.js 15 App Router documentation: Server and Client Components boundary rules (HIGH confidence)
- Framer Motion v12 (`motion/react`) documentation: `layoutId` shared layout animations (HIGH confidence)
- Project `CLAUDE.md` — established conventions (Server Actions over API routes, RLS trust, Romanian UI)
- Supabase Realtime documentation: channel subscription pattern (HIGH confidence)

**v1.0 Platform Sources (2026-03-02):**
- Supabase Production Checklist: https://supabase.com/docs/guides/deployment/going-into-prod (HIGH confidence)
- Supabase RLS Documentation: https://supabase.com/docs/guides/database/postgres/row-level-security (HIGH confidence)
- Supabase Security Checklist for Startups: https://www.cyber-checker.com/blog/supabase-security-checklist (MEDIUM confidence)
- Webhook Security Best Practices 2025-2026: https://dev.to/digital_trubador/webhook-security-best-practices-for-production-2025-2026-384n (MEDIUM confidence)
- Romania ANSPDCP enforcement actions: https://www.dataprotection.ro/index.jsp?page=allnews&lang=en (HIGH confidence)
- Romania GDPR compliance framework: https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/romania (HIGH confidence)
- Multi-tenant RLS in Supabase (LockIn case study): https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2 (MEDIUM confidence)
- Codebase audit: `.planning/codebase/CONCERNS.md`, `.planning/codebase/DATABASE.md`, `.planning/codebase/TESTING.md` (HIGH confidence)

---
*Pitfalls research for: Figma Make → Next.js 15 App Router admin UI revamp (v2.0) + Romanian e-government multi-tenant SaaS platform (v1.0)*
*Updated: 2026-03-05*
