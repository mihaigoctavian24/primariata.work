# Codebase Concerns

**Analysis Date:** 2026-03-02

## Tech Debt

### Incomplete Payment Gateway Integration

**Issue:** Production payment gateway endpoints are incomplete stubs

- Files: `src/lib/payments/ghiseul-client.ts` (lines 157, 197, 231)
- Impact: Cannot process real payments in production; currently restricted to mock mode
- Current state: Methods throw "not implemented" errors or return false for webhook verification
- Fix approach:
  - Implement real Ghișeul.ro API integration when credentials become available
  - Add actual webhook signature verification (HMAC validation)
  - Implement IP whitelist validation for webhook callbacks
  - Set up proper error handling and retry logic for payment operations

### Unimplemented Document Validation

**Issue:** Document upload validation is stubbed out

- Files: `src/app/api/cereri/[id]/submit/route.ts` (line 89)
- Impact: Cereri can be submitted without required documents; business logic gap
- Current state: Comment indicates this will be implemented with document upload feature
- Fix approach:
  - Create document requirement schema per cerere type
  - Validate all required documents present before allowing submission
  - Return descriptive error listing missing documents

### Missing Notification System

**Issue:** Notifications are partially implemented

- Files:
  - `src/app/api/cereri/[id]/submit/route.ts` (line 161)
  - `src/app/api/cereri/[id]/cancel/route.ts` (lines 160-161)
  - `src/app/api/plati/webhook/route.ts` (lines 156, 166)
- Impact: Staff notifications for new cereri, status changes not created
- Current state: Comments indicate future implementation; only SMS to end users sent
- Fix approach:
  - Create database table for internal notifications
  - Implement notification triggers on cerere status changes
  - Create notification dispatch service
  - Build notification UI components for staff dashboards

### PDF Generation Placeholder

**Issue:** PDF generation for receipts (chitante) is stubbed

- Files:
  - `src/app/api/plati/[id]/chitanta/route.ts` (line 86, 104)
  - `src/app/api/plati/webhook/route.ts` (line 156)
  - `src/app/api/webhooks/ghiseul/route.ts` (line 135)
- Impact: Receipts return placeholder URL instead of actual PDF; user experience gap
- Current state: Code stores placeholder path `/storage/chitante/{plata.id}.pdf`
- Fix approach:
  - Use jsPDF or pdf-lib (already in dependencies) to generate proper receipt PDFs
  - Store PDFs in Supabase Storage with correct paths
  - Generate on payment success in webhook handler
  - Return signed URLs for secure access

## Type Safety Gaps

### Any Type Usage

**Issue:** Type assertions with `any` in validation and sanitization code

- Files: `src/lib/validations/common.ts` (lines 5-6, 37-38, 117-163), `src/lib/validations/profile.ts` (lines 37-38)
- Impact: Loss of type safety in critical input validation paths; XSS/injection risks harder to catch
- Current state: DOMPurify lazy loading requires `any` casting
- Fix approach:
  - Create proper TypeScript definitions for dynamic DOMPurify loading
  - Use `unknown` instead of `any` where possible
  - Type the schema factory functions properly with generic constraints

### Unknown Type Casts

**Issue:** Multiple `unknown as` and `as unknown` casts to force types

- Files: `src/app/api/cereri/route.ts` (line 343), `src/app/api/survey/research/__tests__/api.integration.test.ts` (line 1242)
- Impact: Type assertions mask real type mismatches; difficult to debug
- Current state: Used as workaround for strict type checking
- Fix approach:
  - Investigate root cause of type mismatches
  - Properly type Supabase insert responses
  - Use type guards instead of assertions where possible

### Type Casting in Admin Authorization

**Issue:** `super_admin` type handling lacks proper type safety in authorization

- Files: `src/lib/auth/authorization.ts` (lines 22-27)
- Impact: Role-based access control could be bypassed if role types aren't properly validated
- Current state: Enum is defined but casting from database values unchecked
- Fix approach:
  - Add runtime validation/parsing of role values from database
  - Use Zod schema for role validation
  - Add type guards for role checking

