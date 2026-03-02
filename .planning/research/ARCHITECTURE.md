# Architecture Research

**Domain:** Multi-tenant Romanian e-government SaaS (primariata.work)
**Researched:** 2026-03-02
**Confidence:** HIGH (existing codebase analyzed + Supabase official docs verified)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Client Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Landing +   │  │ Dashboard    │  │ Admin Panels             │   │
│  │  Location    │  │ (role-based) │  │ (primarie/super)         │   │
│  │  Selection   │  │              │  │                          │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘   │
│         │                 │                      │                   │
├─────────┴─────────────────┴──────────────────────┴───────────────────┤
│                        Context Layer (NEW)                           │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Primarie Context Provider (Zustand)                         │    │
│  │  - active_primarie_id from URL [judet]/[localitate]          │    │
│  │  - approved primarii list from user_primarii                 │    │
│  │  - context switch without re-login                           │    │
│  └──────────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────────┤
│                        Middleware Layer                               │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Next.js Middleware (session + primarie context)              │    │
│  │  - Refresh JWT session                                       │    │
│  │  - Inject x-primarie-id header from URL params               │    │
│  │  - Validate user has approved registration for primarie      │    │
│  └──────────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────────┤
│                        Server Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Server       │  │ Server       │  │ API Routes               │   │
│  │ Components   │  │ Actions      │  │ (webhooks, etc.)         │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘   │
│         │                 │                      │                   │
├─────────┴─────────────────┴──────────────────────┴───────────────────┤
│                        Data Access Layer                             │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Supabase Client Factory (server/client/middleware)           │    │
│  │  Server client: injects x-primarie-id as global header       │    │
│  │  Client: passes primarie context from Zustand                │    │
│  └──────────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────────┤
│                        Database Layer (Supabase PostgreSQL)          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ user_primarii│  │ RLS Policies │  │ db_pre_request           │   │
│  │ (junction)   │  │ (primarie    │  │ (set app.current_        │   │
│  │              │  │  context)    │  │  primarie_id)            │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Primarie Context Provider | Track active primarie, user's approved primarii list, context switching | Zustand store + React Context, synced with URL params |
| user_primarii table | Junction table linking users to primarii with approval status | PostgreSQL table with RLS, status enum (pending/approved/rejected) |
| db_pre_request function | Extract primarie context from request headers before RLS evaluation | PostgreSQL function called by PostgREST before each query |
| Middleware | Inject primarie context header, validate registration approval | Next.js middleware extracting primarie from URL route params |
| Server Supabase Client | Pass x-primarie-id header on every database request | Modified createClient() in src/lib/supabase/server.ts |
| Notifications Service | Cross-primarie notification aggregation | Only module that queries across primarii boundaries |

## Recommended Project Structure

```
src/
├── app/
│   ├── app/[judet]/[localitate]/          # Primarie-scoped routes
│   │   ├── page.tsx                        # Dashboard (role-based)
│   │   ├── cereri/                         # Requests module
│   │   ├── plati/                          # Payments module
│   │   ├── documente/                      # Documents module
│   │   └── notificari/                     # Notifications (cross-primarie)
│   ├── auth/                               # Authentication routes
│   ├── api/
│   │   ├── user/
│   │   │   ├── profile/route.ts            # User profile
│   │   │   └── primarii/route.ts           # User's primarii registrations (NEW)
│   │   └── primarii/
│   │       └── [id]/
│   │           └── registrations/route.ts  # Admin approval endpoints (NEW)
│   └── admin/                              # Super admin panel
├── components/
│   ├── providers/
│   │   └── primarie-context-provider.tsx   # Primarie context (NEW)
│   ├── primarie/
│   │   ├── PrimarieSwitcher.tsx            # Context switch UI (NEW)
│   │   └── RegistrationStatus.tsx          # Approval status screen (NEW)
│   └── dashboard/
│       └── role-dashboards/                # Existing role dashboards
├── hooks/
│   ├── use-user-profile.ts                 # Existing
│   ├── use-primarie-context.ts             # Active primarie context (NEW)
│   └── use-user-primarii.ts                # User's primarii list (NEW)
├── lib/
│   ├── supabase/
│   │   ├── server.ts                       # Modified: inject primarie header
│   │   ├── client.ts                       # Modified: inject primarie header
│   │   └── middleware.ts                   # Existing
│   └── location-storage.ts                # Existing, extended for primarie context
└── store/
    └── primarie-store.ts                   # Zustand store for primarie context (NEW)
```

