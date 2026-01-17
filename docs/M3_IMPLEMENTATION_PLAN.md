# M3 Implementation Plan: Integrations & Payments 💳

**Created**: 2026-01-02
**Milestone**: M3: Integrations & Payments
**Total Estimate**: 72 hours (9 working days)
**Issues**: #79-#86

---

## 📊 Overview

M3 focuses on external integrations (payments, digital signatures, notifications) with a pragmatic approach: **mock implementations** for services we can't access in development (Ghișeul.ro, certSIGN).

### Key Strategy

- Build production-ready architecture with abstraction layers
- Implement realistic mocks for external APIs
- Enable easy swap to real APIs when credentials available

---

## 🎯 Phase 1: Database Schema pentru Plăți (Issue #81 - 6h)

**Objective**: Foundation for payments module

### Tables

#### `plati` table

```sql
CREATE TABLE plati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cerere_id UUID REFERENCES cereri(id) ON DELETE CASCADE,
  utilizator_id UUID REFERENCES utilizatori(id),
  judet_id UUID REFERENCES judete(id),
  localitate_id UUID REFERENCES localitati(id),

  suma DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded')),
  metoda_plata TEXT, -- 'card', 'bank_transfer', 'cash'

  transaction_id TEXT UNIQUE, -- External gateway transaction ID
  gateway_response JSONB, -- Full response from payment gateway

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `chitante` table

```sql
CREATE TABLE chitante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plata_id UUID REFERENCES plati(id) ON DELETE CASCADE,

  numar_chitanta TEXT UNIQUE NOT NULL,
  pdf_url TEXT NOT NULL,
  data_emitere TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

- Users can only see their own payments
- Multi-tenancy: județ + localitate isolation
- Admin users can see all payments in their locality

### API Routes

1. **GET /api/plati**
   - List user's payments
   - Query params: `status`, `date_from`, `date_to`, `page`, `limit`
   - Returns: `{ plati: [], total: number, page: number }`

2. **GET /api/plati/[id]**
   - Get payment details including chitanță if available
   - Returns: `{ plata: Payment, chitanta?: Chitanta }`

3. **POST /api/plati**
   - Initiate new payment
   - Body: `{ cerere_id, suma, return_url }`
   - Returns: `{ plata_id, redirect_url }`

4. **GET /api/plati/[id]/chitanta**
   - Download chitanță PDF
   - Returns: PDF file with proper headers

5. **POST /api/webhooks/ghiseul** (Internal)
   - Webhook handler for async payment notifications
   - Updates payment status based on gateway callback

### TypeScript Types

Generate from Supabase schema using `pnpm types:generate`

---

## 🏦 Phase 2: Mock Ghișeul.ro Simulator (8h)

**Motivation**: No access to official Ghișeul.ro API → build realistic mock

### Architecture

```
src/lib/payments/
├── ghiseul-client.ts       # Abstraction layer (works with mock or real API)
├── ghiseul-mock/
│   ├── server.ts           # Mock payment gateway server
│   ├── types.ts            # Payment request/response types
│   ├── simulator.ts        # Payment flow simulation logic
│   └── test-cards.ts       # Test card numbers and behaviors
└── types.ts                # Shared payment types
```

### Mock Functionality

#### 1. Payment Initiation

```typescript
// POST /api/payments/ghiseul-mock/initiate
interface PaymentRequest {
  amount: number;
  cerere_id: string;
  return_url: string;
  callback_url: string;
}

interface PaymentResponse {
  transaction_id: string;
  redirect_url: string;
  expires_at: string;
}
```

#### 2. Mock Payment Page

- Route: `/api/payments/ghiseul-mock/checkout`
- Simulates Ghișeul.ro interface
- Test cards:
  - `4111111111111111` → Success
  - `4000000000000002` → Declined (insufficient funds)
  - `4000000000000069` → Expired card
  - `4000000000000127` → Processing timeout
- Simulated processing delay: 2-5 seconds

#### 3. Payment Callback

```typescript
// Redirect to return_url with params:
// Success: ?status=success&transaction_id=xxx&payment_id=yyy
// Failed: ?status=failed&transaction_id=xxx&error=insufficient_funds
```

#### 4. Webhook Simulator

- Async notification to `POST /api/webhooks/ghiseul`
- Simulates delayed confirmation (30s-2min)
- Updates `plati` table status

### Environment Variables