## Error Handling Gaps

### Generic Catch Blocks Without Type Narrowing

**Issue:** Many catch blocks log errors without proper type handling

- Files: Multiple API routes (e.g., `src/app/api/cereri/route.ts`, `src/app/api/plati/webhook/route.ts`)
- Impact: Error details may be unstructured; difficult to debug; security risk if error objects leaked
- Current state: `catch (error)` then `console.error("message", error)`
- Fix approach:
  - Type error parameter as `unknown`
  - Add type narrowing to determine error type (Error, ZodError, etc.)
  - Return structured, safe error information to clients
  - Log full error details only in development

### Unhandled Async Operations in SMS Notifications

**Issue:** SMS sending failures don't properly bubble up in critical flows

- Files:
  - `src/app/api/cereri/[id]/submit/route.ts` (lines 142-159)
  - `src/app/api/plati/webhook/route.ts` (lines 197-223)
- Impact: Failed SMS silently ignored; users may not know their cerere/payment was processed
- Current state: "Don't fail request - [process] was successful" approach
- Fix approach:
  - Log SMS failures to monitoring (Sentry)
  - Store SMS delivery status in database
  - Implement retry queue for failed SMS
  - Add user-facing notification when SMS fails

### Missing Request Body Validation on Some Routes

**Issue:** Some API routes don't validate request.json() parsing

- Files: `src/app/api/plati/webhook/route.ts` (line 34)
- Impact: Malformed JSON could crash the route; poor error messages
- Current state: Direct `await request.json()` without try-catch wrapping
- Fix approach:
  - Wrap JSON parsing in try-catch
  - Return 400 Bad Request for invalid JSON
  - Add schema validation before use

## Security Considerations

### Missing Webhook Signature Verification

**Issue:** Webhook endpoints accept unverified callbacks

- Files: `src/app/api/plati/webhook/route.ts` (lines 18-19, 59-60), `src/app/api/webhooks/ghiseul/route.ts` (lines 16, 45)
- Risk: Attacker could forge payment completion notifications; fraudulent payment confirmations
- Current state: Comments indicate Phase 2 implementation (currently skipped)
- Recommendations:
  - Store webhook secret securely in environment variable
  - Validate HMAC signature on every webhook before processing
  - Add IP whitelist for payment gateway IPs
  - Implement webhook signature algorithm matching gateway (likely HMAC-SHA256)
  - Log all webhook validation failures for monitoring

### DOMPurify Client-Side Loading Race Condition

**Issue:** DOMPurify loads asynchronously on client; sanitization might not be ready

- Files: `src/lib/validations/common.ts` (lines 18-22), `src/lib/security/sanitize.ts` (lines 35-40)
- Risk: User input could reach unsanitized if form submitted before DOMPurify loads
- Current state: Lazy async import; null return on server-side fallback to regex
- Recommendations:
  - Ensure DOMPurify is loaded before mounting form components
  - Add loading state to forms that depend on sanitization
  - Use server-side sanitization for critical paths (already done for form validation)
  - Consider using only server-side sanitization to eliminate client-side race condition

### Environment Variable Exposure Risk

**Issue:** Environment variables accessed on client via `NEXT_PUBLIC_` prefix

- Files: `src/middleware.ts` (line 21), multiple route files
- Risk: Supabase anon key in browser; exposed to XSS attacks
- Current state: By design (Supabase anon key intentionally public), but needs RLS enforcement
- Recommendations:
  - Verify RLS policies block all unauthorized data access
  - Monitor for suspicious queries from client
  - Consider implementing API layer instead of direct Supabase access from client
  - Rotate anon key if any unauthorized access detected

### CSRF Protection Inconsistency

**Issue:** Only some state-changing operations validate CSRF tokens

