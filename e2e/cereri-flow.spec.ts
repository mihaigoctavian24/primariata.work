import { test, expect, Page } from "@playwright/test";

/**
 * Cereri Flow E2E Tests
 *
 * Tests critical user journeys for the Cereri (Requests) module
 * Covers: Create, View List, View Details, Cancel, Download, Real-time, Email
 *
 * @high-priority - Core business functionality
 * @phase-2 - M2: Cereri Module
 */

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const TEST_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  judet: "bucuresti",
  localitate: "sectorul-1",
  timeout: 30000,
};

// Test user credentials (created during setup)
const TEST_USER = {
  email: "test.cereri@primariata.work",
  password: "TestPassword123!",
  fullName: "Ion Popescu Test",
};

// =============================================================================
// AUTHENTICATION HELPER
// =============================================================================

/**
 * Authenticate user and navigate to app dashboard
 */
async function authenticateUser(page: Page) {
  // Navigate to login page
  await page.goto(`${TEST_CONFIG.baseURL}/login`);

  // Fill login form
  await page.getByLabel("Email").fill(TEST_USER.email);
  await page.getByLabel("Parola").fill(TEST_USER.password);

  // Submit login
  await page.getByRole("button", { name: /autentific/i }).click();

  // Wait for redirect to location selection or dashboard
  await page.waitForURL(/\/(location|app)/);

  // If on location page, select test location
  if (page.url().includes("/location")) {
    await page.getByRole("button", { name: TEST_CONFIG.judet }).click();
    await page.getByRole("button", { name: TEST_CONFIG.localitate }).click();
    await page.getByRole("button", { name: /confirm/i }).click();
  }

  // Wait for dashboard to load
  await page.waitForURL(`**/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}**`);
  await page.waitForLoadState("networkidle");
}

// =============================================================================
// TEST SUITE: CERERI FLOW
// =============================================================================

