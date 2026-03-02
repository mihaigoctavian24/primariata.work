# Stack Research

**Domain:** Romanian e-government / primarie digitization SaaS platform
**Researched:** 2026-03-02
**Confidence:** HIGH (all recommendations verified via Context7 or official sources)

## Context

This is a **subsequent milestone** stack research. The application already runs Next.js 15.5.9, React 19, TypeScript 5 strict, Supabase (Auth/DB/Storage/Realtime/Edge Functions), Tailwind CSS 4, shadcn/ui, Zustand 5, React Query 5, and 60+ other dependencies. This document covers **only the additions and changes** needed for five specific feature gaps identified in PROJECT.md.

---

## 1. Dynamic Map Widget (Replacing Spline 3D)

### Current State

The Spline 3D iframe embed (`https://my.spline.design/...`) in `CetățeanDashboard.tsx` is a single hardcoded scene. It cannot scale to 3,000+ localitati. The `three`, `@react-three/fiber`, and `@react-three/drei` packages (installed but likely only used for this widget) are heavy dependencies (~500KB+ combined) serving one static embed.

### Recommendation: react-map-gl + Mapbox GL JS

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-map-gl | 8.1.0 | React wrapper for map rendering | Official vis.gl React binding; controlled + uncontrolled component modes; supports dynamic import for SSR; TypeScript-first; 214 code snippets in Context7 (HIGH confidence) |
| mapbox-gl | 3.19.0 | WebGL map rendering engine | Vector tiles, 3D terrain, custom styles; 50K free map loads/month; rich Romanian map data via OpenStreetMap; GPU-accelerated |

**Confidence: HIGH** — Verified via Context7 (`/visgl/react-map-gl`), npm, and official Mapbox docs.

### Why Mapbox GL over Leaflet

| Criterion | Mapbox GL JS | Leaflet |
|-----------|-------------|---------|
| Rendering | WebGL vector tiles | DOM-based raster tiles |
| Visual quality | Custom styled vector maps, 3D terrain, smooth zoom | Basic raster tiles, limited styling |
| Romanian data | Full OpenStreetMap coverage via Mapbox styles | Depends on tile provider (OpenStreetMap is good) |
| Bundle size | ~212KB (react-map-gl) + ~800KB (mapbox-gl) | ~42KB (leaflet) + ~24KB (react-leaflet) |
| Free tier | 50K map loads/month | Fully free (OSS) |
| SSR compat | Dynamic import via `mapLib={import('mapbox-gl')}` | Requires `next/dynamic` with `ssr: false` |
| This project | Replaces a 3D visualization — needs visual richness | Too basic for a "wow" landing page element |

**Decision:** Use Mapbox GL JS via react-map-gl. The visual quality justifies the larger bundle. Mapbox's 50K free loads/month is more than sufficient for an academic project and early production. The `mapLib` prop enables dynamic imports, avoiding SSR issues.

**Fallback if Mapbox pricing concerns arise:** MapLibre GL JS (`maplibre-gl` v5.19.0) is a free fork of Mapbox GL v1 with no token requirement. react-map-gl supports it natively via `import from 'react-map-gl/maplibre'`. Switching is a one-line import change.

### Next.js Integration Pattern

```tsx
'use client';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Dynamic import of mapbox-gl for SSR compatibility
<Map
  mapLib={import('mapbox-gl')}
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  initialViewState={{ longitude: 25.0, latitude: 45.9, zoom: 6 }}
  mapStyle="mapbox://styles/mapbox/streets-v9"
>
  {localitati.map(loc => (
    <Marker key={loc.id} longitude={loc.lng} latitude={loc.lat} />
  ))}
</Map>
```

### Packages to Remove After Migration

- `three` (^0.180.0)
- `@react-three/fiber` (^9.4.0)
- `@react-three/drei` (^10.7.6)
- `maath` (0.10.8) — math utility for Three.js
- `postprocessing` (6.37.8) — Three.js post-processing effects

This saves ~600KB+ from the bundle and removes CSP whitelist entries for `*.spline.design`.

---

## 2. Better Stack Integration (Replacing Sentry)

### Current State