- Files: `src/app/api/cereri/route.ts` (line 235), not consistently used
- Risk: Form submissions could be forged from malicious sites
- Current state: CSRF middleware exists but not required on all mutations
- Recommendations:
  - Make CSRF validation mandatory on all state-changing routes
  - Add middleware that enforces CSRF on POST/PUT/DELETE/PATCH
  - Validate CSRF token presence and correctness before processing

## Performance Bottlenecks

### Large Component Files

**Issue:** Several UI components exceed 600 lines

- Files:
  - `src/components/landing/HeroSection.tsx` (797 lines)
  - `src/components/location/LocationWheelPickerForm.tsx` (660 lines)
  - `src/components/dashboard/ExportDialog.tsx` (608 lines)
  - `src/components/admin/research/CohortComparison.tsx` (586 lines)
- Impact: Difficult to test, maintain, and reason about; bundle bloat; re-renders affect performance
- Current state: Complex UI logic mixed with business logic
- Fix approach:
  - Break into smaller, focused sub-components
  - Extract hooks for stateful logic (useForm, useState patterns)
  - Create composition pattern for nested components
  - Extract pure rendering components

### Type Definitions File Size

**Issue:** `src/types/database.types.ts` is 1,882 lines

- Impact: Large file increases build time and IDE performance impact
- Current state: Generated from Supabase; grows with schema changes
- Fix approach:
  - Generate separate files per table/domain
  - Use barrel imports to maintain API
  - Consider splitting into `src/types/database/` directory
  - Add script to validate types match actual schema

### React Query Configuration Incomplete

**Issue:** Prefetch functions reference non-existent `queryFn`

- Files: `src/lib/react-query.ts` (lines 154-164)
- Impact: Prefetch won't work; queries will suspend instead of pre-loading
- Current state: Placeholder comment "queryFn will be provided when implementing"
- Fix approach:
  - Implement actual query functions for dashboard stats, surveys
  - Bind queryFn to prefetch configuration
  - Create separate hooks file with query implementations

## Fragile Areas

### Location Selection Flow Complexity

**Issue:** Multi-step wheel picker with complex state management

- Files: `src/components/location/LocationWheelPickerForm.tsx` (660 lines)
- Why fragile: Multiple state variables, interaction flags, animation timing, scroll handlers
- Safe modification approach:
  - Test all interaction paths (search, scroll, keyboard)
  - Verify cleanup on unmount (refs, intervals cleared)
  - Validate with missing/empty location data
  - Test on slow networks (visible delays)
- Test coverage: Need integration tests for entire flow
- Risks: Breaking location selection breaks entire app flow

### Multi-Tenant RLS Enforcement

**Issue:** Entire data isolation depends on RLS policies

- Files: Implicit in all Supabase queries; documented in `src/lib/supabase/server.ts`
- Why fragile: If RLS policy misconfigured, could leak data between tenants/users
- Safe modification approach:
  - Never manually filter by location (RLS must handle it)
  - Test RLS with mismatched users/locations
  - Audit RLS policies before schema changes
  - Create test fixtures with multiple tenants
- Test coverage: Integration tests verifying RLS blocks unauthorized access
- Risks: Data breach if RLS bypassed; multi-tenancy assumption broken

### Payment Processing Webhook Flow

**Issue:** Critical business logic in webhook handler

- Files: `src/app/api/plati/webhook/route.ts` (28-253)
- Why fragile: Multiple database updates, external API calls (email, SMS), state transitions
- Safe modification approach:
  - Test with network failures (email/SMS timeouts)
  - Verify transaction state before any updates
  - Test idempotence (webhook replayed multiple times)
  - Validate all email/SMS failures don't fail the webhook
  - Test database constraint violations (duplicate payment, missing cerere)
- Test coverage: Need comprehensive webhook simulation tests
- Risks: Orphaned payments, missing email confirmations, database inconsistency

### Type Validation in Dynamic Form Schema

**Issue:** Schema factory function in `src/lib/validations/cereri.ts` returns dynamic `any` type

