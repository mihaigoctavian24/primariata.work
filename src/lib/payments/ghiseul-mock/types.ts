/**
 * Ghișeul.ro Mock Types
 *
 * Types specific to the mock implementation of Ghișeul.ro payment gateway.
 * These mirror the real API structure but are used for testing/development.
 */

import type { PaymentStatus, PaymentErrorCode } from "../types";

/**
 * Mock transaction ID format: GHIS-MOCK-{timestamp}-{random}
 */
export type MockTransactionId = `GHIS-MOCK-${number}-${string}`;

/**
 * Test card behavior types
 */
export type TestCardBehavior =
  | "success" // Instant success
  | "declined" // Card declined
  | "expired" // Expired card
  | "timeout" // Processing timeout (success after delay)
  | "fraud" // Fraud suspected
  | "delayed_success"; // Success after realistic delay

/**
 * Test card definition
 */
export interface TestCard {
  number: string;
  behavior: TestCardBehavior;
  description: string;
  processingTime: number; // milliseconds
  errorCode?: PaymentErrorCode;
}

/**
 * Mock payment request (internal)
 */
export interface MockPaymentRequest {
  amount: number;
  cerere_id: string;
  return_url: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

/**
 * Mock payment response (internal)
 */
export interface MockPaymentResponse {
  transaction_id: MockTransactionId;
  checkout_url: string;
  expires_at: string;
  amount: number;
}

/**
 * Mock checkout form data
 */
export interface MockCheckoutFormData {
  transaction_id: MockTransactionId;
  card_number: string;
  card_holder: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

/**
 * Mock payment result (after processing)
 */
export interface MockPaymentResult {
  transaction_id: MockTransactionId;
  status: PaymentStatus;
  amount: number;
  payment_method: "card";
  error_code?: PaymentErrorCode;
  error_message?: string;
  card_last4?: string;
  timestamp: string;
}

/**
 * Mock webhook payload
 */
export interface MockWebhookPayload {
  event: "payment.completed" | "payment.failed" | "payment.timeout";
  transaction_id: MockTransactionId;
  status: PaymentStatus;
  amount: number;
  payment_method: "card";
  error_code?: PaymentErrorCode;
  error_message?: string;
  timestamp: string;
  signature: string; // HMAC signature for verification
}

/**
 * Mock transaction log entry
 */
export interface MockTransactionLog {
  transaction_id: MockTransactionId;
  cerere_id: string;
  amount: number;
  status: PaymentStatus;
  card_number_masked: string;
  behavior: TestCardBehavior;
  created_at: string;
  updated_at: string;
  callback_url: string;
  return_url: string;
  webhook_sent?: boolean;
  webhook_sent_at?: string;
}

/**
 * Mock gateway configuration
 */
export interface MockGatewayConfig {
  enabled: boolean;
  webhookDelay: {
    min: number; // milliseconds
    max: number; // milliseconds
  };
  networkLatency: {
    min: number; // milliseconds
    max: number; // milliseconds
  };
  successRate: number; // 0-1, for random behavior testing
}
