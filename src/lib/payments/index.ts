/**
 * Payments Module - Public API
 *
 * Exports all payment-related functionality for use in API routes and components.
 */

// Main client
export { GhiseulClient, getGhiseulClient, resetGhiseulClient } from "./ghiseul-client";

// Types
export type {
  PaymentStatus,
  PaymentMethod,
  PaymentErrorCode,
  PaymentGatewayConfig,
  Payment,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentCallback,
  PaymentStatusResponse,
} from "./types";

// Mock utilities (for testing)
export {
  TEST_CARDS,
  getTestCardBehavior,
  isValidCardNumber,
  maskCardNumber,
  getCardLast4,
  getCardBrand,
  getAllTestCards,
} from "./ghiseul-mock/test-cards";

export type { TestCard, TestCardBehavior } from "./ghiseul-mock/types";
