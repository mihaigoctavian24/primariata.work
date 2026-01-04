/**
 * Shared Payment Types
 *
 * Common types used across payment processing system,
 * compatible with both mock and production implementations.
 */

/**
 * Payment status lifecycle
 */
export type PaymentStatus =
  | "pending" // Payment initiated, awaiting user action
  | "processing" // Payment in progress (card processing, bank transfer, etc.)
  | "success" // Payment completed successfully
  | "failed" // Payment failed (insufficient funds, declined, etc.)
  | "refunded"; // Payment refunded

/**
 * Payment method types
 */
export type PaymentMethod =
  | "card" // Card payment (Visa, Mastercard)
  | "bank_transfer" // Bank transfer
  | "cash"; // Cash payment (offline)

/**
 * Error codes from payment gateway
 */
export type PaymentErrorCode =
  | "insufficient_funds"
  | "card_declined"
  | "card_expired"
  | "invalid_card"
  | "processing_error"
  | "timeout"
  | "fraud_suspected"
  | "network_error"
  | "unknown_error";

/**
 * Payment gateway configuration
 */
export interface PaymentGatewayConfig {
  mode: "mock" | "production";
  apiUrl: string;
  apiKey: string;
  webhookSecret: string;
}

/**
 * Database payment record (matches Supabase schema)
 */
export interface Payment {
  id: string;
  cerere_id: string;
  utilizator_id: string;
  judet_id: string;
  localitate_id: string;
  suma: number;
  status: PaymentStatus;
  metoda_plata: PaymentMethod | null;
  transaction_id: string | null;
  gateway_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payment initiation request
 */
export interface PaymentInitiationRequest {
  cerere_id: string;
  suma: number;
  return_url: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payment initiation response
 */
export interface PaymentInitiationResponse {
  payment_id: string;
  transaction_id: string;
  redirect_url: string;
  expires_at: string;
}

/**
 * Payment callback data (from gateway to our webhook)
 */
export interface PaymentCallback {
  transaction_id: string;
  status: PaymentStatus;
  payment_method?: PaymentMethod;
  amount: number;
  timestamp: string;
  error_code?: PaymentErrorCode;
  error_message?: string;
  gateway_metadata?: Record<string, unknown>;
}

/**
 * Payment status check response
 */
export interface PaymentStatusResponse {
  transaction_id: string;
  status: PaymentStatus;
  amount: number;
  payment_method?: PaymentMethod;
  error_code?: PaymentErrorCode;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
