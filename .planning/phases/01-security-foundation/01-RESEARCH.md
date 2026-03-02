# Phase 1: Security Foundation - Research

**Researched:** 2026-03-02
**Domain:** Multi-tenant data isolation, RLS migration, webhook security, structured logging, CSRF protection
**Confidence:** HIGH

## Summary

Phase 1 requires migrating from a single-primarie-per-user model (JWT metadata + `utilizatori.primarie_id`) to a per-request context model via a `user_primarii` junction table. This is the highest-stakes change in the project because every RLS policy, every query, and every authorization check depends on it. The technical approach is well-supported by Supabase's architecture: PostgREST exposes custom request headers to SQL via `current_setting('request.headers', true)`, and `@supabase/ssr`'s `createServerClient` accepts `global.headers` which get passed through to PostgREST. The `db_pre_request` hook provides a single place to extract the `x-primarie-id` header and set it as a session variable for RLS policies.

The secondary concerns (webhook HMAC verification, Sentry removal, structured logging, CSRF, search_path fixes) are all well-established patterns with clear implementation paths. The main risk is the atomic RLS migration -- all policies must be rewritten simultaneously because the old `current_user_primarie()` function returns a single UUID from `utilizatori.primarie_id`, which becomes meaningless once users can belong to multiple primarii.

**Primary recommendation:** Implement the junction table and `db_pre_request` function first as a single atomic migration, then layer on middleware context injection, then handle logging/CSRF/webhooks as independent workstreams.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Junction table stores full profile per primarie association: user_id, primarie_id, rol, status, department, permissions (jsonb), registration date, approved_by, approval_date
- Existing `primarie_id` column on `utilizatori` stays as the user's default/home primarie; junction table tracks all associations
- ALL users (including citizens) appear in the junction table -- one row per primarie where they're registered
- Status values: pending, approved, rejected, suspended (four states for registration flow and moderation)
- Active primarie context extracted from URL params (`/app/[judet]/[localitate]/`) -- existing routing pattern kept
- Middleware resolves the URL to a primarie_id and sets `x-primarie-id` header for `db_pre_request` function
- RLS policies rewritten to use per-request context (from `db_pre_request`) instead of static JWT metadata
- RLS migration done all at once in a single atomic migration -- not incremental per table group
- Defense in depth: middleware validates user's junction table association (approved status required) BEFORE hitting the database; RLS is the final safety net
- Users visiting a primarie they're NOT registered at: show public primarie info only (name, address, services), block access to cereri, plati, dashboard
- Payment webhook HMAC-SHA256 verification on every request + timestamp-based replay protection (reject webhooks older than 5 minutes)
- No IP whitelisting for now -- Ghiseul IPs may change; add later when integrating production gateway
- Consolidate two webhook endpoints (`/api/plati/webhook` and `/api/webhooks/ghiseul`) into single `/api/webhooks/ghiseul`
- CSRF protection enforced via middleware on all POST/PUT/DELETE/PATCH routes automatically; routes opt-out explicitly (e.g., webhook endpoint)
- Rate limiting on auth endpoints only (login, registration, password reset); other endpoints deferred to Phase 2
- All verification failures logged as structured security events
- Logger utility with log levels: debug/info suppressed in production, error always goes to Better Stack
- Development keeps console output through the logger utility
- Sentry fully removed in this phase -- clean break, replaced entirely with Better Stack
- 488 console.log instances cleaned via automated sweep + manual review for meaningful logs
- Dedicated structured logging for security events: auth events, RLS access denials, webhook verification, role/permission changes

### Claude's Discretion
- Exact junction table column types and constraints
- db_pre_request function implementation details
- Logger utility API design and Better Stack integration approach
- search_path fix strategy for 22 database functions (SEC-04)
- CSRF token generation and validation mechanism
- Rate limiting implementation (in-memory, Redis, or Edge middleware)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEC-01 | Multi-primarie data isolation works correctly | Junction table + db_pre_request + rewritten RLS policies; middleware sets x-primarie-id header per request |
| SEC-02 | User can be registered at multiple primarii with different roles | user_primarii junction table with per-association role, status, permissions columns |
| SEC-03 | RLS policies use per-request primarie context | db_pre_request reads x-primarie-id from request.headers, sets via set_config(); RLS uses current_setting() |
| SEC-04 | All 22 database functions have explicit search_path | ALTER FUNCTION ... SET search_path = '' on each; Supabase Security Advisor lint 0011 |
| SEC-05 | Payment webhook HMAC-SHA256 verification | Node.js crypto.createHmac + crypto.timingSafeEqual; timestamp-based replay protection |
| SEC-06 | Zero console.log in production; structured logging | @logtail/next v0.3.1 for Better Stack; custom logger utility wrapping it |
| SEC-07 | CSRF protection on all state-changing routes | @edge-csrf/nextjs for API routes; Server Actions have built-in Origin header checking |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/ssr | ^0.7.0 (already installed) | Server-side Supabase client with cookie handling | Official Supabase SSR package; supports `global.headers` for passing x-primarie-id |
| @supabase/supabase-js | ^2.75.1 (already installed) | Supabase client library | Already in use; provides typed DB access |
| @logtail/next | ^0.3.1 | Better Stack structured logging for Next.js | Official Better Stack Next.js integration; supports App Router, server/client components, route handlers |
| @edge-csrf/nextjs | ^2.x | CSRF protection via middleware | Runs on Edge Runtime; signed double-submit cookie pattern; works with Next.js 13-15 |
| Node.js crypto (built-in) | N/A | HMAC-SHA256 webhook verification | Built into Node.js; no external dependency needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PostgreSQL current_setting() | Built-in | Access request headers in SQL | In db_pre_request and RLS policies to read x-primarie-id |
| PostgreSQL set_config() | Built-in | Set session-level variables | In db_pre_request to make primarie_id available to RLS |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @edge-csrf/nextjs | next-csrf (nartix) | next-csrf is newer, less proven; edge-csrf has wider adoption |
| @logtail/next | pino + pino-transport | More flexible but requires manual Next.js integration; @logtail/next is zero-config for Better Stack |
| In-memory rate limiter | Upstash Redis (@upstash/ratelimit) | Redis needed for multi-instance; in-memory fine for single Vercel function instance in Phase 1 |

