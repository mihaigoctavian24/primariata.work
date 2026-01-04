# Send SMS Edge Function

Twilio-based SMS notification system for Primăriata platform events.

## Overview

Sends SMS notifications for:

- **Cereri events**: submission, status changes, completion, rejection
- **Payment events**: initiated, completed, failed
- **Signature events**: document signed, batch signature completed

## Configuration

### Environment Variables

Required in Supabase Edge Functions settings:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_PHONE=+40XXXXXXXXX  # Your Twilio phone number
NEXT_PUBLIC_APP_URL=https://primariata.work
```

### Twilio Setup

1. **Create Twilio Account**: https://www.twilio.com/console
2. **Get Phone Number**: Purchase a Romanian phone number (+40)
3. **Get Credentials**: Copy Account SID and Auth Token from Console
4. **Configure Supabase**:
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=ACxxx...
   supabase secrets set TWILIO_AUTH_TOKEN=xxx...
   supabase secrets set TWILIO_FROM_PHONE=+40XXXXXXXXX
   ```

## API Usage

### Endpoint

```
POST https://[project-ref].supabase.co/functions/v1/send-sms
```

### Authentication

Requires Supabase `anon` or `service_role` key in `Authorization` header:

```bash
Authorization: Bearer [your-supabase-key]
```

### Request Body

```typescript
interface SMSRequest {
  type:
    | "cerere_submitted"
    | "status_changed"
    | "cerere_finalizata"
    | "cerere_respinsa"
    | "payment_initiated"
    | "payment_completed"
    | "payment_failed"
    | "document_signed"
    | "batch_signature_completed";
  cerereId?: string; // Required for cerere SMS
  plataId?: string; // Required for payment SMS
  transactionId?: string; // Required for signature SMS
  sessionId?: string; // Required for batch_signature_completed
  toPhone: string; // Romanian format: +40XXXXXXXXX
  toName: string; // Recipient name
}
```

### Phone Number Format

**Romanian phone numbers only:**

- Format: `+40XXXXXXXXX` (10 digits after +40)
- Example: `+40712345678`
- Validates using regex: `/^\+40[0-9]{9}$/`

## Usage Examples

### Cerere Submitted

```typescript
const response = await fetch("https://[project-ref].supabase.co/functions/v1/send-sms", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "cerere_submitted",
    cerereId: "123e4567-e89b-12d3-a456-426614174000",
    toPhone: "+40712345678",
    toName: "Ion Popescu",
  }),
});

const data = await response.json();
// { success: true, message: "SMS sent successfully", sid: "SMxxxxx..." }
```

**SMS Received:**

```
Primariata: Cerere CER-2025-001 înregistrată cu succes. Urmăriți pe https://primariata.work
```

### Payment Completed

```typescript
await fetch("https://[project-ref].supabase.co/functions/v1/send-sms", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "payment_completed",
    plataId: "plata-uuid-here",
    toPhone: "+40712345678",
    toName: "Ion Popescu",
  }),
});
```

**SMS Received:**

```
Primariata: Plată 150.00 RON confirmată! Chitanță CHT-2025-042. Descărcați de pe https://primariata.work
```

### Document Signed

```typescript
await fetch("https://[project-ref].supabase.co/functions/v1/send-sms", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "document_signed",
    transactionId: "sig-uuid-here",
    toPhone: "+40712345678",
    toName: "Ion Popescu",
  }),
});
```

**SMS Received:**

```
Primariata: Document certificat.pdf semnat digital. Descărcați de pe https://primariata.work
```

## SMS Message Templates

All messages are concise (< 160 characters) and include:

- Platform branding: "Primariata:"
- Event description
- Key identifier (cerere number, suma, document name)
- Link to platform for details

### Cerere SMS

| Type                | Template                                                                    |
| ------------------- | --------------------------------------------------------------------------- |
| `cerere_submitted`  | `Primariata: Cerere {numar} înregistrată cu succes. Urmăriți pe {url}`      |
| `status_changed`    | `Primariata: Cerere {numar} actualizată: {status}. Detalii pe {url}`        |
| `cerere_finalizata` | `Primariata: Cerere {numar} finalizată! Descărcați documentele de pe {url}` |
| `cerere_respinsa`   | `Primariata: Cerere {numar} respinsă. Motiv pe {url}`                       |

### Payment SMS

| Type                | Template                                                                        |
| ------------------- | ------------------------------------------------------------------------------- |
| `payment_initiated` | `Primariata: Plată {suma} inițiată. Urmăriți statusul pe {url}`                 |
| `payment_completed` | `Primariata: Plată {suma} confirmată! Chitanță {numar}. Descărcați de pe {url}` |
| `payment_failed`    | `Primariata: Plată {suma} eșuată. Reîncercați pe {url}`                         |

