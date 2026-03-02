# Architecture

**Analysis Date:** 2026-03-02

## Pattern Overview

**Overall:** Next.js 15 App Router with Supabase backend, multi-tenant SaaS architecture

**Key Characteristics:**

- Server Components by default (RSC - React Server Components)
- Row-Level Security (RLS) for multi-tenancy isolation by județul + localitate
- Server Actions for mutations (prefer over API routes)
- JWT authentication with Supabase Auth
- Edge Functions for specialized tasks (Deno runtime)
- Middleware for session management and route protection

## Layers

**Presentation Layer:**

- Purpose: User-facing React components and pages
- Location: `src/components/`, `src/app/`
- Contains: Server Components, Client Components (use client), UI primitives (shadcn/ui)
- Depends on: Hooks, Validation schemas, Utility functions
- Used by: Next.js routing system

**Route/Page Layer:**

- Purpose: Next.js App Router routes with layout hierarchy
- Location: `src/app/**/*.tsx` (layout.tsx, page.tsx, error.tsx)
- Contains: Page components, Layout wrappers, Error boundaries
- Depends on: Components, Hooks, Server utilities
- Used by: Next.js router for request handling

**Server Action / API Layer:**

- Purpose: Mutation handling and server-side logic
- Location: `src/app/api/` (Route Handlers), Server Actions in page/component files
- Contains: API routes (GET, POST, PUT, DELETE), Server Actions (use server)
- Depends on: Supabase client, Validation schemas, Authorization helpers
- Used by: Client forms, fetch calls, server-side processing

**Data Access Layer:**

- Purpose: Supabase client initialization and RLS-protected queries
- Location: `src/lib/supabase/` (server.ts, client.ts, middleware.ts)
- Contains: Three client types (server, client, middleware), typed queries via Database types
- Depends on: Supabase JS SDK, environment variables
- Used by: All application layers

**Business Logic Layer:**

- Purpose: Domain-specific functions, authorization, validation
- Location: `src/lib/auth/`, `src/lib/payments/`, `src/lib/signature/`, `src/lib/validations/`
- Contains: Authorization helpers, payment processors, PDF generation, Zod validation schemas
- Depends on: Supabase client, External APIs (Ghișeul, CertSign, Twilio)
- Used by: Server Actions, API routes, Server Components

**State Management:**

- Purpose: Client-side state (forms, UI state, global state)
- Location: `src/hooks/` (custom hooks), `src/store/` (Zustand stores)
- Contains: Custom React hooks (useUserProfile, useCereriList, etc), Zustand stores for location
- Depends on: React hooks, React Query, Supabase client
- Used by: Client Components

**Middleware Layer:**

- Purpose: Request interception, session management, route protection
- Location: `src/middleware.ts`, `src/lib/supabase/middleware.ts`
- Contains: Auth guards, session refresh, redirect logic
- Depends on: Supabase client, Next.js request/response
- Used by: Every request to the application

## Data Flow

**Authentication Flow:**

1. User visits `/auth/login` (public route)
2. `LoginForm` component (client) submits email + password
3. Supabase Auth returns session JWT in httpOnly cookie
4. Middleware (`src/middleware.ts`) refreshes session on every request
5. User redirected to `/app/[judet]/[localitate]/` (protected route)
6. RLS policies on all tables filter data by user's metadata (judet_id, localitate_id)

**Page Load Flow (Protected Route Example):**

1. Request → Middleware (`src/middleware.ts`)
   - Verify session via `supabase.auth.getUser()`
   - If unauthenticated → redirect to `/auth/login`
   - If authenticated → proceed with request
2. Page Component (`src/app/app/[judet]/[localitate]/page.tsx`)
   - Server Component fetches user profile via `useUserProfile()` hook
   - Hook queries `src/app/api/user/profile` (Server Action)
   - API route authenticates via middleware, queries `utilizatori` table
   - RLS enforces user's own record only
3. Role-based dashboard rendered conditionally (cetatean, functionar, primar, admin, super_admin)
4. Child components fetch their data via React Query or Server Components

**Form Submission Flow:**