**Installation:**
```bash
pnpm add @logtail/next @edge-csrf/nextjs
pnpm remove @sentry/nextjs
```

## Architecture Patterns

### Recommended Changes to Project Structure
```
src/
├── lib/
│   ├── logger.ts                    # NEW: Logger utility wrapping @logtail/next
│   ├── supabase/
│   │   ├── server.ts                # MODIFY: Accept x-primarie-id in global.headers
│   │   ├── client.ts                # MODIFY: Accept x-primarie-id in global.headers
│   │   └── middleware.ts            # MODIFY: Return primarie context alongside session
│   ├── auth/
│   │   └── authorization.ts         # MODIFY: Replace Sentry with logger; add multi-primarie checks
│   ├── middleware/
│   │   └── rate-limit.ts            # MODIFY: Replace Sentry with logger
│   ├── security/
│   │   └── csrf.ts                  # NEW: CSRF middleware configuration
│   └── payments/
│       └── ghiseul-client.ts        # MODIFY: Implement real HMAC verification
├── middleware.ts                     # MODIFY: Add primarie context resolution, CSRF, x-primarie-id header
supabase/
└── migrations/
    ├── YYYYMMDD_create_user_primarii.sql       # NEW: Junction table + db_pre_request
    └── YYYYMMDD_rewrite_rls_policies.sql       # NEW: All RLS policies rewritten atomically
```

### Pattern 1: Per-Request Primarie Context via db_pre_request
**What:** A PostgreSQL function that runs before every PostgREST API request, reading the `x-primarie-id` header and setting it as a session variable accessible by RLS policies.
**When to use:** Every request that touches RLS-protected tables.
**Confidence:** HIGH (verified via Supabase official docs and Context7)

```sql
-- Source: https://supabase.com/docs/guides/api/securing-your-api
-- db_pre_request function that extracts primarie context from request headers
CREATE OR REPLACE FUNCTION public.set_request_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  primarie_id text;
  user_id uuid;
BEGIN
  -- Extract primarie_id from custom header set by middleware
  primarie_id := current_setting('request.headers', true)::json->>'x-primarie-id';

  -- Extract user_id from JWT
  user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;

  -- Set as session-level config variables accessible by RLS policies
  PERFORM set_config('app.current_primarie_id', COALESCE(primarie_id, ''), true);
  PERFORM set_config('app.current_user_id', COALESCE(user_id::text, ''), true);
END;
$$;

-- Register as db_pre_request hook
ALTER ROLE authenticator SET pgrst.db_pre_request = 'public.set_request_context';
NOTIFY pgrst, 'reload config';
```

### Pattern 2: Middleware Primarie Resolution
**What:** Next.js middleware resolves URL params to primarie_id and sets `x-primarie-id` request header before Supabase client is created.
**When to use:** Every request to `/app/[judet]/[localitate]/**` routes.
**Confidence:** HIGH (verified via Next.js official docs and Context7)

```typescript
// Source: https://github.com/vercel/next.js (proxy middleware docs)
// In middleware.ts - set x-primarie-id header on request
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Extract judet/localitate from URL
  const match = request.nextUrl.pathname.match(/^\/app\/([^/]+)\/([^/]+)/);
  if (match) {
    const [, judetSlug, localitateSlug] = match;
    // Resolve to primarie_id (query or cache lookup)
    const primarieId = await resolvePrimarieId(judetSlug, localitateSlug);
    if (primarieId) {
      requestHeaders.set('x-primarie-id', primarieId);
    }
  }

  // Forward modified headers upstream (not exposed to client)
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
```

### Pattern 3: Supabase Client with Per-Request Headers
**What:** Modify server-side Supabase client factory to accept and forward `x-primarie-id` header.
**When to use:** Every server component, server action, and API route that creates a Supabase client.
**Confidence:** HIGH (verified in @supabase/ssr source code -- `createServerClient` line 159 spreads `options.global.headers`)

```typescript
// In src/lib/supabase/server.ts
import { headers } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const primarieId = headersList.get('x-primarie-id');

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          ...(primarieId ? { 'x-primarie-id': primarieId } : {}),
        },
      },
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Server Component - handled by middleware */ }
        },
      },
    }
  );
}
```

### Pattern 4: RLS Policies Using Per-Request Context
**What:** RLS policies read primarie_id from session config set by db_pre_request instead of querying utilizatori table.
**When to use:** All multi-tenant RLS policies.
**Confidence:** HIGH

