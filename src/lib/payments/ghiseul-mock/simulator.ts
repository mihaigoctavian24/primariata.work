/**
 * Payment Simulation Logic
 *
 * Simulates payment processing flows including:
 * - Card processing with realistic delays
 * - Webhook callbacks
 * - Status updates
 * - Error scenarios
 */

import crypto from "crypto";
import type {
  MockTransactionId,
  MockPaymentRequest,
  MockPaymentResponse,
  MockPaymentResult,
  MockWebhookPayload,
  MockTransactionLog,
  TestCardBehavior,
} from "./types";
import type { PaymentStatus } from "../types";
import { getTestCardBehavior, maskCardNumber, getCardLast4 } from "./test-cards";

/**
 * In-memory transaction store (in production, this would be a database)
 * Key: transaction_id, Value: transaction log
 */
const transactionStore = new Map<MockTransactionId, MockTransactionLog>();

/**
 * Generate mock transaction ID
 *
 * Format: GHIS-MOCK-{timestamp}-{random}
 *
 * @returns Unique transaction ID
 */
export function generateTransactionId(): MockTransactionId {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString("hex");
  return `GHIS-MOCK-${timestamp}-${random}`;
}

/**
 * Initiate mock payment
 *
 * Creates a payment session and returns checkout URL.
 *
 * @param request - Payment initiation request
 * @returns Payment response with checkout URL
 */
