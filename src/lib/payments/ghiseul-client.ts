/**
 * Ghișeul.ro Payment Gateway Client
 *
 * Abstraction layer that works with both mock and production implementations.
 * Single interface, automatic routing based on GHISEUL_MODE environment variable.
 */

import type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
  PaymentCallback,
  PaymentGatewayConfig,
  PaymentStatus,
} from "./types";
import type { MockTransactionId } from "./ghiseul-mock/types";

// Mock implementation imports (only used when GHISEUL_MODE=mock)
import { initializePayment, queryPaymentStatus } from "./ghiseul-mock/server";
import { verifyWebhookSignature } from "./ghiseul-mock/simulator";

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

    console.log(`[GhiseulClient] Initialized in ${this.config.mode} mode`);
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
   * Verify webhook signature
   *
   * Validates that webhook callback is authentic.
   *
   * @param payload - Webhook payload
   * @param signature - Provided signature
   * @returns true if signature is valid
   */
  verifyWebhook(payload: PaymentCallback, signature: string): boolean {
    if (this.config.mode === "mock") {
      return this.verifyWebhookMock(payload.transaction_id, payload.status, signature);
    } else {
      return this.verifyWebhookProduction(payload, signature);
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
   */
  private verifyWebhookMock(transactionId: string, status: string, signature: string): boolean {
    return verifyWebhookSignature(transactionId, status as PaymentStatus, signature);
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
   * TODO: Implement when real Ghișeul.ro webhook signature scheme is known
   */
  private verifyWebhookProduction(payload: PaymentCallback, signature: string): boolean {
    // This would implement the real Ghișeul.ro signature verification
    // For now, return false to prevent accepting unverified webhooks
    console.warn("[GhiseulClient] Production webhook verification not implemented");
    return false;
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
