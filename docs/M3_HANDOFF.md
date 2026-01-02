# M3: Integrations & Advanced Features - Handoff Document

**From**: M2: Cereri Module (Core Features) 📋
**To**: M3: Integrations & Advanced Features 💳
**Handoff Date**: January 1, 2026
**Status**: Ready for M3 Planning

---

## M2 Completion Summary

**Status**: ✅ **100% Complete** (9/9 issues closed)

### What Was Delivered

M2 delivered a complete, production-ready Cereri (Requests) module with:

- ✅ Database schema with RLS policies
- ✅ Full CRUD API routes
- ✅ Multi-step wizard for creating cereri
- ✅ List page with filters and pagination
- ✅ Details page with status timeline
- ✅ Document upload/download with Supabase Storage
- ✅ Email notifications (4 types) via SendGrid
- ✅ Real-time updates using Supabase Realtime
- ✅ Comprehensive E2E testing (11 scenarios)
- ✅ CI/CD integration via GitHub Actions

### Technical Foundation for M3

The following infrastructure is now available for M3 features:

1. **Database**:
   - `cereri` table with all necessary columns
   - `tipuri_cereri` with 15+ predefined types
   - `cereri_documente` for attachments
   - RLS policies for multi-tenancy

2. **API Layer**:
   - Type-safe routes with Zod validation
   - Error handling patterns
   - Authentication middleware
   - File upload/download endpoints

3. **Frontend Components**:
   - Reusable form components
   - Status badge components
   - Timeline visualization
   - Document list with actions
   - Toast notification system

4. **Integrations**:
   - Supabase Storage configured
   - SendGrid email templates
   - Supabase Realtime subscriptions
   - pg_net for async HTTP calls

5. **Testing**:
   - Playwright E2E test framework
   - CI/CD workflows
   - Multi-browser testing setup

---

## M3 Objectives

**Goal**: Integrate external payment, signature, and notification services to create a complete e-government solution.

### Primary Features

1. **Payment Integration (Ghișeul.ro)** 💳
   - Pay taxes and fees related to cereri
   - Integration with Romanian payment gateway
   - Payment status tracking
   - Receipt generation

2. **Digital Signatures (certSIGN)** ✍️
   - Legally binding document signatures
   - Integration with Romanian eSignature provider
   - Signature verification
   - Timestamping

3. **SMS Notifications (Twilio)** 📱
   - Critical status updates via SMS
   - Two-factor authentication
   - Emergency notifications

4. **Admin Analytics Dashboard** 📊
   - Cereri metrics and KPIs
   - Performance analytics
   - User behavior tracking
   - Export reports (PDF/Excel)

---

## M3 Technical Scope

### Payment Integration (Ghișeul.ro)

**Requirements**:

- Merchant account with Ghișeul.ro
- API credentials (sandbox + production)
- SSL certificate for callback URLs

**Implementation**:

- `plati` table for payment records
- Payment API routes: `/api/plati/create`, `/api/plati/verify`
- Payment callback handler: `/api/webhooks/ghiseul`
- Payment status tracking component
- Receipt download functionality

**Estimated Effort**: 16-20 hours

---

### Digital Signatures (certSIGN)

**Requirements**:

- certSIGN API account
- Test environment credentials
- Understanding of Romanian eSignature regulations

**Implementation**:

- Document signing API: `/api/documents/[id]/sign`
- Signature verification: `/api/documents/[id]/verify`
- certSIGN SDK integration
- Signature status tracking
- Timestamping service

**Estimated Effort**: 20-24 hours

---

### SMS Notifications (Twilio)

**Requirements**:

- Twilio account with Romanian phone numbers
- SMS templates approved
- Rate limiting configuration

**Implementation**:

- Supabase Edge Function: `send-sms`
- Database triggers for SMS events
- SMS notification preferences in user profile
- Two-factor authentication flow
- SMS delivery tracking

**Estimated Effort**: 12-16 hours

---

### Admin Analytics Dashboard

**Requirements**:

- Admin role and permissions
- Analytics data models
- Chart library (e.g., Recharts)

**Implementation**:

- Admin route: `/app/admin/analytics`
- Cereri metrics API: `/api/admin/analytics/cereri`
- Dashboard components:
  - Total cereri (by status, by type)
  - Processing time averages
  - User activity heatmap
  - Top cerere types
  - Resolution rate trends
- Export to PDF/Excel
- Real-time metric updates

**Estimated Effort**: 24-28 hours

---

## Dependencies & Prerequisites

### External Services Setup

Before M3 development begins, the following must be configured:

1. **Ghișeul.ro**:
   - [ ] Merchant account created
   - [ ] Sandbox API credentials obtained
   - [ ] Test transactions verified
   - [ ] Production credentials ready

