/**
 * Ghișeul.ro Payment Gateway Client
 *
 * Abstraction layer that works with both mock and production implementations.
 * Single interface, automatic routing based on GHISEUL_MODE environment variable.
 */

import crypto from "crypto";
import { logger } from "@/lib/logger";
import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
  PaymentGatewayConfig,
  PaymentStatus,
} from "./types";
import type { MockTransactionId } from "./ghiseul-mock/types";

// Mock implementation imports (only used when GHISEUL_MODE=mock)
import { initializePayment, queryPaymentStatus } from "./ghiseul-mock/server";
import { verifyWebhookSignature } from "./ghiseul-mock/simulator";

/**
 * Result of webhook signature verification
 */
export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Payment gateway client class
 */
export class GhiseulClient {
  private config: PaymentGatewayConfig;

  constructor(config?: Partial<PaymentGatewayConfig>) {
    this.config = {
      mode: (process.env.GHISEUL_MODE as "mock" | "production") || "mock",
      apiUrl: process.env.GHISEUL_API_URL || "https://api.ghiseul.ro",
      apiKey: process.env.GHISEUL_API_KEY || "mock_key_12345",
      webhookSecret: process.env.GHISEUL_WEBHOOK_SECRET || "webhook_secret_mock",
      ...config,
    };

    logger.debug(`[GhiseulClient] Initialized in ${this.config.mode} mode`);
  }

  /**
   * Initiate payment
   *
   * Creates a payment session and returns checkout URL.
   *
   * @param request - Payment initiation request
   * @returns Payment response with checkout URL
   */
  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (this.config.mode === "mock") {
      return this.initiatePaymentMock(request);
    } else {
      return this.initiatePaymentProduction(request);
    }
  }

  /**
   * Get payment status
   *
   * Queries current payment status from gateway.
   *
   * @param transactionId - Transaction ID
   * @returns Payment status
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    if (this.config.mode === "mock") {
      return this.getPaymentStatusMock(transactionId as MockTransactionId);
    } else {
      return this.getPaymentStatusProduction(transactionId);
    }
  }

  /**
   * Verify webhook signature with HMAC-SHA256 and replay protection
   *
   * In production mode: verifies HMAC-SHA256 signature with timestamp-based replay protection.
   * In mock mode: delegates to the mock verifier (extracts transaction_id and status from payload).
   *
   * @param payload - Raw webhook payload string (for HMAC computation on raw bytes)
   * @param signature - HMAC-SHA256 hex signature from x-ghiseul-signature header
   * @param timestamp - Unix timestamp string from x-ghiseul-timestamp header
   * @returns Verification result with valid flag and optional reason
   */
  verifyWebhook(payload: string, signature: string, timestamp: string): WebhookVerificationResult {
    if (this.config.mode === "mock") {
      return this.verifyWebhookMock(payload, signature);
    } else {
      return this.verifyWebhookProduction(payload, signature, timestamp);
    }
  }

  /**
   * Check if client is in mock mode
   *
   * @returns true if using mock implementation
   */
  isMockMode(): boolean {
    return this.config.mode === "mock";
  }

  // =============================================================================
  // MOCK IMPLEMENTATION
  // =============================================================================

  /**
   * Initiate payment (mock)
   */
  private async initiatePaymentMock(
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    const mockRequest = {
      amount: request.suma,
      cerere_id: request.cerere_id,
      return_url: request.return_url,
      callback_url: request.callback_url,
      metadata: request.metadata,
    };

    const response = await initializePayment(mockRequest);

    return {
      payment_id: response.transaction_id,
      transaction_id: response.transaction_id,
      redirect_url: response.checkout_url,
      expires_at: response.expires_at,
    };
  }

  /**
   * Get payment status (mock)
   */
  private async getPaymentStatusMock(
    transactionId: MockTransactionId
  ): Promise<PaymentStatusResponse> {
    const status = await queryPaymentStatus(transactionId);

    return {
      transaction_id: status.transaction_id,
      status: status.status as PaymentStatusResponse["status"],
      amount: status.amount,
      created_at: status.created_at,
      updated_at: status.updated_at,
    };
  }

  /**
   * Verify webhook (mock)
   *
   * Parses the raw payload to extract transaction_id and status,
   * then delegates to the mock simulator's signature verification.
   */
  private verifyWebhookMock(payload: string, signature: string): WebhookVerificationResult {
    try {
      const parsed = JSON.parse(payload) as { transaction_id: string; status: string };
      const isValid = verifyWebhookSignature(
        parsed.transaction_id,
        parsed.status as PaymentStatus,
        signature
      );
      return { valid: isValid, reason: isValid ? undefined : "Invalid mock signature" };
    } catch {
      return { valid: false, reason: "Failed to parse webhook payload" };
    }
  }

  // =============================================================================
  // PRODUCTION IMPLEMENTATION
  // =============================================================================

  /**
   * Initiate payment (production)
   *
   * TODO: Implement when real Ghișeul.ro API access is available
   */
  private async initiatePaymentProduction(
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    const response = await fetch(`${this.config.apiUrl}/payments/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        amount: request.suma,
        reference_id: request.cerere_id,
        return_url: request.return_url,
        callback_url: request.callback_url,
        metadata: request.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Payment initiation failed: ${response.status} - ${error.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    return {
      payment_id: data.payment_id,
      transaction_id: data.transaction_id,
      redirect_url: data.redirect_url,
      expires_at: data.expires_at,
    };
  }

  /**
   * Get payment status (production)
   *
   * TODO: Implement when real Ghișeul.ro API access is available
   */
  private async getPaymentStatusProduction(transactionId: string): Promise<PaymentStatusResponse> {
    const response = await fetch(`${this.config.apiUrl}/payments/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Payment status query failed: ${response.status} - ${error.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    return {
      transaction_id: data.transaction_id,
      status: data.status,
      amount: data.amount,
      payment_method: data.payment_method,
      error_code: data.error_code,
      error_message: data.error_message,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Verify webhook (production)
   *
   * HMAC-SHA256 signature verification with timestamp-based replay protection.
   * Signed payload format: "{timestamp}.{payload}"
   * Rejects webhooks older than 5 minutes.
   */
  private verifyWebhookProduction(
    payload: string,
    signature: string,
    timestamp: string
  ): WebhookVerificationResult {
    // Replay protection: reject webhooks older than 5 minutes
    const maxAgeSeconds = 300;
    const webhookTime = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);

    if (isNaN(webhookTime) || Math.abs(now - webhookTime) > maxAgeSeconds) {
      return { valid: false, reason: "Webhook timestamp expired or invalid" };
    }

    // Compute expected signature: HMAC-SHA256(secret, "{timestamp}.{payload}")
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.config.webhookSecret)
      .update(signedPayload)
      .digest("hex");

    // Timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return { valid: false, reason: "Signature length mismatch" };
    }

    const isValid = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    return { valid: isValid, reason: isValid ? undefined : "Invalid signature" };
  }
}

/**
 * Singleton instance for convenience
 */
let ghiseulClientInstance: GhiseulClient | null = null;

/**
 * Get Ghișeul client instance
 *
 * Creates singleton instance on first call, reuses on subsequent calls.
 *
 * @returns GhiseulClient instance
 */
export function getGhiseulClient(): GhiseulClient {
  if (!ghiseulClientInstance) {
    ghiseulClientInstance = new GhiseulClient();
  }

  return ghiseulClientInstance;
}

/**
 * Reset client instance (for testing)
 */
export function resetGhiseulClient(): void {
  ghiseulClientInstance = null;
}