Sentry (`@sentry/nextjs` 10.21.0) is deeply integrated:
- `next.config.ts` wrapped with `withSentryConfig()`
- `sentry.server.config.ts` (server init)
- `instrumentation-client.ts` (client init, assumed)
- CSP headers whitelist `*.sentry.io` and `browser.sentry-cdn.com`
- Source map uploads during build
- Tunnel route at `/monitoring`
- Integration monitoring in `src/lib/monitoring/integrations.ts`

### Recommendation: @logtail/next

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @logtail/next | 0.3.1 | Better Stack logging + monitoring for Next.js | Single package for structured logging, error tracking, and Web Vitals; native Vercel integration; simpler than Sentry's multi-file setup; MIT license |

**Confidence: MEDIUM** — Version verified via npm (published 7 days before research). Setup pattern verified via Better Stack docs and GitHub repo. Full App Router + Next.js 15 compatibility not explicitly documented (docs reference Next.js 14); needs validation.

### Setup Pattern

**1. Install:**
```bash
pnpm add @logtail/next
pnpm remove @sentry/nextjs
```

**2. next.config.ts — Replace Sentry wrapper:**
```typescript
import { withBetterStack } from '@logtail/next';

export default withBetterStack(nextConfig);
// Replaces: export default withSentryConfig(nextConfig, { ... });
```

**3. Environment variable:**
```
BETTER_STACK_SOURCE_TOKEN=<token from Better Stack dashboard>
# Remove: NEXT_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN
```

**4. Middleware logging (middleware.ts):**
```typescript
import { Logger } from '@logtail/next';

const logger = new Logger();

export async function middleware(request: NextRequest) {
  logger.middleware(request);
  // ... existing middleware logic
}
```

**5. Web Vitals (app/layout.tsx):**
```tsx
import { BetterStackWebVitals } from '@logtail/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <BetterStackWebVitals />
      </body>
    </html>
  );
}
```

### Files to Remove After Migration

- `sentry.server.config.ts`
- `sentry.edge.config.ts` (if exists)
- `instrumentation-client.ts` (Sentry client init — replace with Better Stack)
- Sentry tunnel route at `/monitoring` (remove rewrite if configured)
- CSP entries for `*.sentry.io` and `browser.sentry-cdn.com`

### Files to Modify

- `next.config.ts` — Replace `withSentryConfig` with `withBetterStack`, update CSP
- `src/lib/monitoring/integrations.ts` — Replace Sentry.captureException with logger calls
- `app/layout.tsx` — Add `<BetterStackWebVitals />`
- `middleware.ts` — Add logger.middleware()

### Risk: Next.js 15 Compatibility

@logtail/next 0.3.1 explicitly targets Next.js 14. Next.js 15 uses the same middleware pattern, so the API should be compatible. However, this has **not been officially documented**. Test thoroughly during implementation.

---

## 3. Multi-Tenant Data Isolation Verification

### Current State

RLS policies filter on `judet_id` + `localitate_id` from user metadata. PROJECT.md flags a **critical bug**: data isolation per primarie may not be enforced correctly when a user is active in multiple primarii. No automated tests exist for RLS policies.

### Recommendation: pgTAP + basejump test helpers

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| pgTAP | (Supabase built-in extension) | PostgreSQL unit testing framework | First-party Supabase support; SQL-native tests; runs via `supabase test db`; tests RLS at the database level where policies actually execute |
| basejump-supabase_test_helpers | 0.0.6 | pgTAP helper functions for Supabase auth | Provides `tests.create_supabase_user()`, `tests.authenticate_as()`, `tests.rls_enabled()`; official Supabase recommendation |

**Confidence: HIGH** — Verified via Supabase official docs, basejump GitHub repo, and database.dev registry.

### Installation

```sql
-- In a Supabase migration file or SQL editor
-- 1. Enable pgTAP (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS pgtap;

-- 2. Install basejump test helpers via dbdev
SELECT dbdev.install('basejump-supabase_test_helpers');
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers" VERSION '0.0.6';
```

### Test Pattern for Multi-Tenant Isolation