```sql
-- NEW helper function replacing current_user_primarie()
CREATE OR REPLACE FUNCTION public.get_request_primarie_id()
RETURNS UUID
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(current_setting('app.current_primarie_id', true), '')::uuid;
$$;

-- Example: Rewritten cereri RLS policy
CREATE POLICY cereri_functionar_v2 ON cereri
  FOR ALL
  USING (
    primarie_id = public.get_request_primarie_id()
    AND EXISTS (
      SELECT 1 FROM public.user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = public.get_request_primarie_id()
        AND up.status = 'approved'
        AND up.rol IN ('functionar', 'admin')
    )
  );
```

### Pattern 5: Logger Utility
**What:** Centralized logger wrapping @logtail/next with environment-aware output and structured fields.
**When to use:** Replace every console.log/warn/error in the codebase.
**Confidence:** MEDIUM (based on @logtail/next docs; exact API may require adjustment)

```typescript
// src/lib/logger.ts
import { Logger as LogtailLogger } from '@logtail/next';

const betterStackToken = process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

// Create Logtail logger instance (only sends to Better Stack when token present)
const logtailLogger = betterStackToken ? new LogtailLogger() : null;

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (!isProduction) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
    // debug never sent to Better Stack
  },

  info(message: string, context?: Record<string, unknown>): void {
    if (!isProduction) {
      console.info(`[INFO] ${message}`, context || '');
    }
    // info not sent to Better Stack in production (noise)
  },

  warn(message: string, context?: Record<string, unknown>): void {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    logtailLogger?.warn(message, context);
  },

  error(message: string, context?: Record<string, unknown>): void {
    if (!isProduction) {
      console.error(`[ERROR] ${message}`, context || '');
    }
    logtailLogger?.error(message, context);
  },

  security(event: SecurityEvent): void {
    const message = `[Security] ${event.type}:${event.action}`;
    const context = {
      type: event.type,
      action: event.action,
      userId: event.userId || 'anonymous',
      success: event.success,
      ...event.metadata,
    };

    if (!isProduction) {
      const logFn = event.success ? console.info : console.warn;
      logFn(message, context);
    }
    // Security events ALWAYS go to Better Stack
    logtailLogger?.warn(message, context);
  },

  async flush(): Promise<void> {
    await logtailLogger?.flush();
  },
};
```