```env
GHISEUL_MODE=mock           # 'mock' or 'production'
GHISEUL_MOCK_ENABLED=true
GHISEUL_API_KEY=mock_key_12345
GHISEUL_API_URL=https://api.ghiseul.ro  # Real API URL (unused in mock mode)
```

### Implementation Notes

- Mock should behave identically to real API
- Log all mock transactions for debugging
- Support all payment scenarios (success, failure, timeout, refund)

---

## 💳 Phase 3: Payment Flow Backend + Frontend (Issues #80, #82 - 16h)

### Backend Implementation (#80 - 8h)

#### Payment Flow Logic

```
1. User selects cerere with tax
2. POST /api/plati → creates payment record (status: pending)
3. If GHISEUL_MODE=mock:
     → Call ghiseul-mock simulator
   Else:
     → Call real Ghișeul.ro API
4. Redirect user to payment page (mock or real)
5. User completes payment
6. Callback updates payment status → success/failed
7. If success:
     - Generate chitanță PDF
     - Send email confirmation with receipt
     - Update cerere status if payment was required
8. Webhook handles async confirmation
```

#### Files to Create/Modify

- `src/app/api/plati/route.ts` - Create payment endpoint
- `src/app/api/plati/[id]/route.ts` - Get payment details
- `src/app/api/plati/[id]/chitanta/route.ts` - Download receipt PDF
- `src/app/api/webhooks/ghiseul/route.ts` - Webhook handler
- `src/lib/payments/ghiseul-client.ts` - Abstraction layer
- `src/lib/payments/chitanta-generator.ts` - PDF receipt generator

### Frontend Implementation (#82 - 8h)

#### Plăți List Page

**Route**: `/app/[judet]/[localitate]/plati/page.tsx`

**Features**:

- Table with all user payments
- Columns: Nr. Chitanță, Cerere, Sumă, Data, Status, Acțiuni
- Status badges:
  - Pending: 🟡 Yellow
  - Processing: 🔵 Blue
  - Success: 🟢 Green
  - Failed: 🔴 Red
  - Refunded: 🟣 Purple
- "Download Chitanță" button for successful payments
- Filters: date range, status
- "Plătește acum" button for unpaid cereri

#### Components to Create

- `src/components/plati/PlatiTable.tsx` - Desktop table view
- `src/components/plati/PlataCard.tsx` - Mobile card view
- `src/components/plati/StatusBadge.tsx` - Payment status badge
- `src/components/plati/PaymentFilters.tsx` - Filter controls

#### Payment Checkout Flow

**Route**: `/app/[judet]/[localitate]/plati/[id]/checkout/page.tsx`

**Features**:

- Shows payment details (amount, cerere, beneficiary)
- Payment summary
- "Continuă către Ghișeul.ro" button
- Redirects to mock or real payment gateway
- Handles return from gateway (success/failure)

---

## ✍️ Phase 4: certSIGN Integration / Mock (Issue #79 - 16h)

**Strategy**: Mock implementation similar to Ghișeul.ro

### Mock certSIGN Architecture

```
src/lib/signatures/
├── certsign-client.ts      # Abstraction layer
├── certsign-mock/
│   ├── server.ts           # Mock signing service
│   ├── types.ts            # Signature request/response types
│   ├── pdf-signer.ts       # Mock PDF signing (adds watermark)
│   └── sms-simulator.ts    # Mock SMS verification
└── types.ts                # Shared signature types
```

### Functionality

#### 1. Document Signing Request

```typescript
// POST /api/signatures/certsign-mock/sign
interface SignRequest {
  document_url: string;
  document_type: "cerere" | "chitanta" | "other";
  cerere_id?: string;
  user_phone: string;
}

interface SignResponse {
  signing_id: string;
  sms_code: string; // Mock: always '123456'
  expires_at: string;
}
```

#### 2. Mock Signing Page

- User enters SMS code (mock accepts any 6-digit code)
- Simulates signing process (2-3s delay)
- Returns "signed" PDF with watermark: "SEMNAT DIGITAL [MOCK]"

#### 3. Signed Document Storage

- Store signed PDF in Supabase Storage: `cereri-semnaturi/`
- Update `cereri_documente` table with signed version
- Link to original cerere

#### 4. Flow Integration

- After cerere finalized → "Semnează Digital" button appears
- User clicks → signing flow starts
- Signed document available for download

### Environment Variables

