#!/usr/bin/env tsx

/**
 * Test Sentry Integration Monitoring
 *
 * Sends test metrics to Sentry to verify monitoring is working
 *
 * Usage:
 *   tsx scripts/test-sentry-monitoring.ts
 */

import * as Sentry from "@sentry/nextjs";
import {
  trackIntegrationMetrics,
  IntegrationType,
  CertSignOperation,
  GhiseulOperation,
} from "../src/lib/monitoring/integrations";

// Initialize Sentry (using environment variables)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
});

console.log("🚀 Testing Sentry Integration Monitoring...\n");
console.log(`📡 Sentry DSN: ${process.env.NEXT_PUBLIC_SENTRY_DSN?.slice(0, 50)}...`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);

// Test 1: Successful certSIGN operation
console.log("✅ Test 1: Successful certSIGN sign_document");
trackIntegrationMetrics({
  integration: IntegrationType.CERTSIGN,
  operation: CertSignOperation.SIGN_DOCUMENT,
  success: true,
  responseTime: 1234,
  metadata: {
    documentId: "test_doc_123",
    testRun: true,
  },
});

// Test 2: Slow certSIGN operation (should trigger alert)
console.log("⚠️  Test 2: Slow certSIGN operation (>2000ms)");
trackIntegrationMetrics({
  integration: IntegrationType.CERTSIGN,
  operation: CertSignOperation.BATCH_SIGN,
  success: true,
  responseTime: 3456, // Over 2000ms threshold
  metadata: {
    documentCount: 5,
    testRun: true,
  },
});

// Test 3: Failed certSIGN operation
console.log("❌ Test 3: Failed certSIGN operation");
trackIntegrationMetrics({
  integration: IntegrationType.CERTSIGN,
  operation: CertSignOperation.VALIDATE_CERTIFICATE,
  success: false,
  responseTime: 567,
  error: {
    message: "Certificate validation failed",
    code: "CERT_INVALID",
  },
  metadata: {
    certificateId: "test_cert_456",
    testRun: true,
  },
});

// Test 4: Successful Ghișeul.ro operation
console.log("✅ Test 4: Successful Ghișeul.ro create_payment");
trackIntegrationMetrics({
  integration: IntegrationType.GHISEUL,
  operation: GhiseulOperation.CREATE_PAYMENT,
  success: true,
  responseTime: 890,
  metadata: {
    paymentId: "test_payment_789",
    amount: 100.5,
    testRun: true,
  },
});

// Test 5: Failed Ghișeul.ro operation
console.log("❌ Test 5: Failed Ghișeul.ro webhook");
trackIntegrationMetrics({
  integration: IntegrationType.GHISEUL,
  operation: GhiseulOperation.WEBHOOK,
  success: false,
  responseTime: 234,
  error: {
    message: "Invalid webhook signature",
    code: "WEBHOOK_INVALID",
  },
  metadata: {
    webhookId: "test_webhook_012",
    testRun: true,
  },
});

// Flush Sentry events (ensure they're sent before script exits)
setTimeout(async () => {
  console.log("\n📤 Flushing Sentry events...");
  await Sentry.flush(2000);

  console.log("\n✅ Test metrics sent to Sentry!");
  console.log("\n📊 View metrics at:");
  console.log("   https://de.sentry.io/organizations/primariata/metrics/");
  console.log("\n🔍 Search for:");
  console.log("   - integration.operation (counter)");
  console.log("   - integration.response_time (distribution)");
  console.log("\n⏰ Note: Metrics may take 1-2 minutes to appear in Sentry");

  process.exit(0);
}, 1000);
