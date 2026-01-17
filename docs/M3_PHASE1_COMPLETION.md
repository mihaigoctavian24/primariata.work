# M3 Phase 1 Completion Report: Database Schema pentru Plăți

**Date**: 2026-01-02
**Issue**: #81 - Database Schema pentru Plăți
**Status**: ✅ Complete
**Time Estimate**: 6 hours
**Actual Time**: ~1 hour

---

## 🎯 Objectives Completed

Phase 1 of M3 (Integrations & Payments) focused on creating the database foundation for the payments module. All objectives have been successfully completed:

1. ✅ Database migration with `plati` and `chitante` tables
2. ✅ Row Level Security (RLS) policies for multi-tenancy
3. ✅ Performance indexes
4. ✅ API route stubs (5 endpoints)
5. ✅ TypeScript validation schemas

---

## 📦 Deliverables

### 1. Database Migration

**File**: `supabase/migrations/20260102224520_create_plati_chitante.sql`

**Tables Created**:

- **`plati`** (Payments table)
  - Tracks all payment transactions
  - Status machine: `pending` → `processing` → `success`/`failed`/`refunded`
  - External gateway integration (Ghișeul.ro)
  - Multi-tenancy via `judet_id` + `localitate_id`

- **`chitante`** (Receipts table)
  - One-to-one with successful payments
  - Auto-generated receipt numbers (CH-YYYY-NNNNN)
  - PDF storage path

**Key Features**:

- ✅ Foreign key constraints to `cereri`, `utilizatori`, `judete`, `localitati`
- ✅ Check constraints for valid status transitions
- ✅ Auto-update `updated_at` trigger
- ✅ Auto-generate `numar_chitanta` trigger
- ✅ Audit logging for payment status changes
- ✅ Validation: cerere must require payment and amounts must match

**Indexes Created** (9 total):

- `idx_plati_cerere` - Query payments by cerere
- `idx_plati_utilizator` - Query user's payments
- `idx_plati_judet_localitate` - Multi-tenancy filtering
- `idx_plati_status` - Filter by pending/processing
- `idx_plati_transaction` - Lookup by gateway transaction ID
- `idx_plati_created` - Sort by creation date
- `idx_chitante_plata` - One-to-one lookup
- `idx_chitante_numar` - Lookup by receipt number
- `idx_chitante_created` - Sort receipts

**RLS Policies** (6 total):

- **plati**:
  - `plati_own_user` - Citizens see their own payments
  - `plati_create_own` - Citizens can create payments for their cereri
  - `plati_functionar_view` - Officials see all payments in their primarie
  - `plati_no_user_update` - Only system can update (via service role)

- **chitante**:
  - `chitante_own_user` - Citizens see their own receipts
  - `chitante_functionar_view` - Officials see receipts in their primarie
  - `chitante_system_only` - Only system can create/update receipts

---

### 2. API Routes

All routes follow RESTful conventions and existing patterns from `cereri` module.

#### **GET /api/plati**

List user's payments with filters and pagination.

**Query Params**:

- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional): Filter by status
- `date_from`, `date_to` (optional): Date range filter
- `sort` (default: created_at)
- `order` (default: desc)

**Response**:

```json
{
  "success": true,
  "data": {
    "items": [
      /* Payment objects with related cerere data */
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

#### **POST /api/plati**

Initiate new payment.

**Body**:

```json
{
  "cerere_id": "uuid",
  "suma": 50.0,
  "return_url": "https://..."
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "plata_id": "uuid",
    "redirect_url": "/app/plati/{id}/checkout"
  }
}
```

**Validations**:

- ✅ Cerere exists and belongs to user
- ✅ Cerere requires payment
- ✅ Payment not already made
- ✅ Amount matches cerere valoare_plata

#### **GET /api/plati/[id]**

Get payment details including chitanță (if successful).

**Response**:

```json
{
  "success": true,
  "data": {
    "plata": {
      /* Payment object */
    },
    "chitanta": {
      /* Receipt object or null */
    }
  }
}
```

#### **GET /api/plati/[id]/chitanta**

Download chitanță PDF.

**Status**: Stub (returns 501 Not Implemented)
**TODO Phase 3**: Implement PDF download from Supabase Storage

#### **POST /api/webhooks/ghiseul**

Webhook handler for async payment notifications.

**Security**:

- Uses service role key (bypasses RLS)
- TODO Phase 2: Add webhook signature verification

**Body**:

```json
{
  "transaction_id": "GH-2025-12345",
  "status": "success",
  "gateway_response": {},
  "metoda_plata": "card"
}
```

**Actions on Success**:

1. Update payment status
2. Create chitanță record (placeholder PDF for now)
3. Update cerere `plata_efectuata` flag
4. TODO Phase 5: Send email confirmation

**Idempotency**: Prevents duplicate processing of already finalized payments.

---

### 3. Validation Schemas

**File**: `src/lib/validations/plati.ts`

**Schemas**:

- `createPlataSchema` - Payment initiation validation
- `listPlatiQuerySchema` - Query params validation
- `webhookPlataUpdateSchema` - Webhook payload validation

**Enums**:

- `PlataStatus`: pending, processing, success, failed, refunded
- `MetodaPlata`: card, bank_transfer, cash

**Helper Functions**:

- `canRetryPlata()` - Check if payment can be retried
- `isPlataFinalized()` - Check if payment is finalized
- `canRefundPlata()` - Check if payment can be refunded
- `getPlataStatusLabel()` - Romanian status labels
- `getPlataStatusColor()` - Tailwind CSS classes for status badges
- `getMetodaPlataLabel()` - Romanian payment method labels
- `formatSuma()` - Format amount as RON currency

---

## 🔄 Next Steps

### Immediate Actions

1. **Apply Migration** (Boss/QA):

   ```bash
   # Connect to Supabase project
   supabase db push

   # Or manually apply
   psql $DATABASE_URL -f supabase/migrations/20260102224520_create_plati_chitante.sql
   ```

2. **Generate TypeScript Types**:

   ```bash
   pnpm types:generate
   ```

   This will update `src/types/database.types.ts` with new `plati` and `chitante` table types.

3. **Verify Migration**:

   ```sql
   -- Check tables exist
   \dt plati
   \dt chitante

   -- Check RLS enabled
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE tablename IN ('plati', 'chitante');

   -- Check policies
   SELECT tablename, policyname FROM pg_policies
   WHERE tablename IN ('plati', 'chitante');

   -- Check triggers
   SELECT tgname, tgrelid::regclass FROM pg_trigger
   WHERE tgrelid IN ('plati'::regclass, 'chitante'::regclass);
   ```

### Phase 2: Mock Ghișeul.ro Simulator (Next)

**Estimated Time**: 8 hours

**Tasks**:

1. Create mock payment gateway server
2. Implement test card scenarios
3. Build mock checkout page
4. Integrate with API routes (update `POST /api/plati`)
5. Test full payment flow

**Reference**: `docs/M3_IMPLEMENTATION_PLAN.md` - Phase 2

---

## ⚠️ Important Notes

### Security

1. **RLS Enforcement**: All payment data isolated by multi-tenancy (județ + localitate)
2. **User Access Control**: Citizens can only see/create their own payments
3. **System-Only Updates**: Payment status updates ONLY via service role (webhooks)
4. **Webhook Security**: TODO Phase 2 - implement signature verification

### Database Design Decisions

1. **Why separate `chitante` table?**
   - Clear separation of concerns
   - One-to-one relationship with successful payments
   - Prevents nullable fields in `plati` table
   - Easier to query "all receipts" vs "all payments with receipts"

2. **Why `judet_id` + `localitate_id` in `plati`?**
   - Direct multi-tenancy filtering (faster than JOINs)
   - RLS policies can check without joining through cereri → primarii
   - Denormalization for query performance

3. **Why auto-generate `numar_chitanta`?**
   - Guarantees uniqueness
   - Sequential numbering per year (legal requirement)
   - Prevents race conditions in concurrent operations

### Testing Checklist

Before moving to Phase 2:

- [ ] Migration applied successfully
- [ ] Types generated (`pnpm types:generate`)
- [ ] API routes return proper errors for unauthorized access
- [ ] RLS policies prevent cross-tenant data access
- [ ] Triggers auto-generate `numar_chitanta`
- [ ] Status transitions validated (can't modify finalized payments)
- [ ] Audit log records payment status changes

---

## 📊 Statistics

- **Files Created**: 6
  - 1 migration file (520 lines)
  - 4 API route files (~600 lines total)
  - 1 validation schema file (170 lines)

- **Database Objects**:
  - 2 tables
  - 9 indexes
  - 6 RLS policies
  - 4 triggers
  - 4 functions

- **API Endpoints**: 5
  - 3 user-facing (GET list, GET details, POST create)
  - 1 download endpoint (stub)
  - 1 webhook (system-only)

- **Lines of Code**: ~1,400 (excluding comments)

- **Test Coverage**: 0% (E2E tests planned for Phase 7)

---

## ✅ Phase 1 Sign-Off

**Completed By**: ATLAS
**Date**: 2026-01-02
**Status**: Ready for Boss Review & QA

**Next Milestone**: M3 Phase 2 - Mock Ghișeul.ro Simulator (Issue #80 partial)

---

**Phase 1 Complete! 🎉**

The database foundation for payments is now ready. All tables, indexes, RLS policies, and API route stubs are in place. Phase 2 will bring these routes to life with the mock payment gateway integration.