- Files: `src/lib/validations/cereri.ts` (line 205-206)
- Why fragile: Complex .refine() chains, optional field handling, HTML sanitization
- Safe modification approach:
  - Test edge cases (empty strings, whitespace-only, very long inputs)
  - Verify sanitization doesn't break valid content
  - Test with special characters (diacritics, emojis)
  - Test min/max length boundaries
- Test coverage: Unit tests for each field type and validation rule
- Risks: User data silently rejected or accepted when shouldn't be

## Test Coverage Gaps

### Missing Unit Tests for Critical Paths

**Issue:** Only 6 test files in src directory

- What's not tested:
  - Authorization functions (`src/lib/auth/authorization.ts`)
  - Sanitization logic edge cases (`src/lib/security/sanitize.ts`)
  - Payment gateway client (`src/lib/payments/ghiseul-client.ts`)
  - All custom hooks
  - Database query builders in API routes
- Files: Most API route files lack corresponding .test files
- Risk: Regressions in auth, security, and payment logic go undetected
- Priority: High (auth/payment are critical)

### Missing E2E Tests for User Workflows

**Issue:** Test files exist but coverage is incomplete

- Files: `e2e/role-based-dashboard.spec.ts` (new, likely incomplete)
- What's not tested:
  - Complete cerere submission flow
  - Payment workflow from initiation through webhook
  - Location selection → auth → dashboard flow
  - Multi-role user interactions
  - Form validation error paths
  - Error recovery and retry flows
- Risk: User-facing bugs discovered in production
- Priority: High (affects all users)

### API Route Error Handling Coverage

**Issue:** Generic `catch (error)` blocks in many routes untested

- Files:
  - `src/app/api/cereri/route.ts`
  - `src/app/api/plati/webhook/route.ts`
  - `src/app/api/cereri/[id]/submit/route.ts`
  - All other API routes
- Risk: Unhandled edge cases (malformed input, database errors, timeout)
- Priority: Medium (affects API reliability)

### Integration Test Gaps for Webhooks

**Issue:** Only mock webhook testing exists

- Files: `src/app/api/survey/research/__tests__/api.integration.test.ts`
- What's not tested:
  - Real webhook payload processing
  - Duplicate webhook delivery (idempotence)
  - Webhook ordering (payment success before SMS)
  - Webhook timeout handling
- Risk: Production payment webhooks fail silently
- Priority: High (affects payment processing)

## Scaling Limits

### Single Mock Payment Gateway Instance

**Issue:** Ghișeul mock server creates new instance per request

- Current capacity: Handles development and testing
- Limit: Would break with real production payment volume
- Scaling path:
  - Implement connection pooling to real Ghișeul API
  - Add caching for payment status queries
  - Implement batch operations for bulk payment queries
  - Add rate limiting and circuit breaker pattern

### Real-Time Survey Dashboard Memory Usage

**Issue:** Survey research dashboard loads full response dataset into memory

- Files: `src/app/admin/survey/research/ResearchTabs.tsx` (858 lines)
- Current capacity: Works for < 10,000 responses
- Limit: Browser crashes with 100,000+ responses; poor performance at 50,000+
- Scaling path:
  - Implement server-side filtering and aggregation
  - Use pagination for response tables
  - Pre-compute analytics server-side
  - Implement streaming updates instead of full dataset refresh

### PDF Export Memory Footprint

**Issue:** PDF generation loads entire dataset before rendering

- Files: `src/lib/export/pdf-exporter.ts` (line 484)
- Current capacity: Handles 1,000 rows per export
- Limit: Memory spikes with 10,000+ rows; PDF generation times out
- Scaling path:
  - Implement streaming/chunked PDF generation
  - Generate on server instead of client
  - Use background job queue for large exports
  - Implement async export with email delivery

## Dependencies at Risk

### Mock CertSign Implementation No Longer Maintained

**Issue:** Mock digital signature service (`src/lib/signature/signature-service.ts`) is incomplete