### Signature SMS

| Type                        | Template                                                                     |
| --------------------------- | ---------------------------------------------------------------------------- |
| `document_signed`           | `Primariata: Document {name} semnat digital. Descărcați de pe {url}`         |
| `batch_signature_completed` | `Primariata: Semnare lot finalizată! Toate documentele disponibile pe {url}` |

## Integration with Application

### Trigger SMS on Cerere Submit

```typescript
// src/app/api/cereri/route.ts
export async function POST(request: Request) {
  // ... create cerere logic

  // Send SMS notification
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "cerere_submitted",
      cerereId: newCerere.id,
      toPhone: user.phone, // User's phone from profile
      toName: user.full_name,
    }),
  });

  return Response.json({ success: true, cerere: newCerere });
}
```

### Trigger SMS on Payment Complete

```typescript
// src/app/api/plati/webhook/route.ts
export async function POST(request: Request) {
  const { plataId, status } = await request.json();

  if (status === "completed") {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "payment_completed",
        plataId,
        toPhone: user.phone,
        toName: user.full_name,
      }),
    });
  }

  return Response.json({ success: true });
}
```

### Database Trigger (Alternative)

Create a database trigger to automatically send SMS on status changes:

```sql
CREATE OR REPLACE FUNCTION notify_cerere_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function via HTTP
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-sms',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', 'status_changed',
      'cerereId', NEW.id,
      'toPhone', (SELECT phone FROM users WHERE id = NEW.solicitant_id),
      'toName', (SELECT full_name FROM users WHERE id = NEW.solicitant_id)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_cerere_status_change
  AFTER UPDATE OF status ON cereri
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_cerere_status_change();
```

## Error Handling

### Invalid Phone Number

```json
{
  "error": "Invalid Romanian phone number format. Expected: +40XXXXXXXXX"
}
```

### Missing Twilio Credentials

```json
{
  "error": "Twilio credentials not configured"
}
```

### Twilio API Error

```json
{
  "error": "Failed to send SMS",
  "details": "Twilio error message here"
}
```

### Data Not Found

```json
{
  "error": "Cerere not found"
}
```

## Cost Considerations

### Twilio Pricing (as of 2025)

- **SMS to Romania**: ~$0.05 USD per message
- **Monthly estimate**: 1000 SMS = $50 USD

### Optimization Strategies

1. **Optional SMS**: Allow users to opt-in/opt-out of SMS notifications
2. **Email First**: Use email as primary, SMS for critical events only
3. **Batching**: Group updates to reduce message count
4. **Smart Triggers**: Only send SMS for high-priority events

### User Preferences

Store SMS preferences in user profile:

```sql
ALTER TABLE users ADD COLUMN sms_notifications BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN sms_events TEXT[] DEFAULT ARRAY['cerere_finalizata', 'payment_completed'];
```

Check preferences before sending:

```typescript
const user = await supabase
  .from("users")
  .select("phone, full_name, sms_notifications, sms_events")
  .eq("id", userId)
  .single();

if (user.sms_notifications && user.sms_events.includes(eventType)) {
  // Send SMS
}
```

## Testing

### Local Testing with Twilio Test Credentials

Twilio provides test credentials for development:

```bash
# Test mode credentials (won't send real SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Test SID
TWILIO_AUTH_TOKEN=your_test_token
TWILIO_FROM_PHONE=+15005550006  # Twilio magic number
```

### Invoke Locally

```bash
supabase functions serve send-sms --env-file .env.local
```

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-sms' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --header 'Content-Type: application/json' \
  --data '{"type":"cerere_submitted","cerereId":"test-uuid","toPhone":"+40712345678","toName":"Test User"}'
```

### Deploy to Supabase

```bash
supabase functions deploy send-sms
```

## Monitoring

### Twilio Console

Monitor SMS delivery in Twilio Console:

- Delivery status
- Failed messages
- Cost tracking

### Supabase Logs

View Edge Function logs:

```bash
supabase functions logs send-sms
```

### Database Audit

Create an SMS audit log table:

```sql
CREATE TABLE sms_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  to_phone TEXT NOT NULL,
  to_name TEXT NOT NULL,
  message TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT NOT NULL, -- 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Log all SMS sends in the Edge Function.

## Related Documentation

- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Send Email Edge Function](../send-email/index.ts)

## Support

For issues with Twilio integration:

- Check Twilio Console for delivery status
- Verify phone number format (+40XXXXXXXXX)
- Check Supabase Edge Function logs
- Ensure Twilio credentials are correctly set