### Structure Rationale

- **store/:** Zustand store holds the active primarie context client-side, synced with URL params. This replaces the current localStorage-only approach with a reactive state management layer.
- **components/primarie/:** Dedicated components for the multi-primarie UX (switcher, registration status). Keeps primarie-switching concerns separate from dashboard logic.
- **hooks/use-primarie-context.ts:** Encapsulates the active primarie resolution logic (URL params -> primarie_id lookup -> validation against user_primarii).

## Architectural Patterns

### Pattern 1: Junction Table + Application-Level Context (CRITICAL)

**What:** Replace the current single-primarie-per-user model (`utilizatori.primarie_id`) with a junction table (`user_primarii`) that allows many-to-many relationships between users and primarii. The active primarie is determined per-request from URL params, not from user metadata.

**When to use:** Always. This is the foundational change that enables multi-primarie support.

**Trade-offs:**
- Pro: Clean data model, supports approval workflow, no JWT manipulation needed
- Pro: Context switch is just a URL change -- no re-authentication
- Con: Requires migration of existing `utilizatori.primarie_id` data
- Con: Every RLS policy must be updated to use new context resolution

**Migration SQL:**

```sql
-- New junction table
CREATE TABLE user_primarii (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES utilizatori(id) ON DELETE CASCADE,
  primarie_id uuid NOT NULL REFERENCES primarii(id) ON DELETE CASCADE,
  rol varchar(50) NOT NULL DEFAULT 'cetatean',
  status varchar(20) NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
  motiv_respingere text,                           -- rejection reason
  aprobat_de uuid REFERENCES utilizatori(id),      -- who approved
  data_aprobare timestamptz,
  permisiuni jsonb DEFAULT '{}',
  departament varchar(200),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(user_id, primarie_id)  -- one registration per primarie per user
);

-- Indexes
CREATE INDEX idx_user_primarii_user ON user_primarii(user_id) WHERE status = 'approved';
CREATE INDEX idx_user_primarii_primarie ON user_primarii(primarie_id, status);
CREATE INDEX idx_user_primarii_pending ON user_primarii(primarie_id) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE user_primarii ENABLE ROW LEVEL SECURITY;

-- Users can see their own registrations
CREATE POLICY user_primarii_own ON user_primarii
  FOR SELECT USING (user_id = auth.uid());

-- Users can create new registrations (sign up for primarii)
CREATE POLICY user_primarii_register ON user_primarii
  FOR INSERT WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Admins of a primarie can manage registrations for that primarie
CREATE POLICY user_primarii_admin ON user_primarii
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = user_primarii.primarie_id
        AND up.rol IN ('admin', 'super_admin')
        AND up.status = 'approved'
    )
  );
```

### Pattern 2: db_pre_request + Custom Header for Primarie Context

**What:** Use Supabase's `db_pre_request` hook to extract a custom `x-primarie-id` header from each request and store it as a PostgreSQL session variable (`app.current_primarie_id`). RLS policies then read this session variable instead of querying `utilizatori.primarie_id`.

**When to use:** For all primarie-scoped data access (cereri, plati, documente, etc.). NOT for notifications (cross-primarie) or user profile (global).

**Trade-offs:**
- Pro: Per-request context, no JWT manipulation, works with connection pooling (Supabase handles reset)
- Pro: No race condition across devices/sessions (each request carries its own context)
- Pro: PostgREST/Supabase automatically handles the `request.headers` GUC
- Con: Custom headers must be passed consistently from all client entry points
- Con: Does not work with Supabase Realtime (WebSocket cannot set custom headers)

**Implementation:**

