# Ghișeul.ro Mock Payment Gateway

## Overview

This mock implementation simulates the Ghișeul.ro payment gateway for development and testing purposes. It provides realistic payment processing behavior without requiring access to the actual Ghișeul.ro API.

## Why Mock?

- **No API Access**: We don't have Ghișeul.ro merchant account during development
- **Offline Development**: Test payment flows without internet connectivity
- **Predictable Testing**: Specific test cards trigger known behaviors
- **Cost-Free**: No transaction fees during development
- **Fast Iteration**: Instant feedback without external dependencies

## Architecture

```
src/lib/payments/
├── types.ts                    # Shared payment types
├── ghiseul-client.ts           # Abstraction layer (mock + production)
└── ghiseul-mock/
    ├── types.ts                # Mock-specific types
    ├── test-cards.ts           # Test card definitions
    ├── simulator.ts            # Payment processing logic
    ├── server.ts               # Gateway server functions
    └── README.md               # This file
```

## How It Works

### 1. Payment Initiation

```typescript
import { getGhiseulClient } from "@/lib/payments/ghiseul-client";

const client = getGhiseulClient();

const response = await client.initiatePayment({
  cerere_id: "cer-123",
  suma: 50.0,
  return_url: "https://primariata.work/plati/success",
  callback_url: "https://primariata.work/api/webhooks/ghiseul",
});

// Redirect user to checkout page
window.location.href = response.redirect_url;
```

**Response:**

```json
{
  "payment_id": "GHIS-MOCK-1672531200000-a1b2c3d4",
  "transaction_id": "GHIS-MOCK-1672531200000-a1b2c3d4",
  "redirect_url": "http://localhost:3000/api/payments/ghiseul-mock/checkout?transaction_id=...",
  "expires_at": "2025-01-02T13:30:00.000Z"
}
```

### 2. Mock Checkout Page

User is redirected to `/api/payments/ghiseul-mock/checkout` where they can:

1. Enter test card number (see Test Cards section)
2. Enter cardholder name
3. Enter expiry date (any future date)
4. Enter CVV (any 3-4 digits)
5. Submit payment

### 3. Payment Processing

Based on the card number, the mock gateway will:

- Apply realistic processing delay (0.5s - 10s depending on card)
- Return success or failure based on test card behavior
- Redirect user to `return_url` with payment result
- Schedule async webhook callback (30s - 2min delay)

### 4. Webhook Callback

After a realistic delay, the mock gateway will POST to your `callback_url`:

```json
{
  "event": "payment.completed",
  "transaction_id": "GHIS-MOCK-1672531200000-a1b2c3d4",
  "status": "success",
  "amount": 50.0,
  "payment_method": "card",
  "timestamp": "2025-01-02T13:00:00.000Z",
  "signature": "hmac-sha256-signature"
}
```

## Test Cards

### Success Cards

| Card Number           | Behavior             | Processing Time |
| --------------------- | -------------------- | --------------- |
| `4111 1111 1111 1111` | Instant success      | 0.5s            |
| Any other 16 digits   | Success with delay   | 2-4s (random)   |
| `4000 0000 0000 0127` | Timeout then success | 10s             |

### Failure Cards

| Card Number           | Error              | Error Code           |
| --------------------- | ------------------ | -------------------- |
| `4000 0000 0000 0002` | Insufficient funds | `insufficient_funds` |
| `4000 0000 0000 0069` | Card expired       | `card_expired`       |
| `4000 0000 0000 0341` | Fraud suspected    | `fraud_suspected`    |
| `4000 0000 0000 0101` | Generic decline    | `card_declined`      |
| `4000 0000 0000 0259` | Invalid card       | `invalid_card`       |

### Card Validation

- All test cards use **Luhn algorithm** validation
- Expiry date must be in the future
- CVV must be 3-4 digits
- Cardholder name must be at least 3 characters

## Environment Configuration

### .env.local

```env
# Mock Payment Gateway
GHISEUL_MODE=mock                        # Use mock implementation
GHISEUL_MOCK_ENABLED=true
GHISEUL_API_KEY=mock_key_12345
GHISEUL_API_URL=https://api.ghiseul.ro  # Unused in mock mode
GHISEUL_WEBHOOK_SECRET=webhook_secret_mock
```

### Switching to Production

When ready to use the real Ghișeul.ro API:

```env
GHISEUL_MODE=production
GHISEUL_API_KEY=your_real_api_key
GHISEUL_WEBHOOK_SECRET=your_real_webhook_secret
```