2. **certSIGN**:
   - [ ] Developer account registered
   - [ ] Test environment access granted
   - [ ] API documentation reviewed
   - [ ] Sample signatures tested

3. **Twilio**:
   - [ ] Account created
   - [ ] Romanian phone number purchased
   - [ ] SMS templates submitted for approval
   - [ ] Sender ID verified

4. **Admin Infrastructure**:
   - [ ] Admin user roles defined in Supabase
   - [ ] Admin authentication flow designed
   - [ ] Analytics data requirements documented

---

## Database Schema Extensions

### New Tables for M3

```sql
-- Payment records
CREATE TABLE plati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cerere_id UUID REFERENCES cereri(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  suma DECIMAL(10,2) NOT NULL,
  status payment_status NOT NULL, -- pending, completed, failed, refunded
  ghiseul_transaction_id TEXT,
  payment_method TEXT, -- card, bank_transfer, etc.
  data_plata TIMESTAMPTZ,
  data_confirmare TIMESTAMPTZ,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signature records
CREATE TABLE semnături (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES cereri_documente(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  certsign_signature_id TEXT UNIQUE,
  status signature_status NOT NULL, -- pending, signed, verified, invalid
  timestamp TIMESTAMPTZ,
  certificate_info JSONB,
  signature_data TEXT, -- Base64 encoded signature
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS notifications log
CREATE TABLE sms_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  cerere_id UUID REFERENCES cereri(id),
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  twilio_sid TEXT UNIQUE,
  status sms_status NOT NULL, -- queued, sent, delivered, failed
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin activity log
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- view_cerere, update_status, approve, reject
  entity_type TEXT NOT NULL, -- cerere, user, payment, etc.
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enum Types

```sql
CREATE TYPE payment_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
);

CREATE TYPE signature_status AS ENUM (
  'pending', 'signing', 'signed', 'verified', 'invalid', 'expired'
);