```env
CERTSIGN_MODE=mock          # 'mock' or 'production'
CERTSIGN_API_KEY=mock_key_67890
CERTSIGN_API_URL=https://api.certsign.ro
```

### PDF Watermarking

Use `pdf-lib` to add watermark:

- Text: "SEMNAT DIGITAL [MOCK] - {date} - {user_name}"
- Position: Bottom right corner
- Color: Semi-transparent blue
- Font size: 12pt

---

## 📧 Phase 5: Email Templates Enhancement (Issue #83 - 4h)

**Current Status**: Edge Function v4 with 4 templates from M2

### New Templates to Add

1. **Welcome Email** (after registration)

   ```
   Subject: Bine ai venit la Primăriata!
   - Welcome message
   - Platform overview
   - Next steps (complete profile, submit first cerere)
   ```

2. **Payment Confirmation** (after successful payment)

   ```
   Subject: Plata confirmată - Chitanță CER-2025-00001
   - Payment details
   - Chitanță attached as PDF
   - Download link for receipt
   ```

3. **Password Reset**

   ```
   Subject: Resetare parolă - Primăriata
   - Reset link (expires in 1 hour)
   - Security notice
   ```

4. **Weekly Digest** (optional - cereri in progress)
   ```
   Subject: Rezumat săptămânal - Cererile tale
   - List of pending cereri
   - List of cereri in progress
   - Action items
   ```

### Implementation

- Update `supabase/functions/send-email/index.ts`
- Add templates to `email_templates` object
- Test with SendGrid sandbox
- Deploy new Edge Function version (v5)

---

## 📱 Phase 6: Twilio SMS (Issue #84 - 6h) ⚠️ OPTIONAL/LOW PRIORITY

**Status**: Implement only if time permits after core features

### Simplified Mock Approach

```
src/lib/sms/
├── twilio-client.ts        # Abstraction layer
├── twilio-mock/
│   ├── simulator.ts        # Mock SMS sending
│   └── logger.ts           # Log SMS to database
└── types.ts
```

### SMS Scenarios

1. Cerere submitted: "Cererea CER-2025-00001 a fost înregistrată"
2. Status changed: "Cererea CER-2025-00001: În procesare"
3. Cerere finalized: "Cererea CER-2025-00001 este gata! Descarcă: [link]"

### Mock Implementation

- Log SMS messages to `sms_log` table instead of sending
- User preference in profile: enable/disable SMS
- Rate limit: max 5 SMS/day per user

### Environment

```env
TWILIO_MODE=mock
TWILIO_ACCOUNT_SID=mock_sid
TWILIO_AUTH_TOKEN=mock_token
TWILIO_PHONE_NUMBER=+40700000000
```

---

## 🧪 Phase 7: Integration Tests & Monitoring (Issue #85 - 8h)

### E2E Tests

#### Payment Flow Test

```typescript
// e2e/payment-flow.spec.ts
test("complete payment flow with mock Ghișeul.ro", async ({ page }) => {
  // 1. Create cerere with tax
  // 2. Navigate to plati page
  // 3. Click "Plătește acum"
  // 4. Mock payment page appears
  // 5. Enter test card
  // 6. Submit payment
  // 7. Verify redirect to success page
  // 8. Verify chitanță generated
  // 9. Download chitanță PDF
});
```

#### Signature Flow Test

```typescript
// e2e/signature-flow.spec.ts
test("sign document with mock certSIGN", async ({ page }) => {
  // 1. Navigate to finalized cerere
  // 2. Click "Semnează Digital"
  // 3. Mock signing page appears
  // 4. Enter SMS code (123456)
  // 5. Submit
  // 6. Verify signed PDF stored
  // 7. Download signed document
});
```

### Integration Tests

- Mock email sending (verify templates render correctly)
- Mock SMS sending (verify messages formatted correctly)
- Payment webhook handling (verify status updates)
- Chitanță PDF generation (verify content accuracy)

### Monitoring (Sentry)

**Metrics to Track**:

- Payment success rate (target: >95%)
- Payment processing time (target: <3s for mock, <10s for real)
- Signature success rate (target: >98%)
- Email delivery rate (target: >99%)
- SMS delivery rate (target: >95%)

**Alerts**:

- Payment failure rate >5% in 1 hour
- Signature service down
- Email delivery failures
- Webhook processing errors

**Dashboard**:

- Daily payment volume
- Daily signature volume
- Integration response times
- Error rates by service

---

## 📚 Phase 8: M3 Documentation & Completion (Issue #86 - 4h)