**No code changes required** - the abstraction layer (`ghiseul-client.ts`) automatically routes to production implementation.

## Usage Examples

### Example 1: Basic Payment Flow

```typescript
// 1. Initiate payment
const client = getGhiseulClient();
const response = await client.initiatePayment({
  cerere_id: "cer-456",
  suma: 100.0,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/plati/return`,
  callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/ghiseul`,
});

// 2. Store payment record in database
const payment = await createPayment({
  cerere_id: "cer-456",
  transaction_id: response.transaction_id,
  suma: 100.0,
  status: "pending",
});

// 3. Redirect user to checkout
return NextResponse.redirect(response.redirect_url);
```

### Example 2: Webhook Handler

```typescript
// app/api/webhooks/ghiseul/route.ts
import { getGhiseulClient } from "@/lib/payments/ghiseul-client";

export async function POST(request: Request) {
  const signature = request.headers.get("X-Ghiseul-Signature");
  const payload = await request.json();

  // Verify webhook signature
  const client = getGhiseulClient();
  const isValid = client.verifyWebhook(payload, signature);

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Update payment status in database
  await updatePaymentStatus(payload.transaction_id, payload.status);

  // If success, generate receipt
  if (payload.status === "success") {
    await generateChitanta(payload.transaction_id);
  }

  return new Response("OK", { status: 200 });
}
```

### Example 3: Check Payment Status

```typescript
const client = getGhiseulClient();
const status = await client.getPaymentStatus(transactionId);

console.log(`Payment ${status.transaction_id}: ${status.status}`);
// Payment GHIS-MOCK-1672531200000-a1b2c3d4: success
```

## Realistic Behavior

The mock gateway simulates real-world scenarios:

### Network Latency

- API calls include 100-500ms random delay
- Mimics network round-trip time

### Processing Delays

- Card processing takes 0.5s - 10s depending on card
- Success cards: 0.5s - 4s
- Timeout card: exactly 10s
- Failure cards: 0.8s - 2s

### Async Webhooks

- Webhooks sent 30s - 2min after payment completion
- Simulates real gateway's asynchronous notification
- Includes HMAC signature for verification

### Transaction Logging

All transactions stored in-memory (would be database in production):

```typescript
{
  transaction_id: "GHIS-MOCK-1672531200000-a1b2c3d4",
  cerere_id: "cer-123",
  amount: 50.00,
  status: "success",
  card_number_masked: "**** **** **** 1111",
  behavior: "success",
  created_at: "2025-01-02T13:00:00.000Z",
  updated_at: "2025-01-02T13:00:05.000Z",
  webhook_sent: true,
  webhook_sent_at: "2025-01-02T13:01:30.000Z"
}
```

## Security Features

### Webhook Signature Verification

All webhooks include HMAC-SHA256 signature:

```typescript
// Verify incoming webhook
const isValid = client.verifyWebhook(payload, signature);

// Signature format: HMAC-SHA256(transaction_id:status, webhook_secret)
```

### Card Data Masking

Card numbers are automatically masked in logs:

```typescript
import { maskCardNumber } from "@/lib/payments/ghiseul-mock/test-cards";

const masked = maskCardNumber("4111111111111111");
// "**** **** **** 1111"
```

### Input Validation

- Card number: Luhn algorithm validation
- Expiry date: Must be future date
- CVV: 3-4 digits only
- Amount: Must be positive
- URLs: Must be valid HTTP/HTTPS

## Testing Scenarios

### Test Case 1: Successful Payment

1. Initiate payment with cerere
2. Use card `4111 1111 1111 1111`
3. Verify instant success (0.5s)
4. Check redirect to return_url with `status=success`
5. Wait for webhook (30s-2min)
6. Verify payment status updated to `success`
7. Verify receipt generated

### Test Case 2: Declined Payment

1. Initiate payment
2. Use card `4000 0000 0000 0002`
3. Verify failure with `insufficient_funds`
4. Check redirect with `status=failed&error=insufficient_funds`
5. Wait for webhook with `payment.failed` event
6. Verify payment status remains `failed`

### Test Case 3: Timeout Scenario

1. Initiate payment
2. Use card `4000 0000 0000 0127`
3. Wait 10 seconds for processing
4. Verify eventual success
5. Check user sees loading state during delay

### Test Case 4: Expired Card

