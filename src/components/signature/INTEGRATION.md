# Signature Integration with Cerere Workflow

## Overview

This document describes how digital signatures are integrated into the Cerere (request) approval workflow.

## Phase 4.6 Implementation

### Citizen View - Document Signature Display

**Location**: `/src/components/cereri/DocumentsList.tsx`

Citizens viewing their cerere details can now see which documents have been digitally signed:

#### Features:

1. **Signature Badge**: Each signed document displays a `SignatureVerificationBadge` showing validity status
2. **Signature Details Button**: Shield icon (🛡️) button opens detailed signature information
3. **Signature Preview Modal**: Full signature details including:
   - Signer name and CNP (masked)
   - Certificate serial number and algorithm
   - Signature timestamp and age
   - Certificate status and validity
   - Mock signature warning
   - Links to signed and original documents

#### Implementation Details:

```typescript
// Fetch signatures for all documents on component mount
useEffect(() => {
  const supabase = createClient();

  // Query signature_audit_log for document paths
  const { data } = await supabase
    .from("signature_audit_log")
    .select("transaction_id, document_url, signed_document_url")
    .in("document_url", documentPaths)
    .eq("status", "success");

  // Create map of document_url -> signature info
  setSignatures(sigMap);
}, [documents]);
```

#### UI Flow:

1. **Document List**: Shows all documents attached to cerere
2. **Signature Badge**: Automatically appears next to signed documents
   - 🟢 Green badge = Valid signature
   - 🟠 Orange badge = Mock signature (development/PoC)
   - 🔴 Red badge = Invalid/revoked signature
3. **View Details**: Click shield icon to open signature preview modal
4. **Download**: Direct link to download signed document

### Database Relationship

```
cereri
  └── documente_cerere (document attachments)
        └── signature_audit_log (signature records)
              ├── document_url → documente_cerere.cale_fisier
              └── signed_document_url → path to signed PDF
```

**Key Fields**:

- `signature_audit_log.transaction_id`: Unique signature identifier
- `signature_audit_log.document_url`: Original document path (matches `documente_cerere.cale_fisier`)
- `signature_audit_log.signed_document_url`: Signed document path in Supabase Storage
- `signature_audit_log.status`: `"success"` for valid signatures

### Funcionari View - Document Signing

**Status**: Not yet implemented (requires funcionari dashboard)

**Planned Features**:

1. Funcionari dashboard with cereri queue
2. Cerere approval workflow with signature step
3. Batch signature support for multiple documents
4. Certificate validation before signing
5. Approval + signature in single action

**Future Implementation** (Phase 4.7 or later):

```typescript
// Funcionari cerere approval page
// src/app/admin/cereri/[id]/page.tsx

<Card>
  <CardHeader>
    <CardTitle>Aprobare Cerere</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Approval form */}
    <Button onClick={handleApproveAndSign}>
      <FileSignature className="mr-2" />
      Aprobă și Semnează
    </Button>
  </CardContent>
</Card>

// Batch signature modal for multiple cereri
<BatchSignatureModal
  documents={approvedCereriDocuments}
  cnp={funcionarCNP}
  batchReason="Aprobare lot cereri depuse în data de..."
  onComplete={handleBatchSignComplete}
/>
```

## Usage Examples

### Checking if Document is Signed

```typescript
import { createClient } from "@/lib/supabase/client";

async function checkDocumentSignature(documentPath: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("signature_audit_log")
    .select("transaction_id, signed_document_url, status")
    .eq("document_url", documentPath)
    .eq("status", "success")
    .single();

  if (data) {
    return {
      isSigned: true,
      transactionId: data.transaction_id,
      signedUrl: data.signed_document_url,
    };
  }

  return { isSigned: false };
}
```

### Displaying Signature Badge

