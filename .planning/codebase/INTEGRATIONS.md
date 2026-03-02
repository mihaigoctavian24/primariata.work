# External Integrations

**Analysis Date:** 2026-03-02

## APIs & External Services

**Authentication & Identity:**

- Supabase Auth (PostgreSQL-based)
  - Methods: Email + Password, Google OAuth
  - Implementation: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
  - Profile pictures: Google OAuth via `lh3.googleusercontent.com`

**Email Services:**

- SendGrid (via Supabase Edge Function)
  - SDK/Client: Supabase edge function invoke
  - Implementation: `src/lib/email/sendgrid.ts`, `src/lib/email/index.ts`
  - Email types: cerere_submitted, status_changed, cerere_finalizata, payment_completed, payment_failed, welcome, password_reset, weekly_digest
  - Env var: `SENDGRID_API_KEY` (stored in Edge Function environment, not client)
  - Invocation: Service role client → `send-email` edge function

**SMS Services:**

- Twilio
  - SDK/Client: REST API via fetch
  - Implementation: `src/lib/sms/twilio.ts`, `src/lib/sms/index.ts`
  - Rate limiting: 5 SMS per user per 24 hours (tracked in `sms_logs` table)
  - Env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
  - Used for: cerere status notifications

**Digital Signatures:**

- certSIGN (mock implementation)
  - Implementation: `src/lib/signature/signature-service.ts`, mock API endpoints
  - Mock endpoints: `/api/mock-certsign/certificates/validate`, `/api/mock-certsign/documents/sign`
  - Operations tracked: validate_certificate, sign_document, batch_sign, get_certificates, verify_signature
  - Integration monitoring: `src/lib/monitoring/integrations.ts`

**Payment Gateway:**

- Ghișeul.ro (mock + production modes)
  - Client: `src/lib/payments/ghiseul-client.ts`
  - Modes: Mock (for testing), Production (real payments)
  - Mode selection: `GHISEUL_MODE` environment variable
  - Configuration env vars:
    - `GHISEUL_API_URL` - API endpoint
    - `GHISEUL_API_KEY` - Authentication
    - `GHISEUL_WEBHOOK_SECRET` - Webhook signature verification
  - Mock implementation: `src/lib/payments/ghiseul-mock/server.ts`, `src/lib/payments/ghiseul-mock/simulator.ts`
  - Test cards: `src/lib/payments/ghiseul-mock/test-cards.ts`
  - Operations: Create payment, get payment status, webhook processing
  - Webhook endpoint: Receives payment callbacks (mocked in development)

**AI & Analysis:**

- OpenAI (GPT-4o-mini)
  - Client: `src/lib/ai/openai-client.ts`
  - SDK: openai 4.104.0
  - Env var: `OPENAI_API_KEY`
  - Models configured: gpt-4o-mini (all use cases - analysis, insights, summarization)
  - Features:
    - Text analysis: `src/lib/ai/text-analyzer.ts`
    - Demographic analysis: `src/lib/ai/demographic-analyzer.ts`
    - Correlation analysis: `src/lib/ai/correlation-analyzer.ts`
    - Cohort analysis: `src/lib/ai/cohort-analyzer.ts`
    - Feature extraction: `src/lib/ai/feature-extractor.ts`
    - Insight generation: `src/lib/ai/insight-generator.ts`
  - Configuration: Timeout 60s, max retries 3, temperature/tokens tuned by use case
  - Error handling: Rate limits (429), invalid key (401), service errors (500)

**Weather Data:**

- WeatherAPI
  - Endpoint: `https://api.weatherapi.com/v1/current.json`
  - Implementation: `src/components/dashboard/WeatherWidget.tsx`, `src/components/weather/WeatherWidgetMinimal.tsx`
  - Env var: `WEATHERAPI_API_KEY`
  - Used for: Dashboard weather widget with Romanian location support

## Data Storage

**Primary Database:**