export function initiatePayment(request: MockPaymentRequest): MockPaymentResponse {
  const transactionId = generateTransactionId();

  // Store initial transaction log
  const log: MockTransactionLog = {
    transaction_id: transactionId,
    cerere_id: request.cerere_id,
    amount: request.amount,
    status: "pending",
    card_number_masked: "****",
    behavior: "success", // Will be updated when card is submitted
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    callback_url: request.callback_url,
    return_url: request.return_url,
  };

  transactionStore.set(transactionId, log);

  // Generate checkout URL (points to our mock checkout page)
  const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/ghiseul-mock/checkout?transaction_id=${transactionId}`;

  // Payment sessions expire after 30 minutes
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return {
    transaction_id: transactionId,
    checkout_url: checkoutUrl,
    expires_at: expiresAt,
    amount: request.amount,
  };
}

/**
 * Process card payment with details (for serverless compatibility)
 *
 * Simulates card processing without relying on in-memory store.
 * Used when payment details come from database instead of memory.
 *
 * @param transactionId - Transaction ID
 * @param cardNumber - Card number
 * @param cardHolder - Card holder name
 * @param amount - Payment amount from database
 * @param callbackUrl - Webhook callback URL
 * @returns Payment result after processing
 */
export async function processCardPaymentWithDetails(
  transactionId: MockTransactionId,
  cardNumber: string,
  __cardHolder: string,
  amount: number,
  callbackUrl: string
): Promise<MockPaymentResult> {
  // Get test card behavior
  const testCard = getTestCardBehavior(cardNumber);

  if (!testCard) {
    // Invalid card number
    return {
      transaction_id: transactionId,
      status: "failed",
      amount,
      payment_method: "card",
      error_code: "invalid_card",
      error_message: "Invalid card number",
      timestamp: new Date().toISOString(),
    };
  }

  // Simulate processing delay
  await sleep(testCard.processingTime);

  // Determine payment result based on card behavior
  const result = generatePaymentResult(transactionId, amount, testCard.behavior, cardNumber);

  // Schedule webhook callback (async, doesn't block)
  scheduleWebhookCallback(transactionId, callbackUrl, result);

  return result;
}

/**
 * Process card payment (legacy - uses in-memory store)
 *
 * Simulates card processing with realistic behavior based on test card.
 *
 * @param transactionId - Transaction ID
 * @param cardNumber - Card number
 * @param cardHolder - Card holder name
 * @returns Payment result after processing
 */
export async function processCardPayment(
  transactionId: MockTransactionId,
  cardNumber: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cardHolder: string
): Promise<MockPaymentResult> {
  const log = transactionStore.get(transactionId);

  if (!log) {
    throw new Error(`Transaction not found: ${transactionId}`);
  }

  // Get test card behavior
  const testCard = getTestCardBehavior(cardNumber);

  if (!testCard) {
    // Invalid card number
    const result: MockPaymentResult = {
      transaction_id: transactionId,
      status: "failed",
      amount: log.amount,
      payment_method: "card",
      error_code: "invalid_card",
      error_message: "Invalid card number",
      timestamp: new Date().toISOString(),
    };

    updateTransactionLog(transactionId, {
      status: "failed",
      card_number_masked: "****",
      behavior: "declined",
    });

    return result;
  }

  // Simulate processing delay
  await sleep(testCard.processingTime);

  // Update transaction log
  updateTransactionLog(transactionId, {
    card_number_masked: maskCardNumber(cardNumber),
    behavior: testCard.behavior,
  });

  // Determine payment result based on card behavior
  const result = generatePaymentResult(transactionId, log.amount, testCard.behavior, cardNumber);

  // Update final status
  updateTransactionLog(transactionId, {
    status: result.status,
  });

  // Schedule webhook callback (async, doesn't block)
  scheduleWebhookCallback(transactionId, log.callback_url, result);

  return result;
}

/**
 * Generate payment result based on card behavior
 *
 * @param transactionId - Transaction ID
 * @param amount - Payment amount
 * @param behavior - Test card behavior
 * @param cardNumber - Card number
 * @returns Payment result
 */
function generatePaymentResult(
  transactionId: MockTransactionId,
  amount: number,
  behavior: TestCardBehavior,
  cardNumber: string
): MockPaymentResult {
  const timestamp = new Date().toISOString();
  const cardLast4 = getCardLast4(cardNumber);

  switch (behavior) {
    case "success":
    case "delayed_success":
    case "timeout":
      return {
        transaction_id: transactionId,
        status: "success",
        amount,
        payment_method: "card",
        card_last4: cardLast4,
        timestamp,
      };

    case "declined":
      return {
        transaction_id: transactionId,
        status: "failed",
        amount,
        payment_method: "card",
        error_code: "insufficient_funds",
        error_message: "Card declined - insufficient funds",
        card_last4: cardLast4,
        timestamp,
      };

    case "expired":
      return {
        transaction_id: transactionId,
        status: "failed",
        amount,
        payment_method: "card",
        error_code: "card_expired",
        error_message: "Card expired",
        card_last4: cardLast4,
        timestamp,
      };

    case "fraud":
      return {
        transaction_id: transactionId,
        status: "failed",
        amount,
        payment_method: "card",
        error_code: "fraud_suspected",
        error_message: "Payment blocked - fraud suspected",
        card_last4: cardLast4,
        timestamp,
      };

    default:
      return {
        transaction_id: transactionId,
        status: "failed",
        amount,
        payment_method: "card",
        error_code: "unknown_error",
        error_message: "Unknown error occurred",
        timestamp,
      };
  }
}

/**
 * Schedule webhook callback
 *
 * Simulates asynchronous webhook notification after a realistic delay.
 *
 * @param transactionId - Transaction ID
 * @param callbackUrl - Webhook URL
 * @param result - Payment result
 */
function scheduleWebhookCallback(
  transactionId: MockTransactionId,
  callbackUrl: string,
  result: MockPaymentResult
): void {
  // Simulate webhook delay (30s to 2 minutes)
  const webhookDelay = Math.floor(Math.random() * 90000) + 30000; // 30-120 seconds

  setTimeout(async () => {
    try {
      await sendWebhook(callbackUrl, transactionId, result);

      // Mark webhook as sent
      updateTransactionLog(transactionId, {
        webhook_sent: true,
        webhook_sent_at: new Date().toISOString(),
      });

      console.log(`[Mock Webhook] Sent to ${callbackUrl} for ${transactionId}`);
    } catch (error) {
      console.error(`[Mock Webhook] Failed to send webhook for ${transactionId}:`, error);
    }
  }, webhookDelay);
}

/**
 * Send webhook to callback URL
 *
 * @param callbackUrl - Webhook URL
 * @param transactionId - Transaction ID
 * @param result - Payment result
 */
async function sendWebhook(
  callbackUrl: string,
  transactionId: MockTransactionId,
  result: MockPaymentResult
): Promise<void> {
  const payload: MockWebhookPayload = {
    event:
      result.status === "success"
        ? "payment.completed"
        : result.status === "processing"
          ? "payment.timeout"
          : "payment.failed",
    transaction_id: transactionId,
    status: result.status,
    amount: result.amount,
    payment_method: "card",
    error_code: result.error_code,
    error_message: result.error_message,
    timestamp: new Date().toISOString(),
    signature: generateWebhookSignature(transactionId, result.status),
  };

  // Send POST request to callback URL
  const response = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ghiseul-Signature": payload.signature,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Generate webhook signature (HMAC)
 *
 * @param transactionId - Transaction ID
 * @param status - Payment status
 * @returns HMAC signature
 */
function generateWebhookSignature(transactionId: string, status: PaymentStatus): string {
  const secret = process.env.GHISEUL_WEBHOOK_SECRET || "webhook_secret_mock";
  const payload = `${transactionId}:${status}`;

  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verify webhook signature
 *
 * @param transactionId - Transaction ID
 * @param status - Payment status
 * @param signature - Provided signature
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
  transactionId: string,
  status: PaymentStatus,
  signature: string
): boolean {
  const expectedSignature = generateWebhookSignature(transactionId, status);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Get payment status
 *
 * @param transactionId - Transaction ID
 * @returns Payment status or null if not found
 */
export function getPaymentStatus(transactionId: MockTransactionId): MockTransactionLog | null {
  return transactionStore.get(transactionId) || null;
}

/**
 * Update transaction log
 *
 * @param transactionId - Transaction ID
 * @param updates - Fields to update
 */
function updateTransactionLog(
  transactionId: MockTransactionId,
  updates: Partial<MockTransactionLog>
): void {
  const log = transactionStore.get(transactionId);

  if (!log) {
    return;
  }

  transactionStore.set(transactionId, {
    ...log,
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

/**
 * Clear expired transactions (cleanup utility)
 *
 * In production, this would be a scheduled job.
 */
export function clearExpiredTransactions(): void {
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();

  for (const [transactionId, log] of transactionStore.entries()) {
    const createdAt = new Date(log.created_at).getTime();

    if (now - createdAt > expirationTime) {
      transactionStore.delete(transactionId);
    }
  }
}

/**
 * Get all transactions (for debugging)
 *
 * @returns All transactions
 */
export function getAllTransactions(): MockTransactionLog[] {
  return Array.from(transactionStore.values());
}

/**
 * Sleep utility
 *
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