1. Client Component renders form with React Hook Form + Zod validation
2. On submit, call Server Action (marked with `'use server'`)
3. Server Action:
   - Gets authenticated user via `getCurrentUser()` in `src/lib/auth/authorization.ts`
   - Validates input via Zod schema with sanitization
   - Checks authorization (ownership, role, resource access)
   - Executes mutation via Supabase client
   - RLS enforces permissions automatically
   - Calls `revalidatePath()` to invalidate cache
   - Returns result or error

**Real-Time Updates:**

1. Components use Supabase Realtime subscriptions
2. Example: `useNotificationsRealtime()` hook in `src/hooks/use-notifications-realtime.ts`
3. Subscription via `supabase.from('notificari').on('*', callback).subscribe()`
4. Updates trigger React Query invalidation via `queryClient.invalidateQueries()`

**Multi-Tenancy Isolation:**

1. User location (județ_id, localitate_id) stored in user metadata during registration
2. Every table has indexes on judet_id + localitate_id
3. RLS policies enforce: `user_metadata.judet_id = table.judet_id AND user_metadata.localitate_id = table.localitate_id`
4. Middleware ensures location selection before dashboard access
5. Location stored in cookie + localStorage for quick access

## Key Abstractions

**Supabase Client Factory (`src/lib/supabase/`):**

- Purpose: Consistent, typed access to Supabase across all contexts
- Examples:
  - `createClient()` - Server Components, Server Actions (awaited)
  - `createClient()` - Client Components (sync)
  - `createServiceRoleClient()` - Admin operations, public endpoints
- Pattern: Client creation is context-aware (see CLAUDE.md for usage)

**Authorization Helpers (`src/lib/auth/authorization.ts`):**

- Purpose: Reusable authorization checks with consistent error handling
- Examples:
  - `getCurrentUser()` - Get authenticated user from session
  - `requireAuth()` - Guard that returns 401 if unauthenticated
  - `requireRole([UserRole.ADMIN])` - Guard that checks role
  - `requireOwnership(userId)` - Guard that verifies resource ownership
  - `validateUUID()` - Format validation for route params
- Pattern: Returns error response or null (null = authorized)

**Validation Schemas (`src/lib/validations/`):**

