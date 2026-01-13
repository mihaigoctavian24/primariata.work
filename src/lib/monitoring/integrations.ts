/**
 * Integration Monitoring Module
 *
 * Tracks performance and health metrics for external integrations:
 * - certSIGN (document signing)
 * - Ghișeul.ro (payments)
 *
 * Metrics tracked:
 * - Response times
 * - Success/failure rates
 * - Error types and frequencies
 */

import * as Sentry from "@sentry/nextjs";

// Integration types
export enum IntegrationType {
  CERTSIGN = "certsign",
  GHISEUL = "ghiseul",
}

// Operation types for each integration
export enum CertSignOperation {
  SIGN_DOCUMENT = "sign_document",
  BATCH_SIGN = "batch_sign",
  GET_CERTIFICATES = "get_certificates",
  VALIDATE_CERTIFICATE = "validate_certificate",
  VERIFY_SIGNATURE = "verify_signature",
}

export enum GhiseulOperation {
  CREATE_PAYMENT = "create_payment",
  WEBHOOK = "webhook",
  GET_PAYMENT = "get_payment",
  LIST_PAYMENTS = "list_payments",
}

export type OperationType = CertSignOperation | GhiseulOperation;

// Integration metrics
export interface IntegrationMetrics {
  integration: IntegrationType;
  operation: OperationType;
  success: boolean;
  responseTime: number; // milliseconds
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

// Response time thresholds (in ms)
const RESPONSE_TIME_THRESHOLDS = {
  [IntegrationType.CERTSIGN]: 2000, // 2s target
  [IntegrationType.GHISEUL]: 2000, // 2s target
};

/**
 * Track integration operation metrics
 */
export function trackIntegrationMetrics(metrics: IntegrationMetrics): void {
  const { integration, operation, success, responseTime, error, metadata } = metrics;

  // TODO: Refactor metrics tracking in #99 - Enhanced Error Tracking
  // Sentry metrics API changed in recent versions
  // Track integration event with custom context for now
  Sentry.captureEvent({
    message: `Integration: ${integration}.${operation}`,
    level: "info",
    tags: {
      integration,
      operation,
      success: success.toString(),
    },
    contexts: {
      integration_metrics: {
        integration,
        operation,
        success,
        response_time_ms: responseTime,
        ...metadata,
      },
    },
  });

  // Alert if response time exceeds threshold
  const threshold = RESPONSE_TIME_THRESHOLDS[integration];
  if (responseTime > threshold) {
    Sentry.captureMessage(`Slow integration response: ${integration}.${operation}`, {
      level: "warning",
      tags: {
        integration,
        operation,
      },
      extra: {
        responseTime,
        threshold,
        metadata,
      },
    });
  }

  // Capture errors
  if (!success && error) {
    Sentry.captureException(new Error(error.message), {
      tags: {
        integration,
        operation,
      },
      extra: {
        errorCode: error.code,
        responseTime,
        metadata,
      },
    });
  }

  // Log for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log(`[Integration Metrics] ${integration}.${operation}`, {
      success,
      responseTime: `${responseTime}ms`,
      error: error?.message,
    });
  }
}

/**
 * Measure integration operation with automatic metrics tracking
 */
export async function measureIntegrationOperation<T>(
  integration: IntegrationType,
  operation: OperationType,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();
  let success = false;
  let error: IntegrationMetrics["error"] | undefined;

  try {
    const result = await fn();
    success = true;
    return result;
  } catch (err) {
    success = false;
    error = {
      message: err instanceof Error ? err.message : String(err),
      code: err instanceof Error && "code" in err ? String(err.code) : undefined,
      stack: err instanceof Error ? err.stack : undefined,
    };
    throw err;
  } finally {
    const responseTime = Date.now() - startTime;
    trackIntegrationMetrics({
      integration,
      operation,
      success,
      responseTime,
      error,
      metadata,
    });
  }
}

/**
 * Calculate daily success rate for an integration
 * Note: This requires custom Sentry queries or external analytics
 */
export interface IntegrationHealthMetrics {
  integration: IntegrationType;
  successRate: number; // 0-100
  avgResponseTime: number; // milliseconds
  totalOperations: number;
  failedOperations: number;
  period: "24h" | "7d" | "30d";
}

/**
 * Generate alert configuration for integration monitoring
 */
export function getIntegrationAlertConfig() {
  return {
    // Alert if success rate drops below 95% in last hour
    successRate: {
      threshold: 95,
      window: "1h",
      integrations: [IntegrationType.CERTSIGN, IntegrationType.GHISEUL],
    },
    // Alert if response time p95 exceeds 2s
    responseTime: {
      threshold: 2000,
      percentile: 95,
      window: "15m",
      integrations: [IntegrationType.CERTSIGN, IntegrationType.GHISEUL],
    },
    // Alert on error spike (>10 errors in 5 minutes)
    errorSpike: {
      threshold: 10,
      window: "5m",
      integrations: [IntegrationType.CERTSIGN, IntegrationType.GHISEUL],
    },
  };
}