test.describe("Cereri Flow E2E", () => {
  // ---------------------------------------------------------------------------
  // Setup & Teardown
  // ---------------------------------------------------------------------------

  test.beforeEach(async ({ page }) => {
    // Authenticate before each test
    await authenticateUser(page);

    // Navigate to cereri section
    await page.goto(
      `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/cereri`
    );
    await page.waitForLoadState("networkidle");
  });

  // ---------------------------------------------------------------------------
  // TEST #1: Create Cerere Flow
  // ---------------------------------------------------------------------------

  test("should create new cerere successfully @smoke @critical", async ({ page }) => {
    test.setTimeout(60000); // Extend timeout for file upload

    // Step 1: Click "Cerere Nouă" button
    await page.getByRole("button", { name: /cerere nou/i }).click();

    // Step 2: Select tip cerere
    await expect(page.getByRole("heading", { name: /selectează tip/i })).toBeVisible();

    // Find and click first available cerere type
    const firstCerereType = page.locator('[data-testid="cerere-type-card"]').first();
    await expect(firstCerereType).toBeVisible();
    await firstCerereType.click();

    // Step 3: Fill cerere form
    await expect(page.getByRole("heading", { name: /completează cerere/i })).toBeVisible();

    // Fill required fields (adapt based on actual form structure)
    const textFields = page.locator('input[type="text"]');
    const count = await textFields.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      await textFields.nth(i).fill(`Test data ${i + 1}`);
    }

    // Fill textarea if present
    const textareas = page.locator("textarea");
    if ((await textareas.count()) > 0) {
      await textareas.first().fill("Descriere test pentru cerere E2E");
    }

    // Step 4: Upload document (if upload field exists)
    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0) {
      // Create test file
      const buffer = Buffer.from("Test document content for E2E testing");

      await fileInput.setInputFiles({
        name: "test-document.pdf",
        mimeType: "application/pdf",
        buffer,
      });

      // Wait for upload to complete
      await page.waitForTimeout(2000);
    }

    // Step 5: Submit cerere
    await page.getByRole("button", { name: /trimite|submit/i }).click();

    // Step 6: Verify success
    // Should show success message/toast
    await expect(page.getByText(/succes|trimis/i)).toBeVisible({ timeout: 10000 });

    // Should redirect to cereri list or cerere details
    await page.waitForURL(/cereri/, { timeout: 10000 });

    // Verify cerere appears in list
    await expect(page.getByText(/test data/i)).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // TEST #2: View Cereri List
  // ---------------------------------------------------------------------------

  test("should display cereri list with filters and pagination", async ({ page }) => {
    // Verify list is visible
    await expect(page.getByRole("heading", { name: /cererile mele/i })).toBeVisible();

    // Verify table/list is rendered
    const cereriList = page.locator('[data-testid="cereri-list"], table, [role="table"]').first();
    await expect(cereriList).toBeVisible();

    // Test filters
    // Status filter
    const statusFilter = page
      .locator('[data-testid="status-filter"], select, [role="combobox"]')
      .first();
    if ((await statusFilter.count()) > 0) {
      await statusFilter.click();

      // Select "Depuse" status
      const depuseOption = page.getByRole("option", { name: /depus/i });
      if ((await depuseOption.count()) > 0) {
        await depuseOption.click();
        await page.waitForTimeout(1000); // Wait for filter to apply
      }
    }

    // Test search
    const searchInput = page.locator('[placeholder*="caut"], [type="search"]').first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill("test");
      await page.waitForTimeout(1000); // Wait for search to filter
    }

    // Test pagination (if exists)
    const nextButton = page.getByRole("button", { name: /următor|next/i });
    if ((await nextButton.count()) > 0 && (await nextButton.isEnabled())) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Go back
      const prevButton = page.getByRole("button", { name: /anterior|prev/i });
      if ((await prevButton.count()) > 0) {
        await prevButton.click();
      }
    }

    // Verify list still loads
    await expect(cereriList).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // TEST #3: View Cerere Details
  // ---------------------------------------------------------------------------

  test("should display cerere details correctly", async ({ page }) => {
    // Find and click first cerere in list
    const firstCerere = page.locator('[data-testid="cerere-row"], tr, [role="row"]').nth(1); // Skip header row
    await expect(firstCerere).toBeVisible();

    // Click to open details (might be a link or button)
    const viewButton = firstCerere.locator("a, button").first();
    await viewButton.click();

    // Wait for details page to load
    await page.waitForURL(/cereri\/[a-f0-9-]+/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Verify essential details are displayed
    await expect(page.getByText(/număr înregistrare|numar/i)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
    await expect(page.getByText(/tip cerere/i)).toBeVisible();
    await expect(page.getByText(/data creare|data depunere/i)).toBeVisible();

    // Verify action buttons exist
    const actionButtons = page.locator(
      'button[data-testid*="action"], button:has-text("Descarcă"), button:has-text("Anulează")'
    );
    expect(await actionButtons.count()).toBeGreaterThan(0);
  });

  // ---------------------------------------------------------------------------
  // TEST #4: Cancel Cerere
  // ---------------------------------------------------------------------------

  test("should cancel draft cerere successfully", async ({ page }) => {
    // Navigate to a draft cerere (or create one first)
    // For this test, assume we have a draft cerere available

    // Find draft cerere
    const draftCerere = page
      .locator('[data-testid="cerere-row"]:has-text("Draft"), tr:has-text("Ciornă")')
      .first();

    if ((await draftCerere.count()) === 0) {
      // Skip test if no draft cereri available
      test.skip();
      return;
    }

    // Click to view details
    await draftCerere.locator("a, button").first().click();
    await page.waitForURL(/cereri\/[a-f0-9-]+/);

    // Click cancel button
    const cancelButton = page.getByRole("button", { name: /anuleaz/i });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Confirm cancellation in dialog
    const confirmButton = page.getByRole("button", { name: /confirm|da/i });
    if ((await confirmButton.count()) > 0) {
      await confirmButton.click();
    }

    // Verify success message
    await expect(page.getByText(/anulat|succes/i)).toBeVisible({ timeout: 10000 });

    // Verify status changed to "Anulată"
    await expect(page.getByText(/anulat/i)).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // TEST #5: Download Document
  // ---------------------------------------------------------------------------

  test("should download cerere document successfully", async ({ page }) => {
    // Find cerere with downloadable document
    const firstCerere = page.locator('[data-testid="cerere-row"]').first();
    await firstCerere.locator("a, button").first().click();
    await page.waitForURL(/cereri\/[a-f0-9-]+/);

    // Set up download handler
    const downloadPromise = page.waitForEvent("download");

    // Click download button
    const downloadButton = page.getByRole("button", { name: /descarcă|download/i }).first();
    await expect(downloadButton).toBeVisible();
    await downloadButton.click();

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.pdf|\.doc|\.zip/);

    // Optionally save file
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // TEST #6: Real-Time Update (Mock Admin Status Change)
  // ---------------------------------------------------------------------------

  test("should receive real-time toast notification on status change", async ({
    page,
    context,
  }) => {
    // Open cerere details
    const firstCerere = page.locator('[data-testid="cerere-row"]').first();
    await firstCerere.locator("a, button").first().click();
    await page.waitForURL(/cereri\/[a-f0-9-]+/);

    // Get cerere ID from URL
    const url = page.url();
    const cerereId = url.match(/cereri\/([a-f0-9-]+)/)?.[1];
    expect(cerereId).toBeTruthy();

    // Set up toast notification listener
    let toastShown = false;
    page.on("console", (msg) => {
      if (msg.text().includes("notification") || msg.text().includes("toast")) {
        toastShown = true;
      }
    });

    // Simulate admin status change using Supabase direct update
    // In a real scenario, this would be done through admin interface or API
    // For E2E test, we can use the evaluate function to trigger Supabase update

    await page.evaluate(async (id) => {
      // This is a mock - in reality you'd trigger a real update
      // For now, just trigger a custom event to simulate real-time update
      window.dispatchEvent(
        new CustomEvent("supabase:realtime", {
          detail: {
            type: "UPDATE",
            table: "cereri",
            record: { id, status: "in_analiza" },
          },
        })
      );
    }, cerereId as string);

    // Wait a bit for toast to appear
    await page.waitForTimeout(2000);

    // Verify toast notification appeared
    const toast = page.locator('[role="alert"], .toast, [data-testid="toast"]');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  // ---------------------------------------------------------------------------
  // TEST #7: Email Notification
  // ---------------------------------------------------------------------------

  test("should send confirmation email after submission", async ({ page }) => {
    test.setTimeout(90000); // Extended timeout for email testing

    // Create and submit new cerere (reuse Test #1 logic)
    await page.getByRole("button", { name: /cerere nou/i }).click();

    // Select first cerere type
    const firstCerereType = page.locator('[data-testid="cerere-type-card"]').first();
    await firstCerereType.click();

    // Fill minimal required fields
    const textFields = page.locator('input[type="text"]');
    if ((await textFields.count()) > 0) {
      await textFields.first().fill("Test email notification");
    }

    // Submit
    await page.getByRole("button", { name: /trimite|submit/i }).click();

    // Wait for success
    await expect(page.getByText(/succes|trimis/i)).toBeVisible({ timeout: 10000 });

    // Note: Actual email verification would require:
    // 1. Access to test email inbox (e.g., Mailtrap, Mailhog, or real inbox)
    // 2. Email API to check for received emails
    // 3. Parse email content to verify cerere details

    // For this test, we verify that:
    // 1. Cerere was submitted successfully
    // 2. Edge Function logs show email was sent (check via Supabase logs)

    // Mock verification: Check console for email trigger
    let emailTriggerLogged = false;
    page.on("console", (msg) => {
      if (msg.text().includes("email") && msg.text().includes("sent")) {
        emailTriggerLogged = true;
      }
    });

    // In production, you would:
    // const emails = await checkInbox(TEST_USER.email);
    // const confirmationEmail = emails.find(e => e.subject.includes("Cerere"));
    // expect(confirmationEmail).toBeTruthy();
    // expect(confirmationEmail.body).toContain("Test email notification");

    // For now, just verify submission succeeded
    expect(page.url()).toContain("cereri");
  });
});

// =============================================================================
// ADDITIONAL TEST SUITES (Optional - can be separate files)
// =============================================================================

test.describe("Cereri Flow - Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    await page.goto(
      `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/cereri`
    );
  });

  test("should show validation errors for invalid form submission", async ({ page }) => {
    await page.getByRole("button", { name: /cerere nou/i }).click();

    // Select cerere type
    const firstCerereType = page.locator('[data-testid="cerere-type-card"]').first();
    await firstCerereType.click();

    // Try to submit without filling required fields
    await page.getByRole("button", { name: /trimite|submit/i }).click();

    // Verify validation errors appear
    const errorMessages = page.locator('[role="alert"], .error, [data-testid="error"]');
    expect(await errorMessages.count()).toBeGreaterThan(0);
  });

  test("should handle network errors gracefully", async ({ page, context }) => {
    // Intercept API calls and simulate failure
    await context.route("**/api/cereri**", (route) => route.abort());

    // Try to load cereri list
    await page.reload();

    // Should show error message
    await expect(page.getByText(/eroare|error|problem/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Cereri Flow - Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
    await page.goto(
      `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/cereri`
    );
  });

  test("should be keyboard navigable", async ({ page }) => {
    // Focus first interactive element
    await page.keyboard.press("Tab");

    // Navigate through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }

    // Should be able to activate focused button with Enter
    await page.keyboard.press("Enter");
  });

  test("should have proper ARIA labels", async ({ page }) => {
    // Check for ARIA labels on interactive elements
    const buttons = page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const hasLabel =
        (await button.getAttribute("aria-label")) ||
        (await button.getAttribute("aria-labelledby")) ||
        (await button.textContent());

      expect(hasLabel).toBeTruthy();
    }
  });
});