```sql
-- supabase/tests/database/rls_cereri_isolation.test.sql
BEGIN;
SELECT plan(4);

-- Create test users in different primarii
SELECT tests.create_supabase_user('user_alba', 'user_alba@test.com',
  '{"judet_id": "alba", "localitate_id": "alba-iulia"}');
SELECT tests.create_supabase_user('user_brasov', 'user_brasov@test.com',
  '{"judet_id": "brasov", "localitate_id": "brasov-centru"}');

-- Insert test data as service_role (bypasses RLS)
SET LOCAL ROLE service_role;
INSERT INTO cereri (id, judet_id, localitate_id, titlu, user_id)
VALUES
  ('cerere-1', 'alba', 'alba-iulia', 'Test Alba', tests.get_supabase_uid('user_alba')),
  ('cerere-2', 'brasov', 'brasov-centru', 'Test Brasov', tests.get_supabase_uid('user_brasov'));

-- Test 1: RLS is enabled on cereri table
SELECT tests.rls_enabled('public', 'cereri');

-- Test 2: User in Alba sees only Alba cereri
SELECT tests.authenticate_as('user_alba');
SELECT results_eq(
  'SELECT count(*)::int FROM cereri',
  ARRAY[1],
  'User in Alba should see exactly 1 cerere'
);

-- Test 3: User in Brasov sees only Brasov cereri
SELECT tests.authenticate_as('user_brasov');
SELECT results_eq(
  'SELECT count(*)::int FROM cereri',
  ARRAY[1],
  'User in Brasov should see exactly 1 cerere'
);

-- Test 4: Cross-tenant isolation — Alba user cannot see Brasov data
SELECT tests.authenticate_as('user_alba');
SELECT is_empty(
  'SELECT * FROM cereri WHERE localitate_id = ''brasov-centru''',
  'Alba user should NOT see Brasov cereri'
);

SELECT tests.clear_authentication();
SELECT * FROM finish();
ROLLBACK;
```

### Running Tests

```bash
# Requires Supabase CLI and local dev instance
supabase test db
```

### Verification Strategy

Test every table that contains tenant-scoped data:
1. `cereri` — requests
2. `plati` — payments
3. `notifications` — (cross-tenant exception — test differently)
4. `documents` — user documents
5. Any new tables added

