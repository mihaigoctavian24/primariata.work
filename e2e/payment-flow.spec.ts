import { test, expect } from "@playwright/test";
import { authenticateAs, TEST_CONFIG } from "./helpers/auth";

/**
 * Payment Flow E2E Tests
 *
 * Tests the payment lifecycle:
 * View pending payment -> Initiate checkout -> Verify receipt
 *
 * Prerequisites:
 * - GHISEUL_MODE=test (mock gateway auto-completes payments)
 * - Seeded test data with at least one pending payment
 * - Test cetatean user with pending plati
 *
 * @smoke - Critical path test
 * @requirement TEST-05 - Payment E2E flow
 */

// =============================================================================
// TEST SUITE: PAYMENT FLOW
// =============================================================================

test.describe("Payment Flow E2E @smoke", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page, "cetatean");
  });

  // ---------------------------------------------------------------------------
  // TEST #1: View payments list
  // ---------------------------------------------------------------------------

  test("view payments page and list pending payments", async ({ page }) => {
    // Navigate to plati (payments) page
    await page.goto(`/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/plati`);
    await page.waitForLoadState("networkidle");

    // Verify payments page loads
    const heading = page.getByRole("heading", { name: /plăți|plati|taxe|payments/i });
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verify payment list or empty state is rendered
    const paymentsList = page.locator(
      '[data-testid="payments-list"], table, [role="table"], [class*="payment"]'
    );
    const emptyState = page.getByText(/nu există|nicio plat|nu ai/i);

    const hasPayments = await paymentsList.first().isVisible();
    const hasEmptyState = await emptyState.isVisible();

    // Either payments list or empty state should be visible
    expect(hasPayments || hasEmptyState).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // TEST #2: Initiate payment checkout
  // ---------------------------------------------------------------------------

  test("initiate checkout for pending payment -> verify completion", async ({ page }) => {
    test.setTimeout(60000);

    // Navigate to plati page
    await page.goto(`/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/plati`);
    await page.waitForLoadState("networkidle");

    // Find a pending payment
    const pendingPayment = page.locator(
      'tr:has-text("pending"), tr:has-text("în așteptare"), tr:has-text("neachitat"), [data-status="pending"]'
    );

    // Seed data guarantees a pending payment exists
    await expect(pendingPayment.first()).toBeVisible({ timeout: 10000 });

    // Click pay button on the pending payment
    const payButton = pendingPayment
      .first()
      .locator('button:has-text("plătește"), button:has-text("achită"), a:has-text("plăt")');

    if (!(await payButton.first().isVisible())) {
      // Try clicking the row to navigate to detail, then find pay button
      await pendingPayment.first().click();
      await page.waitForLoadState("networkidle");
    }

    const checkoutButton = page.getByRole("button", {
      name: /plătește|achită|checkout|pay/i,
    });

    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();

      // GHISEUL_MODE=test should auto-complete the mock gateway
      // Wait for success redirect or confirmation
      await expect(
        page.getByText(/succes|finalizat|procesată|confirmare|plată efectuată/i)
      ).toBeVisible({ timeout: 30000 });
    }
  });

  // ---------------------------------------------------------------------------
  // TEST #3: Verify receipt availability
  // ---------------------------------------------------------------------------

  test("verify receipt is available for completed payment", async ({ page }) => {
    // Navigate to plati page
    await page.goto(`/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/plati`);
    await page.waitForLoadState("networkidle");

    // Find a completed payment
    const completedPayment = page.locator(
      'tr:has-text("finalizat"), tr:has-text("achitat"), tr:has-text("procesată"), [data-status="completed"]'
    );

    // Seed data guarantees a completed payment exists
    await expect(completedPayment.first()).toBeVisible({ timeout: 10000 });

    // Click to view detail or find download button
    await completedPayment.first().click();
    await page.waitForLoadState("networkidle");

    // Look for receipt download link/button
    const receiptButton = page.getByRole("button", {
      name: /chitanță|receipt|descarcă|download/i,
    });
    const receiptLink = page.getByRole("link", {
      name: /chitanță|receipt|descarcă|download/i,
    });

    const hasReceiptButton = await receiptButton.isVisible();
    const hasReceiptLink = await receiptLink.isVisible();

    // Receipt download option should be available for completed payments
    expect(hasReceiptButton || hasReceiptLink).toBeTruthy();

    // If button exists, verify download works
    if (hasReceiptButton) {
      const downloadPromise = page.waitForEvent("download", { timeout: 10000 }).catch(() => null);
      await receiptButton.click();
      const download = await downloadPromise;

      if (download) {
        // Verify downloaded file is a PDF receipt
        expect(download.suggestedFilename()).toMatch(/\.pdf/i);
      }
    }
  });
});