CREATE TYPE sms_status AS ENUM (
  'queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered'
);
```

---

## API Routes to Implement

### Payment Routes

```
POST   /api/plati/create           # Initiate payment
GET    /api/plati/[id]             # Get payment details
POST   /api/plati/[id]/verify      # Verify payment status
POST   /api/webhooks/ghiseul       # Payment callback
GET    /api/plati/[id]/receipt     # Download receipt
```

### Signature Routes

```
POST   /api/documents/[id]/sign    # Initiate signature
GET    /api/documents/[id]/verify  # Verify signature
POST   /api/webhooks/certsign      # Signature callback
GET    /api/documents/[id]/download-signed  # Download signed document
```

### SMS Routes (Edge Functions)

```
POST   /functions/v1/send-sms      # Send SMS via Twilio
GET    /functions/v1/sms/status    # Check SMS delivery status
```

### Admin Routes

```
GET    /api/admin/analytics/cereri          # Cereri analytics
GET    /api/admin/analytics/users           # User analytics
GET    /api/admin/analytics/payments        # Payment analytics
GET    /api/admin/analytics/export          # Export data
POST   /api/admin/cereri/[id]/assign        # Assign cerere to funcționar
PATCH  /api/admin/cereri/[id]/status        # Update cerere status (admin only)
POST   /api/admin/cereri/[id]/comment       # Add admin comment
```

---

## Component Architecture

### Payment Components

```
src/components/plati/
├── PaymentForm.tsx              # Payment initiation form
├── PaymentStatus.tsx            # Payment status display
├── PaymentHistory.tsx           # User's payment history
├── ReceiptDownload.tsx          # Download receipt button
└── GhiseulCallback.tsx          # Handle Ghișeul.ro callbacks
```

### Signature Components

```
src/components/semnaturi/
├── SignatureFlow.tsx            # Signature initiation flow
├── SignatureStatus.tsx          # Signature status tracking
├── CertificateInfo.tsx          # Display certificate details
└── VerifySignature.tsx          # Signature verification UI
```

### Admin Components

```
src/components/admin/
├── Dashboard.tsx                # Main admin dashboard
├── CereriMetrics.tsx           # Cereri statistics
├── UserMetrics.tsx             # User activity stats
├── PaymentMetrics.tsx          # Payment analytics
├── ExportData.tsx              # Export functionality
├── CerereActions.tsx           # Admin actions on cereri
└── ActivityLog.tsx             # Admin activity audit trail
```

---

## Mock Services Strategy

For development without real API credentials, implement mock services:

### Mock Ghișeul.ro

```typescript
// lib/mock/ghiseul.ts
export const mockGhiseulPayment = {
  initiate: async (amount: number) => ({
    transactionId: `MOCK-${Date.now()}`,
    paymentUrl: `/mock/ghiseul/pay?amount=${amount}`,
    status: "pending",
  }),
  verify: async (transactionId: string) => ({
    status: "completed",
    receiptUrl: `/mock/receipts/${transactionId}.pdf`,
  }),
};
```

### Mock certSIGN

```typescript
// lib/mock/certsign.ts
export const mockCertSignSignature = {
  initiate: async (documentId: string) => ({
    signatureId: `SIG-${Date.now()}`,
    signUrl: `/mock/certsign/sign?doc=${documentId}`,
    status: "pending",
  }),
  verify: async (signatureId: string) => ({
    status: "signed",
    certificate: {
      subject: "CN=Test User, O=Test Org",
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  }),
};
```

### Mock Twilio

```typescript
// lib/mock/twilio.ts
export const mockTwilioSMS = {
  send: async (phone: string, message: string) => ({
    sid: `SM-${Date.now()}`,
    status: "sent",
    sentAt: new Date(),
  }),
};
```

---

## Testing Strategy for M3

### Integration Tests

1. **Payment Flow**:
   - Create payment → Verify webhook → Download receipt
   - Failed payment handling
   - Refund processing

2. **Signature Flow**:
   - Sign document → Verify signature → Download signed doc
   - Invalid signature detection
   - Certificate expiration handling

3. **SMS Flow**:
   - Send SMS → Track delivery → Handle failures
   - Rate limiting enforcement

4. **Admin Features**:
   - View analytics → Export data
   - Assign cerere → Update status → Add comment
   - Activity log verification

### E2E Tests

```typescript
// e2e/payment-flow.spec.ts
test("should complete payment flow", async ({ page }) => {
  // Navigate to cerere requiring payment
  // Initiate payment
  // Complete payment (mock or sandbox)
  // Verify payment status updated
  // Download receipt
});

// e2e/signature-flow.spec.ts
test("should sign document", async ({ page }) => {
  // Navigate to document
  // Initiate signature
  // Complete signature process
  // Verify signature status
  // Download signed document
});

// e2e/admin-dashboard.spec.ts
test("should display analytics", async ({ page }) => {
  // Login as admin
  // Navigate to analytics
  // Verify charts render
  // Export data
});
```

---

## Security Considerations

### Payment Security

- ✅ Use HTTPS for all payment callbacks
- ✅ Validate Ghișeul.ro webhook signatures
- ✅ Store sensitive payment data encrypted
- ✅ Implement idempotency for payment creation
- ✅ Log all payment transactions
- ✅ Set up fraud detection rules

### Signature Security

- ✅ Verify certSIGN certificates
- ✅ Check signature timestamps
- ✅ Validate certificate chains
- ✅ Store signatures with documents permanently
- ✅ Implement signature expiration policies
- ✅ Audit all signature operations

### SMS Security

- ✅ Rate limit SMS sending (prevent abuse)
- ✅ Validate phone numbers before sending
- ✅ Encrypt phone numbers in database
- ✅ Implement opt-out mechanism
- ✅ Log all SMS activity
- ✅ Monitor for unusual patterns

### Admin Security

- ✅ Require MFA for admin accounts
- ✅ Implement role-based access control (RBAC)
- ✅ Audit all admin actions
- ✅ Restrict admin access by IP (optional)
- ✅ Implement session timeout
- ✅ Regular security reviews

---

## Configuration Management

### Environment Variables

```bash
# Payment (Ghișeul.ro)
GHISEUL_MERCHANT_ID=your_merchant_id
GHISEUL_API_KEY=your_api_key
GHISEUL_CALLBACK_URL=https://primariata.work/api/webhooks/ghiseul

# Digital Signature (certSIGN)
CERTSIGN_API_URL=https://api.certsign.ro
CERTSIGN_CLIENT_ID=your_client_id
CERTSIGN_CLIENT_SECRET=your_client_secret
CERTSIGN_CALLBACK_URL=https://primariata.work/api/webhooks/certsign

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+40123456789

# Admin
ADMIN_MFA_REQUIRED=true
ADMIN_SESSION_TIMEOUT=3600
```

---

## Deployment Considerations

### Staging Environment

1. **Use sandbox/test credentials** for all external services
2. **Enable detailed logging** for debugging integrations
3. **Mock services** for features without test credentials
4. **Automated E2E tests** run on every deployment

### Production Environment

1. **Production credentials** for Ghișeul.ro, certSIGN, Twilio
2. **Error monitoring** with Sentry for all integrations
3. **Uptime monitoring** for external service availability
4. **Backup payment methods** if primary service fails
5. **Graceful degradation** for non-critical features

---

## M3 Milestone Structure

### Proposed Issues

1. **#79** - Payment Integration - Ghișeul.ro Setup & API (16-20h)
2. **#80** - Payment UI - Payment Form, Status Tracking, Receipts (12-16h)
3. **#81** - Digital Signatures - certSIGN Integration (20-24h)
4. **#82** - Signature UI - Sign Flow, Verification, Downloads (12-16h)
5. **#83** - SMS Notifications - Twilio Integration (12-16h)
6. **#84** - SMS UI - Notification Preferences, 2FA (8-12h)
7. **#85** - Admin Dashboard - Analytics & Metrics (24-28h)
8. **#86** - Admin Features - Cerere Management, Activity Log (16-20h)
9. **#87** - E2E Tests - Payment, Signature, SMS, Admin (16-20h)
10. **#88** - M3 Completion Checklist (4h)

**Total Estimated Effort**: 144-176 hours (~4-5 weeks with 2 developers)

---

## Success Criteria for M3

### Payment Integration

- ✅ Users can pay taxes/fees via Ghișeul.ro
- ✅ Payment status tracked in real-time
- ✅ Receipts downloadable as PDF
- ✅ Failed payments handled gracefully
- ✅ Refunds processed correctly

### Digital Signatures

- ✅ Documents can be signed via certSIGN
- ✅ Signatures legally valid (Romanian law)
- ✅ Signature verification working
- ✅ Signed documents downloadable

### SMS Notifications

- ✅ SMS sent for critical events
- ✅ Two-factor authentication working
- ✅ Users can opt-in/opt-out
- ✅ Delivery tracking implemented

### Admin Dashboard

- ✅ Analytics displayed accurately
- ✅ Data exportable to PDF/Excel
- ✅ Real-time metrics updated
- ✅ Admin actions logged and auditable

---

## Risks & Mitigation

### Technical Risks

| Risk                     | Impact   | Probability | Mitigation                                      |
| ------------------------ | -------- | ----------- | ----------------------------------------------- |
| External API downtime    | High     | Medium      | Implement circuit breakers, fallback mechanisms |
| Integration complexity   | High     | High        | Start with mock services, iterate               |
| Payment security breach  | Critical | Low         | PCI DSS compliance, security audits             |
| Signature legal validity | Critical | Medium      | Legal consultation, test certification          |

### Business Risks

| Risk                   | Impact | Probability | Mitigation                                     |
| ---------------------- | ------ | ----------- | ---------------------------------------------- |
| High transaction costs | Medium | Medium      | Negotiate merchant fees, optimize transactions |
| Regulatory changes     | High   | Low         | Monitor legislation, maintain flexibility      |
| User adoption slow     | Medium | Medium      | User education, clear benefits communication   |
| Support overhead       | Medium | High        | Comprehensive documentation, FAQs              |

---

## Handoff Checklist

### For M3 Development Team

- ✅ M2 code merged to `develop` branch
- ✅ M2 completion report reviewed
- ✅ M3 technical requirements documented
- ✅ External service accounts identified
- ✅ Database schema extensions planned
- ✅ Component architecture designed
- ✅ Testing strategy defined
- ✅ Security considerations documented
- ✅ Deployment plan outlined

### Actions Required Before M3 Starts

- [ ] Review and approve M3 scope
- [ ] Create external service accounts
- [ ] Obtain API credentials (sandbox)
- [ ] Review database schema changes
- [ ] Create M3 milestone in GitHub
- [ ] Create M3 issues (#79-#88)
- [ ] Assign issues to team members
- [ ] Schedule M3 kickoff meeting

---

## Questions for M3 Planning

1. **Payment Priority**: Should we support multiple payment methods (card, bank transfer) or start with one?
2. **Signature Scope**: Are all documents signable or only specific types?
3. **SMS Budget**: What's the monthly budget for SMS notifications?
4. **Admin Access**: Who should have admin access initially?
5. **Analytics Retention**: How long should we keep analytics data?
6. **Export Formats**: PDF, Excel, or both for data exports?

---

## Conclusion

M2 has successfully delivered a complete Cereri module foundation. M3 will build upon this with external integrations to create a comprehensive e-government solution.

**M2 → M3 Transition**: Smooth handoff with complete documentation, stable codebase, and clear technical requirements.

**M3 Goal**: Transform Primăriata from a request management system into a full-featured digital government platform with payments, signatures, and advanced analytics.

**Ready for**: M3 planning, external service setup, and development kickoff.

---

**Document Generated**: January 1, 2026
**Generated By**: ATLAS
**Project**: Primăriata
**From**: M2: Cereri Module (Core Features) 📋
**To**: M3: Integrations & Advanced Features 💳
**Status**: ✅ Ready for M3