For each table, verify:
- RLS is enabled (`tests.rls_enabled()`)
- SELECT isolation (user A cannot see user B's data in different primarie)
- INSERT isolation (user cannot insert data for a different primarie)
- UPDATE isolation (user cannot modify data in a different primarie)
- DELETE isolation (user cannot delete data from a different primarie)

---

## 4. PDF Receipt Generation (Chitante)

### Current State

Both `pdf-lib` (1.17.1) and `jsPDF` (3.0.3) are already installed. `html2canvas` (1.4.1) is also available. No `@pdf-lib/fontkit` is installed, which means Romanian diacritics (ă, â, î, ș, ț) **cannot be rendered** with pdf-lib using custom fonts.

### Recommendation: pdf-lib + @pdf-lib/fontkit (server-side)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| pdf-lib | 1.17.1 (already installed) | Programmatic PDF creation | Pure JavaScript, works in Node.js and Edge; no native dependencies; deterministic output; 905 code snippets in Context7 (HIGH confidence) |
| @pdf-lib/fontkit | 1.1.1 | Custom font embedding for pdf-lib | Required for Romanian diacritics (ă, â, î, ș, ț); enables TrueType/OpenType font embedding; official pdf-lib companion |

**Confidence: HIGH** — Verified via Context7 (`/websites/pdf-lib_js`), npm, and pdf-lib GitHub issues (#17, #211 on unicode support).

### Why pdf-lib over jsPDF for Receipts

| Criterion | pdf-lib | jsPDF |
|-----------|---------|-------|
| Romanian diacritics | Requires fontkit + embedded TTF font | Built-in addFont() method |
| Server-side (Edge/Node) | Full support, no DOM dependency | Requires DOM for some features (html2canvas) |
| PDF manipulation | Create + modify existing PDFs | Create only |
| File size control | Precise — only includes what you add | Can be unpredictable with HTML conversion |
| Template-based | Build from scratch or modify templates | Best with HTML-to-PDF workflow |
| This project | Programmatic receipts from payment data | Better for visual documents from HTML |

**Decision:** Use **pdf-lib** for receipt generation. Receipts are structured data (amounts, dates, reference numbers) — programmatic construction is cleaner than HTML-to-PDF conversion. jsPDF remains available for any future HTML-to-PDF needs (e.g., printing cerere detail views).

### Romanian Diacritics Pattern

```typescript
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'fs/promises';

async function generateChitanta(paymentData: PaymentData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Embed a font that supports Romanian characters
  // Use a font like Noto Sans, Inter, or Roboto — all support ă, â, î, ș, ț
  const fontBytes = await readFile('./public/fonts/NotoSans-Regular.ttf');
  const font = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  const { height } = page.getSize();

  // Header
  page.drawText('CHITANȚĂ / RECEIPT', {
    x: 50, y: height - 50,
    size: 18, font,
    color: rgb(0.1, 0.1, 0.5),
  });

  // Romanian diacritics render correctly with embedded font
  page.drawText(`Primăria ${paymentData.localitate}`, {
    x: 50, y: height - 80,
    size: 12, font,
  });

  page.drawText(`Sumă plătită: ${paymentData.amount} RON`, {
    x: 50, y: height - 120,
    size: 14, font,
  });

  return pdfDoc.save();
}
```

### Server Action Pattern (Next.js)

```typescript
'use server';

export async function generateReceiptPDF(paymentId: string): Promise<Uint8Array> {
  const supabase = await createClient();
  const { data: payment } = await supabase
    .from('plati')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment) throw new Error('Payment not found');

  return generateChitanta(payment);
}
```

### Font Selection

Use **Noto Sans** (Google Fonts, OFL license) — it has full Romanian diacritic support including the comma-below variants (ș, ț) which many fonts get wrong by using cedilla variants instead.

Store the font file at `public/fonts/NotoSans-Regular.ttf` (~500KB). Embed in PDF at generation time.

---

## 5. Admin Approval Workflow

### Current State

PROJECT.md specifies: "Free sign-up to primarie, admin (primarie-level) approval, then access." No approval table or workflow exists yet.

### Recommendation: PostgreSQL enum + trigger + RLS pattern

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| PostgreSQL enum | (built into Supabase PostgreSQL 15) | Status state machine | Type-safe status values; enforced at database level; compatible with Supabase type generation |
| PostgreSQL trigger | (built into Supabase PostgreSQL 15) | Automatic status transitions + notifications | Event-driven, no polling; executes in same transaction; can notify via Supabase Realtime |

**Confidence: HIGH** — Standard PostgreSQL patterns; verified via Supabase official docs on enums, triggers, and user management.

### Database Schema

```sql
-- Migration: create_primarie_registrations

-- Status enum for approval workflow
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');

-- Primarie registration table — tracks user-to-primarie membership
CREATE TABLE primarie_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  judet_id TEXT NOT NULL,
  localitate_id TEXT NOT NULL,
  status registration_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,  -- Required when status = 'rejected'
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One registration per user per primarie
  UNIQUE(user_id, judet_id, localitate_id)
);

-- RLS: Users see their own registrations; admins see all for their primarie
ALTER TABLE primarie_registrations ENABLE ROW LEVEL SECURITY;

-- User can see own registrations (all primarii)
CREATE POLICY "Users view own registrations"
  ON primarie_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- User can create registration (pending)
CREATE POLICY "Users create registration"
  ON primarie_registrations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

-- Admin can view registrations for their primarie
CREATE POLICY "Admins view primarie registrations"
  ON primarie_registrations FOR SELECT
  USING (
    judet_id = (auth.jwt() -> 'user_metadata' ->> 'judet_id')
    AND localitate_id = (auth.jwt() -> 'user_metadata' ->> 'localitate_id')
    AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'primar')
  );

-- Admin can update status (approve/reject)
CREATE POLICY "Admins decide on registrations"
  ON primarie_registrations FOR UPDATE
  USING (
    judet_id = (auth.jwt() -> 'user_metadata' ->> 'judet_id')
    AND localitate_id = (auth.jwt() -> 'user_metadata' ->> 'localitate_id')
    AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'primar')
  )
  WITH CHECK (status IN ('approved', 'rejected'));
```

### Trigger for Notifications

```sql
-- Trigger: Notify user when registration is approved/rejected
CREATE OR REPLACE FUNCTION notify_registration_decision()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
    NEW.decided_at = now();
    NEW.decided_by = auth.uid();

    -- Insert notification for the user
    INSERT INTO notifications (user_id, type, title, body, metadata)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.status = 'approved' THEN 'registration_approved'
           ELSE 'registration_rejected' END,
      CASE WHEN NEW.status = 'approved'
           THEN 'Cererea de inregistrare a fost aprobata'
           ELSE 'Cererea de inregistrare a fost respinsa' END,
      CASE WHEN NEW.status = 'approved'
           THEN 'Acum aveti acces la serviciile primariei.'
           ELSE format('Motiv: %s', COALESCE(NEW.rejection_reason, 'Nespecificat')) END,
      jsonb_build_object(
        'judet_id', NEW.judet_id,
        'localitate_id', NEW.localitate_id,
        'registration_id', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_registration_decision
  BEFORE UPDATE ON primarie_registrations
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION notify_registration_decision();
```

### Data Access Pattern

All existing RLS policies that filter on `judet_id + localitate_id` from user metadata should additionally check that the user has an **approved** registration for that primarie:

```sql
-- Example: Modify cereri SELECT policy to check registration
CREATE POLICY "Users view own primarie cereri"
  ON cereri FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM primarie_registrations
      WHERE user_id = auth.uid()
        AND judet_id = cereri.judet_id
        AND localitate_id = cereri.localitate_id
        AND status = 'approved'
    )
  );
```

This ensures that even if user metadata contains a `judet_id`/`localitate_id`, they cannot access data until approved.

---

## Installation Summary

```bash
# New packages to ADD
pnpm add react-map-gl@8.1.0 mapbox-gl@3.19.0
pnpm add @logtail/next@0.3.1
pnpm add @pdf-lib/fontkit@1.1.1

# Packages to REMOVE after migration
pnpm remove @sentry/nextjs
pnpm remove three @react-three/fiber @react-three/drei maath postprocessing

# Database extensions (run in Supabase SQL editor)
# CREATE EXTENSION IF NOT EXISTS pgtap;
# SELECT dbdev.install('basejump-supabase_test_helpers');
# CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers" VERSION '0.0.6';
```

### Environment Variables

```bash
# ADD
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox-access-token>
BETTER_STACK_SOURCE_TOKEN=<better-stack-source-token>

# REMOVE (after migration)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| react-map-gl + Mapbox GL | react-leaflet + Leaflet | If zero API cost is required and visual richness is not a priority. Leaflet is ~10x smaller but raster-only. |
| react-map-gl + Mapbox GL | react-map-gl + MapLibre GL | If Mapbox token acquisition is blocked or pricing becomes a concern. MapLibre is a free Mapbox GL fork. One-line import swap: `react-map-gl/maplibre`. |
| @logtail/next | @sentry/nextjs (keep) | If Better Stack proves incompatible with Next.js 15. Sentry is battle-tested but heavier. |
| @logtail/next | pino + pino-pretty | If you need pure local logging without a hosted service. Not a monitoring replacement. |
| pdf-lib (server) | jsPDF + html2canvas | If receipts need to match a complex HTML template visually. Use for "print this page" features, not programmatic receipts. |
| pdf-lib (server) | @react-pdf/renderer | If you want React component-based PDF generation. Heavier dependency, but great DX for complex layouts. Not needed for simple receipts. |
| pgTAP + basejump helpers | Playwright E2E tests | For end-to-end user flow testing (already in stack). Does not replace database-level RLS verification. Use both. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| google-maps-react / @react-google-maps/api | Google Maps requires billing account, no free tier for map embeds, restrictive ToS | react-map-gl + Mapbox GL JS |
| @splinetool/react-spline | Cannot scale to 3,000+ localitati — each scene is manually designed; iframe performance issues; proprietary | react-map-gl with GeoJSON data |
| puppeteer / playwright for PDF | Requires a browser runtime on the server; massive dependency; cold start issues on Vercel Edge/Serverless | pdf-lib (pure JS, no browser needed) |
| wkhtmltopdf | Native binary, cannot run on Vercel/Edge; deprecated | pdf-lib |
| Custom RLS test framework | Reinventing well-solved tooling; fragile | pgTAP + basejump test helpers |
| NextAuth.js | Already using Supabase Auth; adding NextAuth creates auth confusion and session conflicts | Supabase Auth (already integrated) |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react-map-gl@8.1.0 | mapbox-gl@>=3.5.0 | v8 requires mapbox-gl v3+ (uses Proxy internally) |
| react-map-gl@8.1.0 | maplibre-gl@>=4.0.0 | Via `react-map-gl/maplibre` import |
| react-map-gl@8.1.0 | React 18/19 | Tested with React 18; React 19 expected compatible (no breaking hook changes) |
| @logtail/next@0.3.1 | Next.js 14.x (official) | Next.js 15.x expected compatible but not officially documented. Test during implementation. |
| @pdf-lib/fontkit@1.1.1 | pdf-lib@1.17.1 | Official companion. Last published 5 years ago but stable and actively used. |
| pgTAP | Supabase PostgreSQL 15 | Built-in extension, first-party support |
| basejump-supabase_test_helpers@0.0.6 | Supabase CLI 1.x+ | Installed via dbdev package manager |

## Sources

- Context7 `/visgl/react-map-gl` (benchmark 82.8, HIGH reputation) — react-map-gl docs, SSR patterns, GeoJSON examples
- Context7 `/websites/pdf-lib_js` (benchmark 76.2, HIGH reputation) — pdf-lib font embedding, PDF creation patterns
- [react-map-gl npm](https://www.npmjs.com/package/react-map-gl) — Version 8.1.0 confirmed
- [mapbox-gl npm](https://www.npmjs.com/package/mapbox-gl) — Version 3.19.0 confirmed
- [Mapbox Pricing](https://www.mapbox.com/pricing) — 50K free map loads/month confirmed
- [react-map-gl what's new](https://visgl.github.io/react-map-gl/docs/whats-new) — v8 Proxy rewrite (Oct 2025)
- [@logtail/next npm](https://www.npmjs.com/package/@logtail/next) — Version 0.3.1 confirmed
- [Better Stack Next.js docs](https://betterstack.com/docs/logs/javascript/nextjs/) — Setup guide
- [logtail-nextjs GitHub](https://github.com/logtail/logtail-nextjs) — Source, examples
- [@pdf-lib/fontkit npm](https://www.npmjs.com/package/@pdf-lib/fontkit) — Version 1.1.1 confirmed
- [pdf-lib GitHub issue #17](https://github.com/Hopding/pdf-lib/issues/17) — Unicode/charset support
- [pdf-lib GitHub issue #211](https://github.com/Hopding/pdf-lib/issues/211) — Non-English alphabet support
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — Official patterns
- [Supabase testing overview](https://supabase.com/docs/guides/local-development/testing/overview) — pgTAP setup
- [Supabase advanced pgTAP testing](https://supabase.com/docs/guides/local-development/testing/pgtap-extended) — RLS testing patterns
- [basejump test helpers](https://github.com/usebasejump/supabase-test-helpers) — Version 0.0.6, auth helpers
- [database.dev basejump/supabase_test_helpers](https://database.dev/basejump/supabase_test_helpers) — Installation via dbdev
- [Supabase enums docs](https://supabase.com/docs/guides/database/postgres/enums) — Enum patterns
- [Supabase triggers docs](https://supabase.com/docs/guides/database/postgres/triggers) — Trigger patterns
- [Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data) — Auth trigger patterns
- [MakerKit Supabase RLS best practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — Production patterns
- [MapLibre vs Leaflet comparison](https://blog.jawg.io/maplibre-gl-vs-leaflet-choosing-the-right-tool-for-your-interactive-map/) — Feature comparison
- [Map libraries popularity](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/) — Download trends

---
*Stack research for: Romanian e-government / primarie digitization SaaS platform*
*Researched: 2026-03-02*