1. Initiate payment
2. Use card `4000 0000 0000 0069`
3. Verify `card_expired` error
4. Check appropriate error message displayed

## Migration to Production

When ready to use real Ghișeul.ro API:

### Step 1: Update Environment

```env
GHISEUL_MODE=production
GHISEUL_API_KEY=your_real_api_key
GHISEUL_API_URL=https://api.ghiseul.ro
GHISEUL_WEBHOOK_SECRET=your_real_webhook_secret
```

### Step 2: Verify No Code Changes

The abstraction layer automatically switches to production:

```typescript
// This code works for both mock and production
const client = getGhiseulClient();
const response = await client.initiatePayment(request);
```

### Step 3: Update Webhook URL

Configure your production webhook URL in Ghișeul.ro dashboard:

```
https://primariata.work/api/webhooks/ghiseul
```

### Step 4: Test in Staging

1. Deploy to staging environment
2. Run end-to-end tests with real API
3. Verify webhook callbacks work correctly
4. Test all payment scenarios

### Step 5: Production Deployment

1. Update production environment variables
2. Monitor first transactions closely
3. Check Sentry for any integration errors
4. Verify webhooks received and processed

## Troubleshooting

### Webhook Not Received

**Problem**: Webhook callback not arriving after payment

**Solutions**:

- Check `callback_url` is publicly accessible
- Verify webhook delay (30s-2min is normal)
- Check server logs for webhook POST request
- Ensure webhook endpoint returns 200 OK

### Invalid Signature Error

**Problem**: Webhook signature verification fails

**Solutions**:

- Verify `GHISEUL_WEBHOOK_SECRET` matches in both places
- Check signature header name: `X-Ghiseul-Signature`
- Ensure payload not modified before verification
- Use `timing-safe-equal` for comparison

### Payment Status Stuck on Pending

**Problem**: Payment remains `pending` after completion

**Solutions**:

- Check if webhook handler updating status
- Verify database transaction not rolled back
- Check for errors in webhook processing
- Ensure payment ID matches transaction ID

### Mock Not Working

**Problem**: Mock gateway not responding

**Solutions**:

- Verify `GHISEUL_MODE=mock` in environment
- Check `GHISEUL_MOCK_ENABLED=true`
- Restart development server after env changes
- Check console for mock gateway logs

## API Reference

### GhiseulClient

```typescript
class GhiseulClient {
  // Initialize payment session
  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;

  // Get payment status
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;

  // Verify webhook signature
  verifyWebhook(payload: PaymentCallback, signature: string): boolean;

  // Check if in mock mode
  isMockMode(): boolean;
}
```

### Test Card Utilities

```typescript
// Get test card behavior
function getTestCardBehavior(cardNumber: string): TestCard | undefined;

// Validate card number (Luhn algorithm)
function isValidCardNumber(cardNumber: string): boolean;

// Mask card number
function maskCardNumber(cardNumber: string): string;

// Get last 4 digits
function getCardLast4(cardNumber: string): string;

// Determine card brand
function getCardBrand(cardNumber: string): string;

// Get all test cards
function getAllTestCards(): Array<{
  number: string;
  description: string;
  expectedResult: string;
}>;
```

## Logging

Mock gateway logs all operations for debugging:

```
[Mock Gateway] Payment initiated: GHIS-MOCK-1672531200000-a1b2c3d4 for 50.00 RON
[Mock Gateway] Payment processed: GHIS-MOCK-1672531200000-a1b2c3d4 - Status: success
[Mock Webhook] Sent to https://primariata.work/api/webhooks/ghiseul for GHIS-MOCK-1672531200000-a1b2c3d4
```

## Production Considerations

When implementing real Ghișeul.ro integration:

1. **Update Production Methods**: Complete the `initiatePaymentProduction()` and other production methods in `ghiseul-client.ts`
2. **Signature Verification**: Implement real Ghișeul.ro signature verification scheme
3. **Error Handling**: Add production-specific error codes and messages
4. **Rate Limiting**: Implement retry logic for failed API calls
5. **Monitoring**: Add Sentry tracking for payment failures
6. **Compliance**: Ensure PCI DSS compliance for card data handling

## Support

For issues or questions:

- Check M3 Implementation Plan: `docs/M3_IMPLEMENTATION_PLAN.md`
- Review Payment Integration Docs: `.docs/04-mock-services/MOCK_GHISEUL.md`
- Contact: ATLAS (Software Engineering AI Entity)