### Anti-Patterns to Avoid
- **Querying utilizatori for role in every RLS check:** Use the junction table `user_primarii` which already has the role per association. Do NOT join to `utilizatori.rol` which is the legacy single-primarie role.
- **Setting x-primarie-id on the client side:** The header MUST be set by middleware (server-side). If the client could set it, a malicious user could access any primarie's data.
- **Using db_pre_request alone without middleware validation:** The `db_pre_request` hook only applies to PostgREST Data API. It does NOT apply to Realtime, Storage, or direct database connections. Middleware must validate the user's association before the request reaches the database.
- **Incremental RLS migration (table by table):** Creates a window where some tables use old policies and some use new, causing data access inconsistencies. Must be atomic.
- **Using `any` type for junction table queries:** Always type the junction table response with a proper interface.
- **Using `current_setting('request.headers')` in Storage SELECT policies:** This is a confirmed Supabase bug (#29908). Storage SELECT policies silently fail to read custom headers. Use `auth.uid()` + `storage.foldername()` + subquery to `user_primarii` instead.
- **Caching primarie_id lookups in an in-memory Map in middleware:** Edge Runtime does not guarantee module-level state persistence between requests. Use a direct query or Vercel Edge Config.
- **Using `logRequestDetails` option in @logtail/next middleware:** Known issue (#34) causes problems. Create a `Logger` instance manually in middleware instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSRF token generation/validation | Custom token logic | @edge-csrf/nextjs | Timing attacks, token rotation, signed double-submit cookie pattern |
| HMAC signature comparison | String equality (`===`) | crypto.timingSafeEqual() | Vulnerable to timing attacks; built-in constant-time comparison is essential |
| Structured log transport | Custom HTTP log shipper | @logtail/next | Handles batching, retry, flush, server/client/edge contexts |
| Rate limiting algorithm | Custom sliding window | Existing `src/lib/rate-limiter.ts` | Already implemented with cleanup, tiers, and middleware wrapper |
| Search path hardening | Manual ALTER per function | Scripted migration with list of all 22 functions | Manual is error-prone; script ensures completeness |

**Key insight:** Security primitives (HMAC comparison, CSRF tokens, rate limiting) are exactly the things that look simple but have subtle vulnerabilities when hand-rolled. Use battle-tested implementations.

## Common Pitfalls

### Pitfall 1: db_pre_request Only Works for PostgREST Data API
**What goes wrong:** Developer assumes db_pre_request runs for all Supabase operations including Realtime subscriptions and Storage file access. It does not.
**Why it happens:** Supabase documentation mentions db_pre_request prominently but the limitation is easy to miss.
**How to avoid:** For Storage and Realtime, rely on RLS policies that call `current_setting('app.current_primarie_id', true)` directly. For Storage, the header is not forwarded -- Storage RLS must use auth.uid() and join to user_primarii table directly.
**Warning signs:** Users seeing files from other primarii; Realtime subscriptions leaking data across tenants.
**Source:** https://supabase.com/docs/guides/api/securing-your-api

### Pitfall 2: Connection Pooling and set_config Scope
**What goes wrong:** `set_config()` with `is_local = true` sets variables for the current transaction only. With Supabase's Supavisor connection pooler in transaction mode, each query is its own transaction, so the variable set in `db_pre_request` is correctly scoped.
**Why it happens:** Confusion between session-level (`is_local = false`) and transaction-level (`is_local = true`) config.
**How to avoid:** Always use `is_local = true` (the third parameter to `set_config()`). This ensures variables are scoped to the current transaction and cleaned up automatically. This is the correct behavior for Supavisor transaction mode.
**Warning signs:** Cross-request data leaks; user A seeing user B's data.
**Source:** PostgreSQL docs on set_config; Supabase Supavisor docs

### Pitfall 3: Atomic Migration Rollback
**What goes wrong:** A partially-applied migration leaves the database in an inconsistent state where some tables use old RLS policies and some use new.
**Why it happens:** Migration file is too large and fails mid-execution; or developer applies changes incrementally.
**How to avoid:** Wrap the entire migration in a single `BEGIN; ... COMMIT;` transaction. Test on a Supabase branch first. Have a complete rollback script ready.
**Warning signs:** Different tables returning different data for the same user; 403 errors on some endpoints but not others.

### Pitfall 4: Forgetting to Handle NULL primarie_id
**What goes wrong:** When a user visits a public page (landing, auth) there is no primarie context. The `x-primarie-id` header is absent. `current_setting('app.current_primarie_id', true)` returns empty string. RLS policies that cast this to UUID fail.
**Why it happens:** Not all routes have a primarie context.
**How to avoid:** Use `NULLIF(current_setting('app.current_primarie_id', true), '')::uuid` which returns NULL for empty strings. RLS policies must handle NULL primarie_id gracefully (e.g., deny access when NULL for protected tables, allow for public tables).
**Warning signs:** 500 errors on landing page; auth pages broken; "invalid input syntax for type uuid" errors.

### Pitfall 5: search_path Fix Breaking Function Inlining
**What goes wrong:** Adding `SET search_path = ''` to a function prevents PostgreSQL from inlining it, causing performance degradation for functions used in RLS policies.
**Why it happens:** PostgreSQL cannot inline functions that have a `SET` clause. This is a known PostgreSQL limitation.
**How to avoid:** For hot-path functions used in RLS policies (like `get_request_primarie_id()`), use `LANGUAGE sql` (not plpgsql) and mark as `STABLE`. Qualify all object references with schema name (`public.user_primarii` instead of `user_primarii`). For trigger functions and rarely-called functions, the inlining loss is acceptable.
**Warning signs:** Slow queries after applying search_path fixes; increased database CPU.
**Source:** https://github.com/supabase/supabase/issues/33131

### Pitfall 6: CSRF Protection Blocking Webhooks
**What goes wrong:** CSRF middleware rejects legitimate webhook POST requests from Ghiseul.ro payment gateway because they don't carry a CSRF token.
**Why it happens:** CSRF middleware is applied globally to all POST requests.
**How to avoid:** Explicitly exclude webhook routes from CSRF protection in middleware configuration. Use path matching to skip `/api/webhooks/*` routes.
**Warning signs:** Payment webhooks returning 403; payments stuck in "processing" state.

### Pitfall 7: Storage SELECT RLS Cannot Read Custom Request Headers
**What goes wrong:** Storage RLS SELECT policies that use `current_setting('request.headers', true)` to read `x-primarie-id` silently fail, returning no rows. INSERT policies work fine with the same header, creating a confusing inconsistency.
**Why it happens:** Confirmed bug in Supabase Storage (GitHub issue #29908). The Storage service does not properly pass custom request headers to the policy evaluation engine for SELECT operations, unlike INSERT operations or the Data API.
**How to avoid:** Never use `current_setting('request.headers')` in Storage SELECT policies. Use `auth.uid()` + subquery to `user_primarii` + `storage.foldername()` to extract primarie_id from the file path instead.
**Warning signs:** File downloads returning 403 or empty results despite correct custom headers; INSERT (upload) working but SELECT (download) failing.
**Source:** https://github.com/supabase/supabase/issues/29908

### Pitfall 8: In-Memory Cache in Edge Middleware Does Not Persist
**What goes wrong:** Developer creates a module-level `Map` in middleware.ts to cache primarie_id lookups, expecting it to survive between requests. The cache provides no benefit because Edge Runtime isolates do not guarantee state persistence between invocations.
**Why it happens:** Edge Runtime runs on V8 isolates. While a warm isolate _might_ reuse memory, this behavior is undocumented and unreliable. Vercel explicitly recommends external stores (Edge Config, KV) for persistent data.
**How to avoid:** Use a direct database query per request for the primarie_id lookup. The query is fast enough (<5ms for ~100 rows). If performance becomes an issue, use Vercel Edge Config, not an in-memory Map.
**Warning signs:** Cache hit rate near 0% in production; inconsistent middleware behavior between regions.
**Source:** https://vercel.com/docs/functions/runtimes/edge, https://github.com/vercel/next.js/discussions/50577

### Pitfall 9: Sentry Removal Leaving Dead Imports
**What goes wrong:** After removing `@sentry/nextjs`, build fails because files still import from `@sentry/nextjs`.

**Why it happens:** 12 files import Sentry directly; `next.config.ts` wraps with `withSentryConfig`; `instrumentation.ts` imports Sentry configs.
**How to avoid:** Systematic removal: search all files for `sentry` imports, update `next.config.ts` to remove `withSentryConfig` wrapper, delete `sentry.server.config.ts`, `sentry.edge.config.ts`, update `instrumentation.ts`, update CSP headers to remove `sentry.io` domains.
**Warning signs:** Build errors; runtime errors from missing modules.

## Code Examples

### HMAC-SHA256 Webhook Verification with Replay Protection
```typescript
// Source: Node.js crypto docs + https://hookdeck.com/webhooks/guides
import crypto from 'crypto';

interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string,
  maxAgeSeconds: number = 300 // 5 minutes
): WebhookVerificationResult {
  // 1. Replay protection: check timestamp freshness
  const webhookTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);

  if (isNaN(webhookTime) || Math.abs(now - webhookTime) > maxAgeSeconds) {
    return { valid: false, reason: 'Webhook timestamp expired or invalid' };
  }

  // 2. Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // 3. Timing-safe comparison (prevents timing attacks)
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return { valid: false, reason: 'Signature length mismatch' };
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  return { valid: isValid, reason: isValid ? undefined : 'Invalid signature' };
}
```

### CSRF Middleware with Route Exclusion
```typescript
// src/middleware.ts (CSRF integration)
// Source: @edge-csrf/nextjs README
import { createCsrfProtect, CsrfError } from '@edge-csrf/nextjs';

const csrfProtect = createCsrfProtect({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
});

export async function middleware(request: NextRequest) {
  // Skip CSRF for webhook endpoints
  const isWebhookRoute = request.nextUrl.pathname.startsWith('/api/webhooks/');
  // Skip CSRF for non-mutating methods
  const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);

  if (!isWebhookRoute && !isSafeMethod) {
    try {
      await csrfProtect(request, response);
    } catch (err) {
      if (err instanceof CsrfError) {
        return NextResponse.json(
          { error: 'CSRF validation failed' },
          { status: 403 }
        );
      }
      throw err;
    }
  }

  // ... rest of middleware
}
```

### Junction Table Schema
```sql
-- user_primarii junction table
CREATE TABLE public.user_primarii (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primarie_id UUID NOT NULL REFERENCES public.primarii(id) ON DELETE CASCADE,

  -- Role and permissions for THIS association
  rol VARCHAR(50) NOT NULL DEFAULT 'cetatean'
    CHECK (rol IN ('cetatean', 'functionar', 'admin', 'primar')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  permissions JSONB DEFAULT '[]'::jsonb,
  departament VARCHAR(100),

  -- Approval workflow
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one role per user per primarie
  UNIQUE(user_id, primarie_id)
);

-- Indexes for performance
CREATE INDEX idx_user_primarii_user ON user_primarii(user_id) WHERE status = 'approved';
CREATE INDEX idx_user_primarii_primarie ON user_primarii(primarie_id) WHERE status = 'approved';
CREATE INDEX idx_user_primarii_status ON user_primarii(status);
CREATE INDEX idx_user_primarii_rol ON user_primarii(primarie_id, rol) WHERE status = 'approved';

-- Enable RLS
ALTER TABLE user_primarii ENABLE ROW LEVEL SECURITY;
```

### search_path Fix Pattern
```sql
-- Pattern for fixing all 22 functions
-- Source: https://supabase.com/docs/guides/database/database-advisors
ALTER FUNCTION public.current_user_role() SET search_path = '';
ALTER FUNCTION public.current_user_primarie() SET search_path = '';
ALTER FUNCTION public.generate_numar_inregistrare() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.log_audit() SET search_path = '';
ALTER FUNCTION public.validate_cerere_status_transition() SET search_path = '';
ALTER FUNCTION public.refresh_public_stats() SET search_path = '';
-- ... and all remaining functions

-- IMPORTANT: After setting search_path = '', ALL table/function references
-- inside the function body must be fully qualified with schema name:
-- BAD:  SELECT rol FROM utilizatori WHERE id = auth.uid();
-- GOOD: SELECT rol FROM public.utilizatori WHERE id = auth.uid();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JWT custom claims for tenant ID | Per-request headers via db_pre_request | PostgREST 9+ (2021) | Dynamic context without JWT refresh; supports multi-tenant |
| Sentry for Next.js error tracking | Better Stack (@logtail/next) | 2024-2025 | Unified logging + uptime; lighter integration |
| Manual CSRF tokens | @edge-csrf/nextjs (edge runtime) | 2023+ | Runs in middleware at edge; zero-config |
| PgBouncer for connection pooling | Supavisor (Supabase native) | Feb 2025 | Session mode deprecated on port 6543; transaction mode default |
| current_user_primarie() from JWT | get_request_primarie_id() from request context | This migration | Supports multi-primarie per user |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs` (^0.10.0 currently installed): Deprecated in favor of `@supabase/ssr`. Should be removed.
- `@sentry/nextjs` (^10.21.0 currently installed): Being replaced by @logtail/next per project decision.
- `current_user_primarie()` SQL function: Returns single UUID from utilizatori.primarie_id. Will be replaced by `get_request_primarie_id()` reading from request context.

## Open Questions Resolved

All four open questions from the initial research have been investigated and resolved (2026-03-02).

### 1. RESOLVED: Primarie ID Resolution Caching in Middleware
**Confidence:** HIGH
**Verdict:** Use a direct Supabase query per request. Do NOT use an in-memory Map cache.

**Findings:**
- **Vercel Edge Runtime does NOT reliably persist global variables between requests.** The Edge Runtime is built on V8 isolates. While module-level variables _may_ survive between warm invocations on the same isolate, this behavior is explicitly undocumented and unreliable. Vercel's own docs recommend Edge Config or external KV stores for persistent caching, not in-memory Maps.
- **`unstable_cache` is NOT available in middleware context.** React's `cache()` and Next.js `unstable_cache` only work inside the React rendering pipeline (Server Components, Route Handlers). Middleware runs in a separate execution context where these APIs do not function. GitHub issue [#48169](https://github.com/vercel/next.js/issues/48169) confirms this limitation. `unstable_cache` is also deprecated in favor of `use cache` in Next.js 16.
- **Vercel now recommends migrating FROM Edge Runtime to Node.js runtime** for improved performance and reliability, as both runtimes run on Fluid Compute with Active CPU pricing. However, Next.js middleware is still forced to Edge Runtime.
- **Performance of a direct Supabase query in middleware is acceptable.** The `primarii` table has ~100 rows max. A simple `SELECT id FROM primarii WHERE judet_slug = $1 AND localitate_slug = $2` query on a well-indexed table takes <5ms from Vercel Frankfurt to Supabase Frankfurt. Middleware has a 25-second execution limit, so this is negligible.
- **If performance becomes an issue later**, use Vercel Edge Config (a global read-optimized data store, <1ms reads) to store the slug-to-primarie_id mapping. This is the Vercel-endorsed pattern for small lookup tables in middleware. Do NOT use an in-memory Map.

**Recommendation:** Use a direct Supabase query with the service role client in middleware. Index the `primarii` table on `(judet_slug, localitate_slug)`. If future profiling reveals middleware latency issues, migrate the lookup to Vercel Edge Config.

**Sources:**
- Vercel Edge Runtime docs (warning to migrate to Node.js): https://vercel.com/docs/functions/runtimes/edge
- Next.js middleware caching issue #48169: https://github.com/vercel/next.js/issues/48169
- Next.js middleware caching discussion #50577: https://github.com/vercel/next.js/discussions/50577
- Vercel Edge Config: https://vercel.com/docs/edge-config

### 2. RESOLVED: Storage Bucket RLS Without db_pre_request
**Confidence:** HIGH
**Verdict:** Storage RLS CAN join to custom tables. Use `auth.uid()` + subquery to `user_primarii` + `storage.foldername()` for path-based tenant isolation. Do NOT use `current_setting('request.headers')` in Storage SELECT policies.

**Findings:**
- **Storage RLS policies CAN use `auth.uid()` reliably.** This is the standard way to identify the user in storage policies. It returns the authenticated user's UUID from the JWT.
- **Storage RLS policies CANNOT reliably use `current_setting('request.headers')` for SELECT operations.** GitHub issue [#29908](https://github.com/supabase/supabase/issues/29908) documents a confirmed bug: SELECT policies on `storage.objects` fail to read custom request headers, even though INSERT policies can. The workaround is to use signed URLs (bypasses RLS) or avoid header-based checks in storage SELECT policies.
- **Storage RLS policies CAN JOIN/subquery to custom tables.** Supabase's own troubleshooting documentation explicitly states: _"Implement RLS policies on `storage.objects` that `JOIN` with your custom metadata table to enforce hierarchical access permissions."_ A GitHub discussion [#31073](https://github.com/orgs/supabase/discussions/31073) confirms this works but warns about column name ambiguity -- always use `storage.objects.name` (fully qualified) when referencing the storage object name.
- **`storage.foldername(name)` returns an array of folder path segments.** For path `documents/primarie-id/user-id/file.pdf`, `(storage.foldername(name))[1]` returns `'documents'`, `[2]` returns the primarie_id, `[3]` returns the user_id. `storage.filename(name)` returns `'file.pdf'`. `storage.extension(name)` returns `'pdf'`.
- **Bucket path convention `documents/{primarie_id}/{user_id}/filename.pdf` works.** Supabase Storage treats folders as key prefixes, not real directories. Any path structure works as long as RLS policies correctly parse it with `storage.foldername()`.

**Recommended Storage RLS pattern for multi-tenant:**
```sql
-- Allow users to read their own documents within their primarie
CREATE POLICY "Users read own primarie documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(storage.objects.name))[1]::uuid IN (
    SELECT up.primarie_id FROM public.user_primarii up
    WHERE up.user_id = auth.uid()
      AND up.status = 'approved'
  )
  AND (storage.foldername(storage.objects.name))[2] = auth.uid()::text
);

-- Allow users to upload to their own folder within their primarie
CREATE POLICY "Users upload to own primarie folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(storage.objects.name))[1]::uuid IN (
    SELECT up.primarie_id FROM public.user_primarii up
    WHERE up.user_id = auth.uid()
      AND up.status = 'approved'
  )
  AND (storage.foldername(storage.objects.name))[2] = auth.uid()::text
);

-- Allow functionar/admin to read all documents in their primarie
CREATE POLICY "Staff read all primarie documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(storage.objects.name))[1]::uuid IN (
    SELECT up.primarie_id FROM public.user_primarii up
    WHERE up.user_id = auth.uid()
      AND up.status = 'approved'
      AND up.rol IN ('functionar', 'admin', 'primar')
  )
);
```

**Important:** Always qualify `storage.objects.name` when the RLS policy subquery might introduce a column name collision (e.g., another table also has a `name` column).

**Sources:**
- Supabase Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Storage Helper Functions: https://supabase.com/docs/guides/storage/schema/helper-functions
- Storage RLS + custom table JOIN troubleshooting: https://supabase.com/docs/guides/troubleshooting/supabase-storage-inefficient-folder-operations-and-hierarchical-rls-challenges-b05a4d
- Storage SELECT RLS custom header bug: https://github.com/supabase/supabase/issues/29908
- Storage RLS folder restriction discussion: https://github.com/orgs/supabase/discussions/31073

### 3. RESOLVED: @logtail/next Compatibility with Next.js 15.5.9
**Confidence:** HIGH
**Verdict:** @logtail/next v0.3.1 is fully compatible with Next.js 15.5.9. Use it as the primary logging library.

**Findings:**
- **@logtail/next v0.3.1 (released Jan 12, 2026) has a peer dependency of `next: >=15.0`.** This was verified directly from the package.json in the GitHub repo. Next.js 15.5.9 satisfies this requirement. React peer dependency is `>=18.0.0`, also satisfied.
- **No Next.js 15 compatibility issues found in GitHub issues.** The repo has only 4 open issues; none relate to Next.js 15 compatibility. Issue #34 (`logRequestDetails` causes issues in middleware) and #20 (how to use in middleware) are about middleware integration, not compatibility.
- **@logtail/next provides the following API surface** (verified from Better Stack docs):
  - `Logger` class: `new Logger()` with `.info()`, `.debug()`, `.warn()`, `.error()`, `.with()` (context enrichment), `.flush()`
  - `withBetterStack(config)`: Wrapper for `next.config.ts` -- replaces `withSentryConfig` (clean swap)
  - `Logger.middleware()`: Static method for middleware integration (captures request details)
  - `useLogger()` hook: For client components
  - `BetterStackWebVitals` component: For Web Vitals tracking in layout
- **@logtail/next vs @logtail/node:** `@logtail/next` is a superset -- it includes everything from `@logtail/node` plus Next.js-specific integrations (`withBetterStack`, `Logger.middleware()`, `useLogger` hook, `BetterStackWebVitals`). No need to install `@logtail/node` separately.
- **Setup requires two env vars:** `NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN` and `NEXT_PUBLIC_BETTER_STACK_INGESTING_URL`.
- **Middleware integration note:** Issue #34 reports that `logRequestDetails` option in middleware causes problems. Use the `Logger` class directly in middleware rather than the auto-logging feature.
- **`withBetterStack` replaces `withSentryConfig` directly** in `next.config.ts`. Since Sentry is being removed in this phase, this is a clean swap with no conflict.

**Recommendation:** Install `@logtail/next@0.3.1`. Wrap `next.config.ts` with `withBetterStack()` after removing `withSentryConfig`. Use the `Logger` class for the custom logger utility. Avoid `logRequestDetails` in middleware -- create a manual `Logger` instance instead.

**Sources:**
- @logtail/next package.json (peer deps): https://github.com/logtail/logtail-nextjs (raw package.json confirmed `next: >=15.0`)
- Better Stack Next.js docs: https://betterstack.com/docs/logs/javascript/nextjs/
- @logtail/next npm: https://www.npmjs.com/package/@logtail/next
- GitHub issues (4 open, no Next.js 15 issues): https://github.com/logtail/logtail-nextjs/issues

### 4. RESOLVED: Existing User Data Migration to Junction Table
**Confidence:** HIGH
**Verdict:** Combine DDL (create table) and DML (insert from existing data) in a single migration file. PostgreSQL supports transactional DDL, so this is atomic. Auto-approve all existing users. Wrap in explicit BEGIN/COMMIT for clarity.

**Findings:**
- **PostgreSQL fully supports transactional DDL.** Unlike MySQL/Oracle which auto-commit DDL, PostgreSQL allows `CREATE TABLE`, `INSERT INTO`, `ALTER TABLE`, and other DDL/DML statements in the same transaction. If any statement fails, the entire transaction rolls back. This is a PostgreSQL-specific strength confirmed by the PostgreSQL wiki on Transactional DDL.
- **Supabase migrations run as `supabase_admin` (superuser role).** This role has full privileges to create tables, alter schemas, and insert data. The migration has the necessary permissions to create `user_primarii`, insert data from `utilizatori`, and modify RLS policies.
- **Supabase CLI does NOT explicitly document automatic transaction wrapping per migration file.** However, since PostgreSQL supports transactional DDL, you should explicitly wrap the migration in `BEGIN; ... COMMIT;` to guarantee atomicity. If the CLI already wraps in a transaction, the nested `BEGIN` is harmless (PostgreSQL treats it as a savepoint).
- **RLS policies referencing `utilizatori.primarie_id` continue to work during migration.** Since the migration is atomic: the old policies are dropped and new policies are created within the same transaction. There is no window where both old and new policies coexist in a committed state. If the migration fails, the old policies remain intact.
- **Idempotency pattern:** Use `CREATE TABLE IF NOT EXISTS`, `INSERT ... ON CONFLICT DO NOTHING`, and `CREATE OR REPLACE FUNCTION` to make the migration safely re-runnable.
- **Zero-downtime for dev/staging is trivial:** The migration runs in a single transaction. For production, the transaction acquires locks briefly during `ALTER TABLE` / `CREATE POLICY` but releases them on commit. The `primarii` and `utilizatori` tables are small, so lock duration is negligible.

**Recommended migration structure:**
```sql
-- Migration: create_user_primarii_and_migrate_data
BEGIN;

-- 1. Create junction table
CREATE TABLE IF NOT EXISTS public.user_primarii (
  -- ... (schema from Code Examples section)
);

-- 2. Migrate existing data: auto-approve all existing users
INSERT INTO public.user_primarii (user_id, primarie_id, rol, status, created_at, updated_at)
SELECT
  u.id,
  u.primarie_id,
  COALESCE(u.rol, 'cetatean'),
  'approved',
  u.created_at,
  NOW()
FROM public.utilizatori u
WHERE u.primarie_id IS NOT NULL
ON CONFLICT (user_id, primarie_id) DO NOTHING;

-- 3. Create db_pre_request function
CREATE OR REPLACE FUNCTION public.set_request_context()
-- ... (implementation from Architecture Patterns section)

-- 4. Drop old RLS policies and create new ones (atomic)
-- ... (all policy rewrites)

COMMIT;
```

**Key gotchas to avoid:**
- Do NOT separate DDL and DML into separate migration files -- they must be atomic so no request hits the DB in a state where the junction table exists but has no data, or where old RLS policies reference a function that no longer works.
- Do NOT use `TRUNCATE` or `DROP TABLE` for the `utilizatori` table -- the `primarie_id` column stays as the user's default primarie (per locked decision).
- Do use `ON CONFLICT DO NOTHING` for the INSERT to make it safely re-runnable.

**Sources:**
- PostgreSQL Transactional DDL wiki: https://wiki.postgresql.org/wiki/Transactional_DDL_in_PostgreSQL:_A_Competitive_Analysis
- Supabase Database Migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase migration runner (supabase_admin role): https://deepwiki.com/supabase/postgres/10-database-migrations
- PostgreSQL DDL transaction support: https://www.cybertec-postgresql.com/en/transactional-ddls/

## Open Questions

All previously open questions have been resolved. See "Open Questions Resolved" section above.

No new open questions identified.

## Sources

### Primary (HIGH confidence)
- Supabase official docs: Securing your API / db_pre_request -- https://supabase.com/docs/guides/api/securing-your-api
- Supabase official docs: Custom Claims and RBAC -- Context7 `/supabase/supabase`
- Next.js official docs: Middleware request headers -- Context7 `/vercel/next.js`
- @supabase/ssr source code: `createServerClient` line 159 confirms `global.headers` passthrough
- Next.js Security blog: Server Actions CSRF protection -- https://nextjs.org/blog/security-nextjs-server-components-actions
- Supabase Security Advisors: Function search path mutable -- https://supabase.com/docs/guides/database/database-advisors
- Vercel Edge Runtime docs: supported APIs, limitations, no memory persistence guarantee -- https://vercel.com/docs/functions/runtimes/edge
- Supabase Storage Access Control: RLS policies, helper functions, path-based access -- https://supabase.com/docs/guides/storage/security/access-control
- Supabase Storage Helper Functions: foldername(), filename(), extension() signatures -- https://supabase.com/docs/guides/storage/schema/helper-functions
- @logtail/next package.json: peer dependency `next: >=15.0`, verified from GitHub repo source
- PostgreSQL Transactional DDL: DDL+DML in same transaction, atomic rollback -- https://wiki.postgresql.org/wiki/Transactional_DDL_in_PostgreSQL:_A_Competitive_Analysis

### Secondary (MEDIUM confidence)
- @logtail/next docs: Better Stack Next.js client, API surface, setup -- https://betterstack.com/docs/logs/javascript/nextjs/
- @logtail/next GitHub: v0.3.1 released Jan 2026, 4 open issues, no Next.js 15 bugs -- https://github.com/logtail/logtail-nextjs
- @edge-csrf/nextjs: CSRF protection for Next.js 13-15 -- https://github.com/amorey/edge-csrf
- Supabase Supavisor: Session mode deprecation -- https://github.com/supabase/supavisor
- GitHub Discussion #33131: search_path fix preventing inlining -- https://github.com/supabase/supabase/issues/33131
- Supabase Storage RLS custom header bug (SELECT policies): https://github.com/supabase/supabase/issues/29908
- Supabase Storage RLS + custom table JOIN discussion: https://github.com/orgs/supabase/discussions/31073
- Supabase Storage hierarchical RLS troubleshooting: https://supabase.com/docs/guides/troubleshooting/supabase-storage-inefficient-folder-operations-and-hierarchical-rls-challenges-b05a4d
- Supabase migration runner (supabase_admin role, idempotency): https://deepwiki.com/supabase/postgres/10-database-migrations
- Next.js middleware caching limitation (issue #48169): https://github.com/vercel/next.js/issues/48169
- Next.js middleware caching discussion #50577: https://github.com/vercel/next.js/discussions/50577
- Vercel Edge Config (recommended for small lookup tables): https://vercel.com/docs/edge-config

### Tertiary (LOW confidence)
- @edge-csrf/nextjs route exclusion mechanism -- README does not document explicit `exclude` config; requires checking source or using `createCsrfProtect` lower-level API with manual path matching

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified via official docs, Context7, source code, and package.json inspection
- Architecture: HIGH -- db_pre_request + request headers pattern verified; Storage RLS JOIN pattern verified; middleware caching approach verified
- Pitfalls: HIGH -- Connection pooling, search_path inlining, db_pre_request scope, Storage SELECT header bug all verified with official sources
- CSRF: MEDIUM -- @edge-csrf/nextjs works with Next.js 15 per project README, but route exclusion mechanism needs validation during implementation
- Logging: HIGH -- @logtail/next v0.3.1 peer dependency `next: >=15.0` confirmed from package.json source; no compatibility issues in GitHub issues
- Migration: HIGH -- PostgreSQL transactional DDL confirmed; DDL+DML in same transaction is safe; supabase_admin role has necessary privileges

**Research date:** 2026-03-02 (initial), 2026-03-02 (continuation -- open questions resolved)
**Valid until:** 2026-04-02 (30 days -- stable ecosystem, no breaking changes expected)
