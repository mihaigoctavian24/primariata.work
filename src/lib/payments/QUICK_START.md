# Payment Gateway Quick Start

## 5-Minute Setup

### 1. Environment Setup

Add to your `.env.local`:

```env
GHISEUL_MODE=mock
GHISEUL_MOCK_ENABLED=true
GHISEUL_API_KEY=mock_key_12345
GHISEUL_API_URL=https://api.ghiseul.ro
GHISEUL_WEBHOOK_SECRET=webhook_secret_mock
```

### 2. Basic Usage

```typescript
import { getGhiseulClient } from "@/lib/payments";

// Initialize payment
const client = getGhiseulClient();
const response = await client.initiatePayment({
  cerere_id: "cer-123",
  suma: 50.0,
  return_url: "https://yourapp.com/plati/return",
  callback_url: "https://yourapp.com/api/webhooks/ghiseul",
});

// Redirect user
window.location.href = response.redirect_url;
```

### 3. Test Cards

```
Success: 4111 1111 1111 1111
Declined: 4000 0000 0000 0002
Timeout: 4000 0000 0000 0127
```

### 4. Webhook Handler

```typescript
// app/api/webhooks/ghiseul/route.ts
import { getGhiseulClient } from "@/lib/payments";

export async function POST(request: Request) {
  const signature = request.headers.get("X-Ghiseul-Signature");
  const payload = await request.json();

  const client = getGhiseulClient();
  if (!client.verifyWebhook(payload, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Update payment status
  await updatePayment(payload.transaction_id, payload.status);

  return new Response("OK");
}
```

## That's It!

Full documentation: [README.md](./ghiseul-mock/README.md)
