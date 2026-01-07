/**
 * Integration Test Monitoring Helpers
 *
 * Utilities for tracking performance metrics during integration tests
 */

import {
  IntegrationType,
  type OperationType,
  type IntegrationMetrics,
} from "@/lib/monitoring/integrations";

// Store metrics during test execution
const testMetrics: IntegrationMetrics[] = [];

/**
 * Track integration test operation
 */
export function trackTestOperation(metrics: IntegrationMetrics): void {
  testMetrics.push(metrics);

  // Log during tests for visibility
  const status = metrics.success ? "✅" : "❌";
  const time = `${metrics.responseTime}ms`;
  console.log(`${status} [${metrics.integration}] ${metrics.operation}: ${time}`);
}

/**
 * Measure integration test operation
 */
export async function measureTestOperation<T>(
  integration: IntegrationType,
  operation: OperationType,
  fn: () => Promise<T>
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
    };
    throw err;
  } finally {
    const responseTime = Date.now() - startTime;
    trackTestOperation({
      integration,
      operation,
      success,
      responseTime,
      error,
    });
  }
}

/**
 * Get test metrics summary
 */
export function getTestMetricsSummary() {
  if (testMetrics.length === 0) {
    return {
      totalOperations: 0,
      successRate: 0,
      avgResponseTime: 0,
      maxResponseTime: 0,
      failedOperations: 0,
    };
  }

  const successfulOps = testMetrics.filter((m) => m.success).length;
  const totalOps = testMetrics.length;
  const responseTimes = testMetrics.map((m) => m.responseTime);

  return {
    totalOperations: totalOps,
    successRate: (successfulOps / totalOps) * 100,
    avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / totalOps,
    maxResponseTime: Math.max(...responseTimes),
    failedOperations: totalOps - successfulOps,
    byIntegration: {
      certsign: getIntegrationSummary(IntegrationType.CERTSIGN),
      ghiseul: getIntegrationSummary(IntegrationType.GHISEUL),
    },
  };
}

/**
 * Get metrics summary for specific integration
 */
function getIntegrationSummary(integration: IntegrationType) {
  const integrationMetrics = testMetrics.filter((m) => m.integration === integration);

  if (integrationMetrics.length === 0) {
    return { operations: 0, successRate: 0, avgResponseTime: 0 };
  }

  const successfulOps = integrationMetrics.filter((m) => m.success).length;
  const responseTimes = integrationMetrics.map((m) => m.responseTime);

  return {
    operations: integrationMetrics.length,
    successRate: (successfulOps / integrationMetrics.length) * 100,
    avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / integrationMetrics.length,
  };
}

/**
 * Clear test metrics (call in afterAll)
 */
export function clearTestMetrics(): void {
  testMetrics.length = 0;
}

/**
 * Assert response time is within threshold
 */
export function assertResponseTime(
  responseTime: number,
  threshold: number = 2000,
  operation?: string
): void {
  if (responseTime > threshold) {
    const msg = operation
      ? `${operation} exceeded response time threshold: ${responseTime}ms > ${threshold}ms`
      : `Response time exceeded threshold: ${responseTime}ms > ${threshold}ms`;
    console.warn(`⚠️  ${msg}`);
  }
}

/**
 * Print test metrics summary (call in afterAll)
 */
export function printTestMetricsSummary(): void {
  const summary = getTestMetricsSummary();

  if (summary.totalOperations === 0) {
    console.log("\n📊 No integration metrics recorded");
    return;
  }

  console.log("\n📊 Integration Test Metrics Summary");
  console.log("═".repeat(50));
  console.log(`Total Operations: ${summary.totalOperations}`);
  console.log(`Success Rate: ${summary.successRate.toFixed(2)}%`);
  console.log(`Avg Response Time: ${summary.avgResponseTime.toFixed(0)}ms`);
  console.log(`Max Response Time: ${summary.maxResponseTime}ms`);
  console.log(`Failed Operations: ${summary.failedOperations}`);

  console.log("\n📦 By Integration:");
  console.log(`  certSIGN:`);
  console.log(`    Operations: ${summary.byIntegration.certsign.operations}`);
  console.log(`    Success Rate: ${summary.byIntegration.certsign.successRate.toFixed(2)}%`);
  console.log(
    `    Avg Response Time: ${summary.byIntegration.certsign.avgResponseTime.toFixed(0)}ms`
  );

  console.log(`  Ghișeul.ro:`);
  console.log(`    Operations: ${summary.byIntegration.ghiseul.operations}`);
  console.log(`    Success Rate: ${summary.byIntegration.ghiseul.successRate.toFixed(2)}%`);
  console.log(
    `    Avg Response Time: ${summary.byIntegration.ghiseul.avgResponseTime.toFixed(0)}ms`
  );

  console.log("═".repeat(50) + "\n");
}