```sql
-- db_pre_request function: runs before every PostgREST query
CREATE OR REPLACE FUNCTION public.set_primarie_context()
RETURNS void AS $$
DECLARE
  req_primarie_id text;
  user_id uuid;
BEGIN
  -- Extract x-primarie-id from request headers
  req_primarie_id := current_setting('request.headers', true)::json->>'x-primarie-id';
  user_id := auth.uid();

  IF req_primarie_id IS NOT NULL AND user_id IS NOT NULL THEN
    -- Validate user has approved access to this primarie
    IF EXISTS (
      SELECT 1 FROM public.user_primarii
      WHERE user_primarii.user_id = set_primarie_context.user_id
        AND user_primarii.primarie_id = req_primarie_id::uuid
        AND user_primarii.status = 'approved'
    ) THEN
      PERFORM set_config('app.current_primarie_id', req_primarie_id, true);
      -- Also set the user's role for this specific primarie
      PERFORM set_config('app.current_primarie_role', (
        SELECT rol FROM public.user_primarii
        WHERE user_primarii.user_id = set_primarie_context.user_id
          AND user_primarii.primarie_id = req_primarie_id::uuid
          AND user_primarii.status = 'approved'
      ), true);
    ELSE
      -- User not approved for this primarie; set to NULL
      PERFORM set_config('app.current_primarie_id', '', true);
      PERFORM set_config('app.current_primarie_role', '', true);
    END IF;
  ELSE
    PERFORM set_config('app.current_primarie_id', '', true);
    PERFORM set_config('app.current_primarie_role', '', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Register as db_pre_request
ALTER ROLE authenticator SET pgrst.db_pre_request TO 'set_primarie_context';
NOTIFY pgrst, 'reload config';
```

**Updated RLS helper functions:**

```sql
-- Replace current_user_primarie() to use session context
CREATE OR REPLACE FUNCTION public.current_user_primarie()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_primarie_id', true), '')::uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Replace current_user_role() to use per-primarie role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
DECLARE
  primarie_role text;
  global_role text;
BEGIN
  primarie_role := NULLIF(current_setting('app.current_primarie_role', true), '');
  IF primarie_role IS NOT NULL THEN
    RETURN primarie_role;
  END IF;
  -- Fallback: check if super_admin (global role, not per-primarie)
  SELECT rol INTO global_role FROM public.utilizatori WHERE id = auth.uid();
  RETURN COALESCE(global_role, 'cetatean');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

**Modified server client (src/lib/supabase/server.ts):**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import type { Database } from "@/types/database.types";

export async function createClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Extract primarie context from request headers (set by middleware)
  const primarieId = headerStore.get("x-primarie-id") || "";

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignored if middleware refreshes sessions
          }
        },
      },
      global: {
        headers: {
          "x-primarie-id": primarieId,
        },
      },
    }
  );
}
```

### Pattern 3: URL-Driven Primarie Context

**What:** The active primarie is always determined from the URL route params (`/app/[judet]/[localitate]/...`). Middleware resolves `[judet]/[localitate]` slugs to a `primarie_id` and injects it as a request header. No state stored in JWT or user metadata for active primarie.

**When to use:** All navigation within the app. Context switching = navigating to a different URL.

**Trade-offs:**
- Pro: Stateless -- no session corruption, works perfectly with SSR/RSC
- Pro: Deep-linkable -- sharing a URL always points to the right primarie
- Pro: Browser back/forward works naturally with primarie context
- Con: Requires slug-to-primarie_id lookup on every request (cacheable)
- Con: URL must always contain location context for protected routes

**Middleware implementation:**

```typescript
// In middleware.ts - add primarie resolution
export async function middleware(request: NextRequest) {
  // ... existing auth logic ...

  // Extract primarie context from URL
  const pathname = request.nextUrl.pathname;
  const appRouteMatch = pathname.match(/^\/app\/([^/]+)\/([^/]+)/);

  if (appRouteMatch) {
    const [, judetSlug, localitateSlug] = appRouteMatch;

    // Resolve slugs to primarie_id (cached lookup)
    const primarieId = await resolvePrimarieId(judetSlug, localitateSlug, supabase);

    if (primarieId) {
      // Inject as request header for downstream Supabase client
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-primarie-id", primarieId);

      supabaseResponse = NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
  }

  return supabaseResponse;
}
```

### Pattern 4: Realtime Workaround for Cross-Primarie Notifications

**What:** Since Supabase Realtime (WebSocket) cannot pass custom headers, notifications use user-scoped RLS (not primarie-scoped). The `notifications` table has `utilizator_id` as the primary filter, with `primarie_id` as metadata for display grouping only.

**When to use:** Only for notifications. All other modules use primarie-scoped RLS.

**Trade-offs:**
- Pro: Realtime subscriptions work without custom headers
- Pro: Cross-primarie notification aggregation is natural
- Con: Notifications table has different RLS pattern than other tables