### Deliverables

#### 1. M3 Completion Report

**File**: `docs/M3_COMPLETION_REPORT.md`

**Sections**:

- Executive Summary
- Issues Completed (8/8)
- Technical Implementation Highlights
- Mock vs Real API Strategy
- Testing Coverage
- Metrics & Statistics
- Known Limitations
- Deployment Status
- Next Steps (M4 preview)

#### 2. M4 Handoff Document

**File**: `docs/M4_HANDOFF.md`

**Content**:

- M3 completion summary
- M4 objectives preview
- Technical debt items
- Recommendations for M4
- Handoff checklist

#### 3. Documentation Updates

- Update `README.md` with M3 status
- Update `ARCHITECTURE.md` with:
  - Payment flow diagrams
  - Signature flow diagrams
  - Integration architecture
  - Mock implementation strategy
- Update `DEVELOPMENT_GUIDE.md` with:
  - How to test payments (mock cards)
  - How to test signatures (mock flow)
  - Environment variable configuration

---

## 🚀 Recommended Implementation Order

### Week 1: Foundation + Payments (Days 1-3)

**Day 1 - Database Foundation**

- Issue #81: Database schema
- Create `plati` and `chitante` tables
- Implement RLS policies
- Create API route stubs
- Generate TypeScript types

**Day 2 - Mock Ghișeul.ro**

- Build mock payment gateway
- Create test card scenarios
- Implement callback/webhook handling
- Test payment initiation flow

**Day 3 - Payment Backend Integration**

- Complete API routes implementation
- Integrate with mock gateway
- Implement chitanță PDF generation
- Test full payment flow

### Week 2: Frontend + Signatures (Days 4-6)

**Day 4-5 - Payment Frontend**

- Issue #82: Plăți List Page
- Create payment components
- Implement filters and pagination
- Build checkout flow UI
- Test end-to-end payment from UI

**Day 6 - Mock certSIGN Setup**

- Create mock signing service
- Implement PDF watermarking
- Create signing flow API routes
- Test signature initiation

### Week 3: Completion (Days 7-9)

**Day 7 - certSIGN Integration Complete**

- Issue #79: Finish signature flow
- Frontend components for signing
- Integration with cereri module
- E2E signature testing

**Day 8 - Email Templates + Testing**

- Issue #83: Add new email templates
- Deploy Edge Function v5
- Issue #85: Integration tests
- Monitoring setup in Sentry

**Day 9 - Documentation + Completion**

- Issue #86: M3 completion checklist
- Write M3_COMPLETION_REPORT.md
- Write M4_HANDOFF.md
- Update all documentation
- Close M3 milestone

---

## 🎯 Critical Success Factors

### 1. Mock Realism

- Mocks must behave identically to real APIs
- All error scenarios must be simulated
- Response times should be realistic (not instant)
- Comprehensive logging for debugging

### 2. Easy Migration to Real APIs

- Abstraction layers isolate mock logic
- Single environment variable switches mode
- No code changes required for production deployment
- Mock and real implementations share interfaces

### 3. Comprehensive Testing

- All payment scenarios covered (success, failure, timeout, refund)
- All signature scenarios covered (success, cancel, timeout)
- Integration tests for all external services
- E2E tests for complete user flows

### 4. Production-Ready Architecture

- Proper error handling and retry logic
- Webhook security (verify signatures)
- Rate limiting and abuse prevention
- Audit logging for all financial transactions

---

## 📋 Pre-Implementation Checklist

- [x] Issues #79-#86 reviewed and understood
- [x] Implementation plan documented
- [ ] Database schema designed
- [ ] Mock architecture planned
- [ ] Environment variables configured
- [ ] Development branch created

---

## 🔗 References

- [PRD - Integrations](/.docs/01-requirements/PRD_Primariata_Complete.md#integrations)
- [Technical Spec - Payments](/.docs/02-technical-specs/TECH_SPEC_Integrations.md)
- [Implementation Roadmap - Phase 3](/.docs/03-implementation/IMPLEMENTATION_ROADMAP.md#phase-3)
- [Mock Services Documentation](/.docs/04-mock-services/)
- [Testing Strategy](/.docs/05-quality/TESTING_STRATEGY.md)

---

**Plan Created**: 2026-01-02
**Created By**: ATLAS
**Status**: Ready for Implementation
**Next Action**: Phase 1 - Database Schema (Issue #81)
