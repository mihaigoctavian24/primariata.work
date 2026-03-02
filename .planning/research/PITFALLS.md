# Pitfalls Research

**Domain:** Romanian e-government multi-tenant SaaS (primarie digitization platform)
**Researched:** 2026-03-02
**Confidence:** HIGH (based on codebase audit, Supabase official docs, GDPR enforcement data, webhook security research)

---

## Critical Pitfalls

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

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `any` type in validation schemas (`src/lib/validations/common.ts`) | Quick DOMPurify integration | Type safety gaps in the most security-critical code path (input validation). XSS bugs harder to catch statically | Never in validation/sanitization code. Fix with proper generic types and `unknown` |
| Hardcoded `0` for pending payment count (`CetateanDashboard.tsx` line 382) | Avoids query implementation | Users think they have no pending payments; missed payment deadlines | Only during initial MVP; must query actual count before production |
| `--passWithNoTests` in CI | CI doesn't fail when test directories are empty | Encourages shipping code with zero test coverage. Current state: 6 test files for entire codebase | Never. Remove flag; add minimum coverage threshold (even 10% is better than 0%) |
| Mock CertSign returning success for all signatures | Unblocks digital signature UI development | When real CertSign is connected, mock behavior masks integration bugs. Certificate validation logic never tested | Only with clear `MOCK_CERTSIGN=true` feature flag and log warnings on every mock call |
| React Query prefetch with placeholder `queryFn` | Avoids implementing server-side data fetching | Components suspend/flash loading states instead of pre-loading. Poor UX on dashboard page load | Never ship placeholder queryFn to production. Either implement or remove prefetch configuration |
| SMS failures silently swallowed | Cerere/payment processing doesn't fail | Users miss critical notifications about their cereri/payments. No retry mechanism, no monitoring of delivery failures | Acceptable only if alternative notification channel (email) is guaranteed to work |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Ghiseul.ro payment webhooks | Parsing JSON body before signature verification; using `===` for signature comparison | Read raw body bytes first, verify HMAC with `crypto.timingSafeEqual()`, then parse JSON. Add timestamp validation (5-minute window) |
| Supabase RLS with multi-primarie users | Assuming `auth.jwt() -> 'user_metadata'` reflects current context | Use a server-side `SET LOCAL` session variable updated on each request, or store active_primarie_id in a session table that RLS policies reference |
| SendGrid via Edge Function | Hardcoding service role key in database function (`send_cerere_email_notification`) | Store in Supabase Secrets (vault); rotate on a schedule. If the function source is exposed, the key is compromised |
| Twilio SMS rate limiting | Trusting client-side rate limit display; not handling Twilio 429 responses | Enforce rate limits server-side via `sms_logs` table (already done), but also handle Twilio's own rate limiting with exponential backoff and queue failed messages for retry |
| CertSign digital signatures | Shipping mock implementation without a clear interface contract | Define the real CertSign API contract (PKCS#7 envelope format, certificate chain validation) as TypeScript interfaces now. Mock must implement the exact same interface. This prevents surprises when real credentials arrive |
| Better Stack / Logtail migration | Removing Sentry before Better Stack is fully configured and verified | Run both in parallel for 1-2 weeks. Verify Better Stack captures the same errors Sentry does. Only then remove `@sentry/nextjs` and its config files |
| DOMPurify client-side loading | Assuming sanitization is ready before form renders (race condition in `src/lib/validations/common.ts`) | Move sanitization to server-side only for security-critical paths. Client-side DOMPurify is a defense-in-depth layer, not the primary guard |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Survey dashboard loading full dataset into memory | Browser tab uses 500MB+ RAM; page becomes unresponsive | Implement server-side aggregation; paginate response tables; pre-compute analytics | 50,000+ survey responses (currently 0, but architecture matters for when surveys launch) |
| PDF export loading entire dataset before rendering (`src/lib/export/pdf-exporter.ts`) | Export request times out; Vercel function hits 10s limit | Stream PDF generation; use server-side rendering; for large exports, generate async and email download link | 10,000+ rows in a single export |
| 797-line HeroSection component re-rendering | Landing page LCP degrades; excessive JavaScript bundle | Split into sub-components; extract animation logic to separate modules; lazy-load below-fold content | Noticeable at any scale; affects Core Web Vitals |
| Missing indexes on RLS policy columns | Query time increases linearly with table size; dashboard loads slowly | Verify indexes exist on every column referenced in RLS USING clauses (judet_id, localitate_id, primarie_id, user_id) | 10,000+ rows per table |
| `database.types.ts` at 1,882 lines loaded by every server component | Build times increase; IDE performance degrades | Split into per-domain type files with barrel exports; only import needed types | Noticeable immediately in development; worse as schema grows |
| Supabase Realtime subscriptions without cleanup | Memory leaks in long-lived sessions; connection pool exhaustion | Verify all `useEffect` cleanup functions call `.unsubscribe()`. Check `useNotificationsRealtime()` for proper cleanup | After 30+ minutes of active use; multiple tab users |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Webhook endpoints accept unverified callbacks | Attacker forges payment completions; fraudulent cerere processing; financial loss to primarie | HMAC signature verification with timing-safe comparison on every webhook. IP whitelist for payment gateway. Rate limit webhook endpoint |
| CSRF protection inconsistently applied | State-changing POST to `/api/cereri` could be triggered from a malicious site the user visits while logged in | Make CSRF middleware mandatory on ALL POST/PUT/DELETE/PATCH routes. Current state: only some routes validate CSRF tokens |
| Service role key hardcoded in database function | If function source code leaks (via SQL injection, backup exposure, or developer error), full database access is compromised | Move to Supabase Secrets (vault). Rotate the key. Audit who has access to function source code |
| `trigger_debug_log` table has RLS disabled | Anyone with the anon key can read debug logs, which may contain function execution traces, error details, and internal state | Delete the table from production, or enable RLS with a `DENY ALL` policy. It should never exist outside development |
| Error responses may include stack traces in production | Attacker learns database schema, file paths, library versions from error details | Implement structured error responses: return generic messages to client, log full details to Better Stack. Never include `error.stack` in API responses |
| No leaked password protection in Supabase Auth | Users register with passwords known to be compromised (in HaveIBeenPwned database) | Enable leaked password protection in Supabase Auth settings. One toggle, zero code changes required |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Broken `/cereri/new` route (0/10 score in E2E audit) | Citizens cannot submit new cereri -- the core value proposition of the platform. They see an error page | Fix is highest-priority UX item. Debug the route; likely a missing Server Component or broken form state. Test with Playwright |
| Gamification points inconsistency (50 pts desktop vs 25 pts mobile) | Users lose trust when they see different point values on different devices. Perceived as a bug or unfairness | Use a single constant for point values. Debug why responsive breakpoint changes the value (likely a conditional render bug) |
| No loading states during primarie context switch | User clicks notification from Primarie B while viewing Primarie A. Page goes blank during context switch | Show a transition overlay: "Se incarca datele pentru [Primarie B]..." with spinner. Only dismiss when new data is loaded |
| Staff dashboards show stub content | Funcionari/primari login, see placeholder text, conclude the platform doesn't work. They never come back | Even before full implementation: show a "Coming soon" state with expected feature list and timeline, not an empty stub |
| Search in dashboard returning 404 for plati | User searches for a payment and gets a broken page instead of "no results found" | Fix the search route handler to return empty results, not 404. Add proper empty state UI |
| Missing document download functionality | User completes a cerere but cannot download the receipt or attached documents. Button exists but does nothing | Wire the download handler. If ZIP archive is not ready, at least support single-file download with signed Supabase Storage URLs |

## "Looks Done But Isn't" Checklist

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

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Multi-tenant data leakage discovered in production | HIGH | Immediately disable affected routes. Audit all data access logs. Notify affected primarii. Fix RLS policies. Re-test with multi-primarie fixtures. Deploy hotfix. File data breach notification with ANSPDCP within 72 hours if real PII exposed |
| Forged payment webhook accepted | HIGH | Freeze payment processing. Audit all recent payment status changes. Reverse fraudulent completions. Implement HMAC verification. Notify affected users. Review financial reconciliation |
| GDPR complaint filed by citizen | MEDIUM | Respond within 30 days (GDPR requirement). Implement requested right (access, deletion, portability). Document response. Add automated DSAR processing to prevent recurrence |
| Console.log leaking PII in Vercel logs | MEDIUM | Purge Vercel log history. Deploy `compiler.removeConsole` as emergency fix. Then properly migrate to structured logging |
| Stub dashboards shipped to real primarie | LOW | Communicate timeline to staff users. Ship incremental dashboard updates (weekly). Provide manual workaround documentation for staff operations |
| Database function search path exploited | HIGH | Revoke public schema creation privileges immediately. Apply `SET search_path` migration. Audit for any unauthorized schema objects. Rotate service role key |

## Pitfall-to-Phase Mapping

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

## Sources

- Supabase Production Checklist: https://supabase.com/docs/guides/deployment/going-into-prod (HIGH confidence)
- Supabase RLS Documentation: https://supabase.com/docs/guides/database/postgres/row-level-security (HIGH confidence)
- Supabase Security Checklist for Startups: https://www.cyber-checker.com/blog/supabase-security-checklist (MEDIUM confidence)
- Webhook Security Best Practices 2025-2026: https://dev.to/digital_trubador/webhook-security-best-practices-for-production-2025-2026-384n (MEDIUM confidence)
- Mastering Webhook Security in Payment Processing: https://www.useaxra.com/blog/mastering-webhook-security-in-payment-processing (MEDIUM confidence)
- Romania ANSPDCP enforcement actions: https://www.dataprotection.ro/index.jsp?page=allnews&lang=en (HIGH confidence)
- Romania GDPR compliance framework: https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/romania (HIGH confidence)
- Romania Digital Governance Framework (October 2025): https://edgeinstitute.ro/wp-content/uploads/2025/10/Digital-Governance-Framework-for-Romania-by-Digital-Nation.pdf (HIGH confidence)
- EU Web Accessibility Directive / Romania EN 301 549: https://www.levelaccess.com/wp-content/uploads/2025/05/Romania-Republic-Digital-Accessibility-Laws.pdf (HIGH confidence)
- Romania digital public services DESI analysis: https://www.lumenpublishing.com/journals/index.php/ejlpa/article/view/7486 (MEDIUM confidence)
- Multi-tenant RLS in Supabase (LockIn case study): https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2 (MEDIUM confidence)
- Next.js console.log production cleanup: https://prateeksha.com/blog/nextjs-logging-best-practices-structured-logs-production (MEDIUM confidence)
- MakerKit Supabase production checklist: https://makerkit.dev/docs/next-supabase-turbo/going-to-production/checklist (MEDIUM confidence)
- Codebase audit: `.planning/codebase/CONCERNS.md`, `.planning/codebase/DATABASE.md`, `.planning/codebase/TESTING.md` (HIGH confidence -- direct codebase analysis)

---
*Pitfalls research for: Romanian e-government multi-tenant SaaS (primarie digitization)*
*Researched: 2026-03-02*