- PostgreSQL 15 (Supabase hosted)
  - Tables: cereri, plati, users, sms_logs, notifications, and more
  - Client: @supabase/supabase-js 2.75.1
  - Row Level Security (RLS) enforced per județ + localitate
  - Type generation: `pnpm types:generate` → `src/types/database.types.ts`

**File Storage:**

- Supabase Storage
  - CDN: `https://*.supabase.co` (CORS configured)
  - Client: @supabase/supabase-js
  - Used for: Document uploads, certificate storage, PDF files
  - Security: Image validation in upload components

**Session Storage:**

- HTTP-only Cookies (Supabase auth tokens)
  - Managed by: @supabase/ssr 0.7.0
  - Implementation: `src/lib/supabase/server.ts` (cookie-based session refresh)

## Caching

**Client-Side Caching:**

- React Query 5.90.5 (@tanstack/react-query)
  - Used for: Server state caching, deduplication, background refetching
  - Likely cache expiration: Not explicitly configured in provided files

**No explicit Redis/Memcached caching mentioned.** Edge Function caching may be configured at Supabase level.

## Authentication & Authorization

**Auth Provider:**

- Supabase Auth (custom implementation)
  - Methods: Email/Password + Google OAuth
  - User metadata: Location (județ_id, localitate_id) stored in auth metadata
  - Token refresh: Handled by SSR client with secure cookies
  - JWT validation: Required for all database operations via RLS

**Authorization:**

- Row Level Security (RLS) policies (Supabase)
  - Filtering: Automatic by user's location metadata (județ_id, localitate_id)
  - Implementation: `src/lib/auth/authorization.ts`
  - Role-based dashboards: Admin levels (sistem, județ, localitate)
  - File: `src/app/app/[judet]/[localitate]/admin/page.tsx`, `src/app/admin/primariata/page.tsx`

## Monitoring & Observability

**Error Tracking:**

- Sentry (@sentry/nextjs 10.21.0)
  - DSN: `NEXT_PUBLIC_SENTRY_DSN`
  - Server config: `src/sentry.server.config.ts`
  - Edge config: `src/sentry.edge.config.ts`
  - Features:
    - Error capture with stack traces
    - Session replay (enabled)
    - React component annotation
    - Automatic source map upload on build
    - Tunnel route: `/monitoring` (circumvent ad-blockers)
  - Sampling: 100% (tracesSampleRate: 1)
  - Error filtering: Ignores ENOENT, ENOTFOUND, connection errors
  - Dev behavior: Logs to console, doesn't send to Sentry
  - Integration metrics: `src/lib/monitoring/integrations.ts` (tracks certSIGN, Ghișeul)

**User Analytics:**

- Vercel Analytics (@vercel/analytics 1.5.0)
  - Implementation: `src/app/layout.tsx`
  - Tracks: Page views, user interactions, custom events

**Performance Monitoring:**

- Vercel Speed Insights (@vercel/speed-insights 1.2.0)
  - Implementation: `src/app/layout.tsx`
  - Tracks: Web Vitals (LCP, FID, CLS), Core Web Vitals

**Lighthouse CI:**

- @lhci/cli 0.15.1
  - Commands: `pnpm lhci:collect`, `pnpm lhci:assert`, `pnpm lhci:autorun`
  - Mobile/desktop presets: `pnpm lhci:mobile`, `pnpm lhci:desktop`
  - Configuration expected in `.lhcirc.json`

## CI/CD & Deployment

**Hosting:**

- Vercel (inferred from analytics, speed-insights integration)
- Region: Frankfurt (mentioned in CLAUDE.md)

**CI/CD Pipeline:**

- GitHub Actions (inferred from `.github/workflows` directory)
- Build checks include:
  - TypeScript type checking: `pnpm type-check`
  - Linting: `pnpm lint`
  - Format validation: `pnpm format:check`
  - Unit tests: `pnpm test:ci`
  - E2E tests: `pnpm test:e2e` (Playwright)
  - Full build: `pnpm build`