- Risk: Moving to production CertSign integration will require significant refactoring
- Impact: Digital signature feature blocked until real integration
- Migration plan:
  - Document CertSign API contract in INTEGRATION.md
  - Implement real certificate validation
  - Add PKCS#7 signature verification
  - Migrate mock endpoints to real API with feature flag

### jsPDF/PDF-lib Blob Handling Issue

**Issue:** PDF generation has jsPDF Blob mock issue in tests

- Files: `src/app/api/survey/research/__tests__/api.integration.test.ts` (line 1242)
- Risk: PDF tests fail but production works (fragile test setup)
- Impact: Test suite unreliable for PDF export features
- Fix approach:
  - Use proper jsPDF instance instead of mock
  - Test PDF output format, not just generation
  - Add E2E test for actual PDF download

## Missing Critical Features

### Admin Dashboards are Stubs

**Issue:** Role-specific admin dashboards lack implementation

- Files:
  - `src/components/dashboard/role-dashboards/AdminDashboard.tsx` (line 29: "TODO (M4): Expand with full admin features")
  - `src/components/dashboard/role-dashboards/PrimarDashboard.tsx` (line 28: "TODO (M4): Expand with full primar features")
  - `src/components/dashboard/role-dashboards/FuncționarDashboard.tsx` (line 28: "TODO (M4): Expand with full funcționar features")
- Problem: Admins only see basic info; can't manage primărie, staff, or workflows
- Blocks: Admin workflows, staff management
- Current state: Only CetățeanDashboard has real functionality

### Pending Payment Count Not Tracked

**Issue:** Dashboard shows hardcoded 0 for pending plati

- Files: `src/components/dashboard/role-dashboards/CetățeanDashboard.tsx` (line 382)
- Problem: Users can't see if payment is awaiting action
- Blocks: Payment status visibility
- Fix: Query pending plati count by status

### Download Documents Feature Not Implemented

**Issue:** Button exists but no handler

- Files: `src/app/app/[judet]/[localitate]/cereri/page.tsx` (line 245)
- Problem: Users can't bulk download cerere documents
- Blocks: Document access usability
- Implementation needed: ZIP archive creation, file streaming

## Monitoring & Observability Gaps

### Incomplete Sentry Integration

**Issue:** Error tracking initialized but not comprehensively integrated

- Files:
  - `src/lib/react-query.ts` (lines 62, 88: "TODO: Add error tracking service integration")
  - `src/components/dashboard/ErrorBoundary.tsx` (line 48: "TODO M4: Integrate with Sentry")
- Impact: Many errors not tracked; exception context missing
- Current state: Sentry initialized in layout but not wired to query clients
- Fix approach:
  - Wire React Query errors to Sentry
  - Add Sentry context to all error handlers
  - Implement custom integrations for payment/webhook events
  - Set up Sentry alerts for critical errors

### Excessive Console Logging in Production

**Issue:** 488 instances of console.log/error across codebase

- Files: Present in nearly all API routes and components
- Impact: Performance overhead, security risk (logs may leak in browser), noise in production
- Current state: Mix of development logging and production errors
- Fix approach:
  - Remove all non-error console.log statements
  - Use structured logging (Sentry) for exceptions
  - Keep console.error only for critical failures
  - Use debug flag for development-only logging

## Summary of Critical Priorities

| Area                            | Severity | Impact                    | Effort |
| ------------------------------- | -------- | ------------------------- | ------ |
| Webhook signature verification  | High     | Payment fraud risk        | Medium |
| Payment gateway production impl | High     | Can't process payments    | High   |
| Admin dashboard implementation  | High     | Blocks admin workflows    | High   |
| Type safety in validation       | Medium   | Security/maintainability  | Medium |
| Error handling in webhooks      | Medium   | Data consistency risk     | Medium |
| E2E test coverage               | Medium   | Production regressions    | High   |
| Sentry integration completion   | Medium   | Blind spots in monitoring | Low    |
| PDF generation implementation   | Medium   | User experience gap       | Medium |

---

_Concerns audit: 2026-03-02_