**Current state:** The existing `notifications` table already uses `utilizator_id`-scoped RLS (not primarie-scoped), which is correct for this pattern. No changes needed to notification RLS.

## Data Flow

### Request Flow (Primarie-Scoped)

```
[User navigates to /app/alba/alba-iulia/cereri]
    |
    v
[Next.js Middleware]
    |-- Extract judet=alba, localitate=alba-iulia from URL
    |-- Resolve to primarie_id via cached lookup
    |-- Inject x-primarie-id header
    |-- Verify user session (JWT refresh)
    v
[Server Component / Server Action]
    |-- createClient() reads x-primarie-id from headers
    |-- Passes as global header to Supabase
    v
[Supabase PostgREST]
    |-- db_pre_request: set_primarie_context() runs
    |-- Extracts x-primarie-id from request.headers
    |-- Validates user has approved registration in user_primarii
    |-- SET app.current_primarie_id = <primarie_id>
    |-- SET app.current_primarie_role = <user's role for this primarie>
    v
[RLS Policy Evaluation]
    |-- current_user_primarie() returns app.current_primarie_id
    |-- current_user_role() returns app.current_primarie_role
    |-- Rows filtered to current primarie only
    v
[Query Result] --> [Server Component renders] --> [Client]
```

### Context Switch Flow

```
[User receives notification from Primarie B while viewing Primarie A]
    |
    v
[Notification shows: "Cererea #123 de la Primaria Brașov a fost aprobată"]
    |-- Action button: "Vezi cererea"
    v
[Confirm Dialog: "Veți fi redirecționat la Primăria Brașov. Continuați?"]
    |-- User confirms
    v
[Router.push("/app/brasov/brasov/cereri/123")]
    |-- URL changes -> middleware picks up new primarie context
    |-- No re-authentication needed (same JWT session)
    |-- Zustand store updates active primarie
    |-- All subsequent queries scoped to new primarie
    v
[Dashboard re-renders with Primarie B context]
```

### Registration + Approval Flow

```
[Citizen visits primariata.work]
    |-- Selects județ + localitate (e.g., Alba / Alba Iulia)
    v
[Registration Page]
    |-- Creates auth.users record
    |-- handle_new_user() trigger creates utilizatori record
    |-- Creates user_primarii record with status='pending'
    v
[Pending Approval Screen]
    |-- User sees: "Înregistrarea ta la Primăria Alba Iulia este în așteptare"
    |-- Shows status: pending / approved / rejected with reason
    v
[Admin of Primarie receives notification]
    |-- Reviews registration in admin dashboard
    |-- Approves or rejects (with reason)
    v
[On Approval]
    |-- user_primarii.status = 'approved'
    |-- Notification sent to user
    |-- User can now access dashboard for this primarie
```

### State Management

```
[Zustand Primarie Store]
    |
    |-- activePrimarieId: string (from URL)
    |-- activePrimarieSlug: {judet, localitate}
    |-- userPrimarii: UserPrimarie[] (from React Query)
    |-- switchPrimarie(judetSlug, localitateSlug): void
    |
    v
[URL State] <--> [Zustand Store] <--> [React Query Cache]
    |                                       |
    |-- Source of truth                     |-- user_primarii query
    |-- /app/[judet]/[localitate]           |-- staleTime: 5 min
```

### Key Data Flows

1. **Primarie Resolution:** URL slug -> middleware -> Supabase lookup (cached) -> primarie_id header
2. **RLS Context:** x-primarie-id header -> db_pre_request -> session variable -> RLS policy evaluation
3. **Registration:** User signup -> utilizatori record + user_primarii(pending) -> admin approval -> user_primarii(approved)
4. **Context Switch:** Notification click -> confirm dialog -> URL navigation -> middleware re-resolves -> new primarie context

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 primarii (current) | Single Supabase project, shared schema with RLS. Slug-to-primarie lookup can be in-memory cache in middleware. |
| 100-1K primarii | Add Redis/Vercel KV for slug-to-primarie cache. Consider materialized view for dashboard stats per primarie. |
| 1K+ primarii | Connection pooling (PgBouncer already included in Supabase). Partition large tables (cereri, plati) by primarie_id. Consider read replicas for dashboard analytics. |