```typescript
import { SignatureVerificationBadge } from "@/components/signature";

function DocumentCard({ document, signature }: DocumentCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>{document.nume_fisier}</span>

          {signature && (
            <SignatureVerificationBadge
              transactionId={signature.transaction_id}
              showDetails={true}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Opening Signature Preview

```typescript
import { SignaturePreview } from "@/components/signature";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function ViewSignatureDetails({ transactionId }: { transactionId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Shield className="mr-2 h-4 w-4" />
        Vezi Semnătură
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <SignaturePreview
            transactionId={transactionId}
            onDownloadSigned={() => {
              window.open(signedUrl, "_blank");
              toast.success("Documentul semnat se descarcă...");
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Security Considerations

### Row Level Security (RLS)

Signature audit logs are protected by RLS policies:

```sql
-- Users can only view signatures for their primarie
CREATE POLICY "Users can view signatures for their primarie"
  ON signature_audit_log FOR SELECT
  USING (
    primarie_id IN (
      SELECT up.primarie_id
      FROM user_primarie_roles up
      WHERE up.user_id = auth.uid()
    )
  );
```

### Mock Signature Warnings

All development signatures include:

- 🔴 **Visual watermark** on PDF: "SEMNĂTURĂ MOCK - NU ESTE VALIDĂ LEGAL"
- ⚠️ **Warning alerts** in UI
- 🟠 **Orange badge** color (vs. green for production signatures)
- `is_mock: true` flag in database

### Certificate Validation

Before displaying signature as valid:

1. Check `signature_audit_log.status = 'success'`
2. Verify `mock_certificates.status IN ('active', 'valid')`
3. Check certificate not expired (`valid_until > NOW()`)
4. Check certificate not revoked

## Testing

### Manual Testing Checklist

✅ **Citizen View**:

- [ ] View cerere with unsigned documents (no badges shown)
- [ ] View cerere with signed documents (badges appear)
- [ ] Click shield icon to view signature details
- [ ] Verify mock signature warning displays
- [ ] Download signed document via modal

✅ **Signature Badge**:

- [ ] Valid signature shows green badge
- [ ] Mock signature shows orange badge
- [ ] Revoked certificate shows red/warning badge
- [ ] Badge tooltip shows signer name and CNP (masked)

✅ **Signature Preview**:

- [ ] All signature details display correctly
- [ ] Certificate status shows correctly
- [ ] Download buttons work for both documents
- [ ] Modal closes properly

### Integration Testing

```typescript
describe("Document Signature Display", () => {
  it("should show signature badge for signed documents", async () => {
    // Setup: Create cerere with signed document
    // Action: Render DocumentsList
    // Assert: Badge appears with correct transaction_id
  });

  it("should open signature preview on shield button click", async () => {
    // Setup: Signed document
    // Action: Click shield icon
    // Assert: Modal opens with SignaturePreview component
  });

  it("should not show signature badge for unsigned documents", async () => {
    // Setup: Cerere with unsigned documents
    // Action: Render DocumentsList
    // Assert: No signature badges appear
  });
});
```

## Performance Considerations

### Signature Fetching Optimization

- **Batch query**: Single query for all documents using `.in(documentPaths)`
- **Client-side caching**: Signatures stored in React state (Map)
- **Lazy loading**: SignaturePreview only fetches details when modal opens

### Database Indexes

Ensure these indexes exist for performance:

```sql
CREATE INDEX idx_signature_audit_document_url ON signature_audit_log(document_url);
CREATE INDEX idx_signature_audit_status ON signature_audit_log(status);
CREATE INDEX idx_signature_audit_transaction_id ON signature_audit_log(transaction_id);
```

## Future Enhancements

### Planned Features:

1. **Funcionari Dashboard** (Priority: High)
   - Queue of cereri awaiting approval
   - Inline signature capability
   - Batch approval + signature workflow

2. **Signature Notifications** (Priority: Medium)
   - Email notification when document is signed
   - Push notification for signature events
   - SMS confirmation for high-value signatures

3. **Advanced Verification** (Priority: Low)
   - QR code on signed PDFs for verification
   - Public verification portal (no login required)
   - Blockchain anchoring for signature timestamps

4. **Signature Analytics** (Priority: Low)
   - Dashboard showing signature statistics
   - Average signing time per cerere type
   - Certificate usage patterns

## Related Documentation

- `/src/lib/signature/README.md` - Service layer documentation
- `/src/components/signature/` - Component API documentation
- `/supabase/migrations/*certsign*.sql` - Database schema
- `.docs/04-mock-services/MOCK_CERTSIGN_SPEC.md` - Mock service specification

## Support

For questions or issues related to signature integration:

- Check Phase 4 implementation logs in project documentation
- Review signature service test suite
- Consult certSIGN API documentation (when using production service)
