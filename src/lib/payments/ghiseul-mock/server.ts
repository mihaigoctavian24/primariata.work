/**
 * Mock Payment Gateway Server Functions
 *
 * Handles payment initiation, checkout processing, and status queries.
 * Used by API routes to simulate Ghișeul.ro behavior.
 */

import type {
  MockPaymentRequest,
  MockPaymentResponse,
  MockCheckoutFormData,
  MockPaymentResult,
  MockTransactionId,
} from "./types";
import { initiatePayment, processCardPaymentWithDetails, getPaymentStatus } from "./simulator";
import { isValidCardNumber } from "./test-cards";

/**
 * Payment gateway error class
 */
export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "PaymentGatewayError";
  }
}

/**
 * Initialize payment session
 *
 * Creates a payment session and returns checkout URL for user redirection.
 *
 * @param request - Payment initiation request
 * @returns Payment response with checkout URL
 * @throws PaymentGatewayError if validation fails
 */
export async function initializePayment(request: MockPaymentRequest): Promise<MockPaymentResponse> {
  // Validate request
  validatePaymentRequest(request);

  // Add realistic network delay
  await simulateNetworkLatency();

  // Create payment session
  const response = initiatePayment(request);

  console.log(
    `[Mock Gateway] Payment initiated: ${response.transaction_id} for ${request.amount} RON`
  );

  return response;
}

/**
 * Process checkout form submission
 *
 * Processes card payment and returns result.
 *
 * @param formData - Checkout form data
 * @returns Payment result
 * @throws PaymentGatewayError if validation fails
 */
export async function processCheckout(formData: MockCheckoutFormData): Promise<MockPaymentResult> {
  // Validate form data
  validateCheckoutFormData(formData);

  // Validate card number
  if (!isValidCardNumber(formData.card_number)) {
    throw new PaymentGatewayError("Invalid card number", "invalid_card_number");
  }

  // Validate expiry date
  validateExpiryDate(formData.expiry_month, formData.expiry_year.toString());

  // Get payment details from database (not in-memory store - serverless doesn't persist)
  // Import at runtime to avoid circular dependencies
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: plata, error: plataError } = await supabase
    .from("plati")
    .select("id, suma, cerere_id")
    .eq("transaction_id", formData.transaction_id)
    .single();

  if (plataError || !plata) {
    throw new PaymentGatewayError("Payment not found in database", "payment_not_found", 404);
  }

  // Construct callback_url (webhook endpoint)
  const protocol = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https") ? "https" : "http";
  const host = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "localhost:3000";
  const callback_url = `${protocol}://${host}/api/plati/webhook`;

  // Add network latency
  await simulateNetworkLatency();

  // Process payment with database-retrieved details instead of in-memory store
  const result = await processCardPaymentWithDetails(
    formData.transaction_id,
    formData.card_number,
    formData.card_holder,
    plata.suma,
    callback_url
  );

  console.log(
    `[Mock Gateway] Payment processed: ${result.transaction_id} - Status: ${result.status}`
  );

  return result;
}

/**
 * Query payment status
 *
 * Retrieves current status of a payment.
 *
 * @param transactionId - Transaction ID
 * @returns Payment status
 * @throws PaymentGatewayError if transaction not found
 */
export async function queryPaymentStatus(transactionId: MockTransactionId): Promise<{
  transaction_id: MockTransactionId;
  status: string;
  amount: number;
  created_at: string;
  updated_at: string;
}> {
  await simulateNetworkLatency();

  const status = getPaymentStatus(transactionId);

  if (!status) {
    throw new PaymentGatewayError("Transaction not found", "transaction_not_found", 404);
  }

  return {
    transaction_id: status.transaction_id,
    status: status.status,
    amount: status.amount,
    created_at: status.created_at,
    updated_at: status.updated_at,
  };
}

/**
 * Validate payment request
 *
 * @param request - Payment request to validate
 * @throws PaymentGatewayError if validation fails
 */
function validatePaymentRequest(request: MockPaymentRequest): void {
  if (!request.amount || request.amount <= 0) {
    throw new PaymentGatewayError("Invalid amount", "invalid_amount");
  }

  if (!request.cerere_id) {
    throw new PaymentGatewayError("Missing cerere_id", "missing_cerere_id");
  }

  if (!request.return_url || !isValidUrl(request.return_url)) {
    throw new PaymentGatewayError("Invalid return_url", "invalid_return_url");
  }

  if (!request.callback_url || !isValidUrl(request.callback_url)) {
    throw new PaymentGatewayError("Invalid callback_url", "invalid_callback_url");
  }
}

/**
 * Validate checkout form data
 *
 * @param formData - Form data to validate
 * @throws PaymentGatewayError if validation fails
 */
function validateCheckoutFormData(formData: MockCheckoutFormData): void {
  if (!formData.transaction_id) {
    throw new PaymentGatewayError("Missing transaction_id", "missing_transaction_id");
  }

  if (!formData.card_number) {
    throw new PaymentGatewayError("Missing card_number", "missing_card_number");
  }

  if (!formData.card_holder || formData.card_holder.trim().length < 3) {
    throw new PaymentGatewayError("Invalid card_holder", "invalid_card_holder");
  }

  if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
    throw new PaymentGatewayError("Invalid CVV", "invalid_cvv");
  }
}

/**
 * Validate expiry date
 *
 * @param month - Expiry month (01-12)
 * @param year - Expiry year (YY or YYYY)
 * @throws PaymentGatewayError if expired or invalid
 */
function validateExpiryDate(month: string, year: string): void {
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    throw new PaymentGatewayError("Invalid expiry month", "invalid_expiry_month");
  }

  if (isNaN(yearNum)) {
    throw new PaymentGatewayError("Invalid expiry year", "invalid_expiry_year");
  }

  // Convert YY to YYYY
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;

  // Check if expired
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
    throw new PaymentGatewayError("Card expired", "card_expired");
  }

  // Check if too far in future (max 20 years)
  if (fullYear > currentYear + 20) {
    throw new PaymentGatewayError("Invalid expiry year", "invalid_expiry_year");
  }
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns true if valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Simulate network latency
 *
 * Adds realistic delay to simulate network requests to external gateway.
 */
async function simulateNetworkLatency(): Promise<void> {
  // Random delay between 100ms and 500ms
  const delay = Math.floor(Math.random() * 400) + 100;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Generate redirect URL after payment
 *
 * @param returnUrl - Base return URL
 * @param result - Payment result
 * @returns Complete redirect URL with query params
 */
export function generateRedirectUrl(returnUrl: string, result: MockPaymentResult): string {
  const url = new URL(returnUrl);

  url.searchParams.set("transaction_id", result.transaction_id);
  url.searchParams.set("status", result.status);

  if (result.status === "success") {
    url.searchParams.set("payment_id", result.transaction_id);
  } else {
    url.searchParams.set("error", result.error_code || "unknown_error");

    if (result.error_message) {
      url.searchParams.set("error_message", result.error_message);
    }
  }

  return url.toString();
}

/**
 * Log transaction for debugging
 *
 * In production, this would write to a proper logging system.
 *
 * @param level - Log level
 * @param message - Log message
 * @param data - Additional data
 */
export function logTransaction(
  level: "info" | "warn" | "error",
  message: string,
  data?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };

  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log(`[Mock Gateway ${level.toUpperCase()}]`, JSON.stringify(logEntry, null, 2));
  }

  // In production, this would go to a logging service (Sentry, CloudWatch, etc.)
}