### Scaling Priorities

1. **First bottleneck:** db_pre_request function runs on every request -- must be fast. The EXISTS query against user_primarii should be sub-millisecond with proper indexes. Monitor with `pg_stat_statements`.
2. **Second bottleneck:** Slug-to-primarie_id resolution in middleware. Cache aggressively (Map in memory for dev, Vercel KV for production). Primarie slugs rarely change.

## Anti-Patterns

### Anti-Pattern 1: Storing Active Primarie in JWT/User Metadata

**What people do:** Update `auth.users.raw_app_meta_data` or `raw_user_meta_data` with the current primarie_id when user switches context.

**Why it's wrong:** JWT metadata is shared across ALL sessions. If user is logged in on two devices viewing different primarii, updating metadata on device A changes the context on device B. This is the root cause of the current architecture's multi-primarie limitation.

**Do this instead:** Pass primarie context per-request via HTTP header, resolved from URL params. Each request is independent.

### Anti-Pattern 2: Manual Primarie Filtering in Application Code

**What people do:** Add `.eq('primarie_id', activePrimarieId)` to every Supabase query in application code.

**Why it's wrong:** Duplicates RLS logic, easy to forget, creates security holes when a developer skips the filter.

**Do this instead:** Let RLS handle primarie filtering automatically. The `db_pre_request` + `current_user_primarie()` pattern ensures every query is filtered without application-level intervention.

### Anti-Pattern 3: Single Role Per User (Current Model)

**What people do:** Store a single `rol` on `utilizatori` table, meaning a user has the same role across all primarii.

**Why it's wrong:** A user could be a `cetatean` in Primaria Alba Iulia but a `functionar` in Primaria Brașov. The role should be per-registration, not per-user.

**Do this instead:** Store role on `user_primarii` (the junction table), not on `utilizatori`. The `utilizatori.rol` field becomes a "global" role indicator (only meaningful for `super_admin`). Per-primarie role comes from `user_primarii.rol`.

### Anti-Pattern 4: Bypassing RLS for Notifications

**What people do:** Use service role client to query notifications across primarii because the RLS context is primarie-scoped.

**Why it's wrong:** Exposes service role usage in client-facing code paths, risk of accidental data leakage.

**Do this instead:** Notifications already use `utilizator_id`-scoped RLS (not primarie-scoped). They naturally aggregate across primarii. No service role needed.

## Integration Points

### External Services

| Service | Integration Pattern | Multi-Primarie Notes |
|---------|---------------------|----------------------|
| Ghiseul.ro (payments) | Webhook callbacks with HMAC verification | Payment webhook includes `primarie_id` in payload; no context switching needed |
| CertSign (signatures) | API calls from server actions | Signature request includes `primarie_id`; scoped per cerere |
| SendGrid (email) | Edge Function triggered by DB trigger | Email templates reference primarie name from cereri -> primarii join |
| Twilio (SMS) | Edge Function with rate limiting | SMS sent per-user, not per-primarie; no isolation concern |
| Supabase Realtime | WebSocket subscription | Cannot pass custom headers; use user-scoped RLS for notifications only |
| WeatherAPI | Client-side fetch per localitate | No auth needed; location from URL params |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Middleware <-> Server Components | HTTP headers (x-primarie-id) | Middleware injects, server reads |
| Zustand Store <-> URL | Router navigation | URL is source of truth; store syncs |
| user_primarii <-> RLS | db_pre_request session variable | Validated on every query |
| Notifications <-> Other modules | Different RLS scope | Notifications: user-scoped. Everything else: primarie-scoped |
| Admin approval <-> Registration | user_primarii.status | Approval triggers notification to user |

## Build Order Dependencies

The multi-primarie architecture must be built in this specific order due to data dependencies:

### Phase 1: Foundation (Database + RLS)
**Must build first -- everything depends on this.**

1. Create `user_primarii` junction table with migration
2. Migrate existing `utilizatori.primarie_id` data into `user_primarii`
3. Create `set_primarie_context()` db_pre_request function
4. Update `current_user_primarie()` and `current_user_role()` helper functions
5. Update all existing RLS policies to use new context resolution
6. Test RLS isolation with multiple users across multiple primarii

**Why first:** Every subsequent feature depends on correct data isolation. If RLS is wrong, all downstream features leak data.

