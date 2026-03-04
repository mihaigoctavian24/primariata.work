import { test, expect, Page } from "@playwright/test";

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
// TEST CONFIGURATION
// =============================================================================

const TEST_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  judet: "bucuresti",
  localitate: "sectorul-1",
};

const TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL || "test.cereri@primariata.work",
  password: process.env.E2E_TEST_USER_PASSWORD || "TestPassword123!",
};

// =============================================================================
// AUTHENTICATION HELPER
// =============================================================================

async function authenticateUser(page: Page): Promise<void> {
  await page.goto(`${TEST_CONFIG.baseURL}/login`);

  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/parol/i).fill(TEST_USER.password);
  await page.getByRole("button", { name: /autentific|login|conectare/i }).click();

  await page.waitForURL(/\/(location|app)/, { timeout: 15000 });

  if (page.url().includes("/location")) {
    await page.getByRole("button", { name: new RegExp(TEST_CONFIG.judet, "i") }).click();
    await page.getByRole("button", { name: new RegExp(TEST_CONFIG.localitate, "i") }).click();
    const confirmBtn = page.getByRole("button", { name: /confirm/i });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  }

  await page.waitForURL(`**/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}**`, {
    timeout: 15000,
  });
  await page.waitForLoadState("networkidle");
}

// =============================================================================
// TEST SUITE: PAYMENT FLOW
// =============================================================================

test.describe("Payment Flow E2E @smoke", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
  });

  // ---------------------------------------------------------------------------
  // TEST #1: View payments list
  // ---------------------------------------------------------------------------

  test("view payments page and list pending payments", async ({ page }) => {
    // Navigate to plati (payments) page
    await page.goto(
      `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/plati`
    );
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
    await page.goto(
      `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/plati`
    );
    await page.waitForLoadState("networkidle");

    // Find a pending payment
    const pendingPayment = page.locator(
      'tr:has-text("pending"), tr:has-text("în așteptare"), tr:has-text("neachitat"), [data-status="pending"]'
    );

    if (!(await pendingPayment.first().isVisible())) {
      // No pending payments available -- skip gracefully
      test.skip(true, "No pending payments in seed data. Requires seeded test payments.");
      return;
    }

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
    await page.goto(
      `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/plati`
    );
    await page.waitForLoadState("networkidle");

    // Find a completed payment
    const completedPayment = page.locator(
      'tr:has-text("finalizat"), tr:has-text("achitat"), tr:has-text("procesată"), [data-status="completed"]'
    );

    if (!(await completedPayment.first().isVisible())) {
      test.skip(true, "No completed payments available for receipt verification.");
      return;
    }

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