**Database Migrations:**

- Supabase migrations (managed via Supabase CLI)
- Type generation: `pnpm types:generate` (generates TypeScript types from live schema)

## Environment Configuration

**Required Environment Variables:**

### Supabase (Core)

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key for client-side auth
- `SUPABASE_SERVICE_ROLE_KEY` - Service role (admin operations, server-side only)

### Authentication & OAuth

- Google OAuth configured in Supabase Auth

### Email (SendGrid)

- `SENDGRID_API_KEY` - Stored in Supabase Edge Function environment

### SMS (Twilio)

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### Payments (Ghișeul)

- `GHISEUL_MODE` - "mock" or "production"
- `GHISEUL_API_URL` - Payment gateway URL
- `GHISEUL_API_KEY` - Authentication
- `GHISEUL_WEBHOOK_SECRET` - Webhook signature verification

### AI (OpenAI)

- `OPENAI_API_KEY` - GPT-4o-mini API access

### Weather

- `WEATHERAPI_API_KEY` - Weather data API key

### Error Tracking (Sentry)

- `NEXT_PUBLIC_SENTRY_DSN` - Client-side error reporting
- `SENTRY_ORG` - Sentry organization
- `SENTRY_PROJECT` - Sentry project
- `SENTRY_AUTH_TOKEN` - For source map uploads

### Build & Deployment

- `NODE_ENV` - "development" or "production"
- `CI` - Set to "true" in CI environments

**Secrets Location:**

- `.env.local` (development)
- Vercel Environment Variables (production)
- Supabase Edge Function environment (SendGrid API key)

## Webhooks & Callbacks

**Incoming:**

- Ghișeul Payment Webhooks
  - Endpoint: Not explicitly shown (likely `/api/payments/webhook` or similar)
  - Payload: PaymentCallback with transaction_id, status, amount
  - Verification: Webhook signature validation with `GHISEUL_WEBHOOK_SECRET`
  - Implementation: `src/lib/payments/ghiseul-client.ts` (verifyWebhook method)

- Content Security Policy Violation Reports
  - Endpoint: `src/app/api/csp-violations/route.ts`
  - Receives CSP violation reports from browsers
  - Integrates with Sentry for tracking

**Outgoing:**

- Email notifications via SendGrid (triggered by app, async via edge function)
- SMS notifications via Twilio (triggered by app)
- Potential analytics events to Vercel/Sentry (async)

## Security Integration Points

**CSP (Content Security Policy):**

- Configured in `next.config.ts`
- Whitelists: Supabase (`*.supabase.co`), Sentry (`*.sentry.io`), Google OAuth, WeatherAPI
- Restrictions: Frame-ancestors denied (clickjacking protection), unsafe-inline for styles only

**Rate Limiting:**

- SMS: 5 per user per 24 hours (application-level)
- Middleware implementation: `src/lib/middleware/rate-limit.ts`
- CSRF protection: `src/lib/middleware/csrf-protection.ts`

**Sanitization:**

- HTML sanitization: isomorphic-dompurify 2.35.0
- Implementation: `src/lib/security/sanitize.ts`

## Data Flow Summary

**User Request → Vercel → Next.js Server → Supabase:**

1. Browser makes request to Vercel-hosted app
2. Next.js server creates Supabase client (SSR or Server Action)
3. RLS policies automatically filter data by user's location
4. Response cached in React Query (client) or HTTP headers (server)

**Background Operations:**

1. Email: Server Action/API → Supabase Service Role Client → Edge Function Invoke → SendGrid
2. SMS: Server Action → Supabase Service Role Client → Twilio API
3. Payments: User → Vercel → Ghișeul Checkout → Payment Flow → Webhook → API Route
4. Analytics: Browser → Vercel Analytics, Sentry (async)

---

_Integration audit: 2026-03-02_