- Purpose: Zod schemas for request/form validation with security hardening
- Files: cereri.ts, profile.ts, plati.ts, notifications.ts, staff-invite.ts, common.ts
- Security: Size limits, XSS sanitization, string length restrictions
- Pattern: Each schema has comments explaining security decisions (Issue #93)

**Custom Hooks (`src/hooks/`):**

- Purpose: Encapsulate data fetching, real-time subscriptions, form state
- Key hooks:
  - `useUserProfile()` - Fetch authenticated user profile with caching
  - `useCereriList()` - Paginated list of requests with filters
  - `useNotificationsRealtime()` - Real-time notification subscriptions
  - `useWizardState()` - Multi-step form state management
  - `useExport()` - CSV/Excel export logic
- Pattern: Return { data, isLoading, isError, error } tuple-like interface

**React Query Setup (`src/lib/react-query.ts`):**

- Purpose: Centralized React Query configuration
- Settings: Default staleTime, cacheTime, retry logic
- Client: QueryClientProvider wraps app in `src/components/providers/query-provider.tsx`

**Location Storage (`src/lib/location-storage.ts`):**

- Purpose: Persist selected județul + localitate across sessions
- Functions:
  - `saveLocation()` - Save to localStorage + cookie
  - `getLocation()` - Retrieve with fallback logic
  - `clearLocation()` - Clear both stores
  - `validateLocation()` - Verify slugs still exist in DB
- Pattern: Dual storage (localStorage for client, cookie for server) with sync

**Authorization Enum (`src/lib/auth/authorization.ts`):**

- Purpose: Type-safe role constants
- Values: CETATEAN, FUNCTIONAR, ADMIN, SUPER_ADMIN
- Usage: `await requireRole([UserRole.ADMIN], request)`

## Entry Points

**Web Application:**

- Location: `src/app/page.tsx` (landing page)
- Triggers: User visits primariata.work
- Responsibilities:
  - Display landing page with location selection
  - Redirect authenticated users to dashboard
  - Redirect unauthenticated users to login

**Dashboard:**

- Location: `src/app/app/[judet]/[localitate]/page.tsx`
- Triggers: Authenticated user with selected location
- Responsibilities:
  - Fetch user profile (role-based)
  - Render role-specific dashboard component
  - Display location context

**Authentication:**

- Location: `src/app/auth/login/page.tsx`
- Triggers: Unauthenticated user or redirect from protected route
- Responsibilities:
  - Email/password login form
  - Google OAuth integration
  - Redirect to dashboard on success

**Admin Panel:**

- Location: `src/app/admin/`
- Triggers: Admin or super_admin user
- Responsibilities:
  - User management
  - Survey management
  - System configuration

## Middleware

**Session Refresh (`src/middleware.ts`):**

- Runs on every request via matcher pattern
- Creates Supabase server client
- Calls `supabase.auth.getUser()` to refresh JWT
- Returns updated cookies in response
- Protects `/app/**` routes (redirects unauthenticated to `/auth/login`)
- Protects `/auth/**` routes (redirects authenticated users to `/app/...`)
- Matcher: All requests except static files, images, favicon

**Session Update Helper (`src/lib/supabase/middleware.ts`):**

- Exported helper for custom middleware usage
- Named export: `updateSession(request: NextRequest)`
- Returns: `{ supabaseResponse, user }`
- Used by: Route handlers that need fresh session

## Error Handling

**Strategy:** Explicit error handling with Sentry integration

**Patterns:**

**Server Components/Actions:**

```typescript
try {
  const result = await riskyOperation();
  return { data: result };
} catch (error) {
  console.error("Operation failed:", error);
  Sentry.captureException(error);
  return { error: "Human-readable error message" };
}
```

**API Routes:**

```typescript
try {
  // Validation
  // Authorization
  // Execution
  return NextResponse.json({ data }, { status: 200 });
} catch (error) {
  console.error("Error in GET /api/endpoint:", error);
  return NextResponse.json(
    { error: "Internal server error", details: error.message },
    { status: 500 }
  );
}
```

**Client Components:**

```typescript
const { data, isLoading, isError, error } = useUserProfile()
if (isError) return <ErrorFallback error={error} />
```

**Error Boundaries:**

- Location: `src/app/error.tsx` (route-level), `src/app/global-error.tsx` (app-level)
- Wraps: `src/components/error-boundary` component
- Reports: Errors to Sentry via `Sentry.captureException()`
- Fallback: Shows error UI or redirects user

**Validation Errors:**

- Schema validation failures logged with field-level details
- Sanitization errors prevent XSS and injection attacks
- Security violations logged to Sentry with context (IP, user ID, action)

## Cross-Cutting Concerns

**Authentication:**

- Session stored in httpOnly cookie (Supabase Auth)
- JWT refreshed on every request via middleware
- User metadata contains judet_id, localitate_id for RLS
- Google OAuth available as alternative login method

**Authorization:**

- RLS policies on all tables (enforced in Supabase)
- Application-level checks in API routes and Server Actions
- Role-based access control (RBAC) via `requireRole()` helper
- Ownership checks via `requireOwnership()` helper
- Audit logging via `logSecurityEvent()` to Sentry

**Validation:**

- Zod schemas in `src/lib/validations/`
- Form validation via React Hook Form + Zod resolver
- API request validation before processing
- Sanitization of JSONB fields to prevent injection
- Size limits to prevent DoS (e.g., 100KB max for form data)

**Logging:**

- Console logs for development (with prefixes like `[location-storage]`)
- Sentry integration for error tracking (`src/app/global-error.tsx`)
- Security event logging for unauthorized access attempts
- Audit trail in database via `audit_log` table

**Performance:**

- React Query for server-state caching
- Supabase Realtime for updates without polling
- Next.js Image optimization for Google OAuth avatars
- CSS-in-JS via Tailwind + shadcn/ui (no runtime overhead)
- Server Components reduce JavaScript bundle size

**Monitoring:**

- Sentry error tracking (`@sentry/nextjs` integration)
- Vercel Analytics for performance metrics
- Vercel Speed Insights for Core Web Vitals
- Custom security event monitoring via `logSecurityEvent()`

---

_Architecture analysis: 2026-03-02_