### Phase 2: Middleware + Client Integration
**Depends on Phase 1 (database must understand primarie context).**

1. Update middleware to resolve URL slugs to primarie_id
2. Inject `x-primarie-id` header in middleware
3. Modify `createClient()` in server.ts to pass header
4. Modify `createClient()` in client.ts to pass header
5. Create Zustand store for primarie context
6. Create `use-primarie-context` and `use-user-primarii` hooks

**Why second:** The application layer needs to speak the same language as the database layer.

### Phase 3: Registration + Approval Flow
**Depends on Phase 1 (user_primarii table) and Phase 2 (context plumbing).**

1. Registration flow creates `user_primarii` record with `status='pending'`
2. Pending approval screen for users awaiting access
3. Admin dashboard: registration approval/rejection UI
4. Notification triggers on approval/rejection
5. Update `handle_new_user()` trigger for new flow

**Why third:** Users need to register before they can access anything. Admin needs to approve before data flows.

### Phase 4: Context Switching UX
**Depends on Phase 2 (Zustand store) and Phase 3 (multiple approved primarii).**

1. Primarie switcher dropdown in dashboard header
2. Cross-primarie notification with context switch popup
3. Confirm dialog before switching
4. URL navigation on switch (no re-login)

**Why fourth:** Needs multiple approved registrations and working primarie context to test.

### Phase 5: Role-Based Dashboards
**Depends on Phase 1 (per-primarie roles) and Phase 2 (context awareness).**

1. Functionar dashboard (primarie-scoped)
2. Primar dashboard (primarie-scoped)
3. Admin dashboard (primarie-scoped + approval management)
4. Super admin panel (cross-primarie)

**Why fifth:** Dashboards render data that depends on correct primarie context and role resolution.

## Migration Strategy for Existing Data

The current `utilizatori` table has a `primarie_id` column that stores a single primarie association. This must be migrated to the junction table:

```sql
-- Migration: Move existing primarie associations to user_primarii
INSERT INTO user_primarii (user_id, primarie_id, rol, status, data_aprobare)
SELECT
  id AS user_id,
  primarie_id,
  rol,
  'approved' AS status,  -- existing users are pre-approved
  now() AS data_aprobare
FROM utilizatori
WHERE primarie_id IS NOT NULL
  AND deleted_at IS NULL;

-- For cetățeni without primarie_id: no migration needed
-- They'll register for primarii through the new flow

-- Keep utilizatori.primarie_id temporarily for backward compatibility
-- Remove after all code paths use user_primarii
-- ALTER TABLE utilizatori DROP COLUMN primarie_id; -- Phase 2 cleanup
```

## Realtime Consideration

Supabase Realtime (WebSocket) cannot pass custom HTTP headers. This means:

- **Notifications:** Must use user-scoped RLS (`utilizator_id = auth.uid()`), NOT primarie-scoped. This is already the case in the current schema. Cross-primarie aggregation works naturally.
- **Realtime for cereri/plati updates:** These should use the `primarie_id` column in the filter, not RLS context. Example: `supabase.channel('cereri-updates').on('postgres_changes', { filter: 'primarie_id=eq.<id>' })`. The filter is applied at the Realtime subscription level, independent of RLS context headers.
- **Alternative:** Use polling with React Query (refetchInterval) instead of Realtime for primarie-scoped data. This works with the header-based context and is simpler to implement.

## Sources

- [Supabase Row Level Security Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) -- HIGH confidence
- [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook) -- HIGH confidence
- [Supabase Multi-Tenant Discussion #1615](https://github.com/orgs/supabase/discussions/1615) -- MEDIUM confidence (community discussion)
- [Supabase Session State for RLS Discussion #6301](https://github.com/orgs/supabase/discussions/6301) -- MEDIUM confidence (community discussion, confirms header approach)
- [Supabase JS Client - Custom Headers](https://supabase.com/docs/reference/javascript/v1) -- HIGH confidence
- [Multi-Tenant RLS on Supabase (AntStack)](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/) -- MEDIUM confidence
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) -- HIGH confidence
- [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) -- HIGH confidence
- Existing codebase analysis: `supabase/migrations/20250118000002_create_rls_policies.sql` -- HIGH confidence (primary source)

---
*Architecture research for: primariata.work multi-primarie model*
*Researched: 2026-03-02*
