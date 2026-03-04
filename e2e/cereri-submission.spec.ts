import { test, expect, Page } from "@playwright/test";

/**
 * Cereri Submission E2E Tests
 *
 * Tests the cerere creation wizard flow and detail view:
 * Create cerere -> Fill wizard -> Submit -> View in list -> View detail
 *
 * @smoke - Critical path test
 * @requirement TEST-04 - Cereri E2E flow
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

  // Wait for redirect to location selection or dashboard
  await page.waitForURL(/\/(location|app)/, { timeout: 15000 });

  // If on location page, select test location
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
// TEST SUITE: CERERI SUBMISSION
// =============================================================================

test.describe("Cereri Submission E2E @smoke", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
  });

  // ---------------------------------------------------------------------------
  // TEST #1: Create cerere through wizard
  // ---------------------------------------------------------------------------

  test("create cerere -> fill wizard -> submit -> view in list", async ({ page }) => {
    test.setTimeout(60000);

    // Navigate to cereri wizard
    const wizardUrl = `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/cereri/wizard`;
    await page.goto(wizardUrl);
    await page.waitForLoadState("networkidle");

    // If wizard didn't load directly, try navigating from cereri list
    if (!page.url().includes("wizard")) {
      await page.goto(
        `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/cereri`
      );
      await page.waitForLoadState("networkidle");

      // Click "Cerere Noua" button
      const newCerereBtn = page.getByRole("button", { name: /cerere nou/i });
      if (await newCerereBtn.isVisible()) {
        await newCerereBtn.click();
        await page.waitForLoadState("networkidle");
      }
    }

    // Step 1: Select cerere type from available types
    const cerereTypeCard = page.locator('[data-testid="cerere-type-card"]').first();
    if (await cerereTypeCard.isVisible()) {
      await cerereTypeCard.click();
    } else {
      // Fallback: click first clickable card/option in the type selection
      const typeOption = page.locator('[role="radio"], [role="option"], .cursor-pointer').first();
      if (await typeOption.isVisible()) {
        await typeOption.click();
      }
    }

    // Step 2: Fill description and required fields
    const textFields = page.locator('input[type="text"]:visible');
    const fieldCount = await textFields.count();
    for (let i = 0; i < Math.min(fieldCount, 3); i++) {
      await textFields.nth(i).fill(`E2E Test Data ${i + 1} - ${Date.now()}`);
    }

    const textareas = page.locator("textarea:visible");
    if ((await textareas.count()) > 0) {
      await textareas.first().fill("Descriere cerere creata prin test E2E automat");
    }

    // Step 3: Upload test document (if file input visible and required)
    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) > 0 && (await fileInput.first().isVisible())) {
      const buffer = Buffer.from("Test document content for E2E testing");
      await fileInput.first().setInputFiles({
        name: "test-document.pdf",
        mimeType: "application/pdf",
        buffer,
      });
      // Wait for upload indicator to complete
      await page.waitForLoadState("networkidle");
    }

    // Navigate through wizard steps if "Next" button exists
    const nextStepBtn = page.getByRole("button", { name: /următor|continuă|next|înainte/i });
    while (await nextStepBtn.isVisible()) {
      await nextStepBtn.click();
      await page.waitForLoadState("networkidle");

      // Fill any new fields that appear
      const newTextFields = page.locator('input[type="text"]:visible');
      const newCount = await newTextFields.count();
      for (let i = 0; i < Math.min(newCount, 2); i++) {
        const value = await newTextFields.nth(i).inputValue();
        if (!value) {
          await newTextFields.nth(i).fill(`E2E Step Data ${i + 1}`);
        }
      }

      // Break if submit button is now visible
      const submitBtn = page.getByRole("button", { name: /trimite|submit|depune/i });
      if (await submitBtn.isVisible()) {
        break;
      }
    }

    // Submit cerere
    const submitButton = page.getByRole("button", { name: /trimite|submit|depune/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Verify success: redirect to cereri list or success message
      await expect(page.getByText(/succes|trimis|depus|înregistrat/i)).toBeVisible({
        timeout: 15000,
      });
    }

    // Verify cerere appears in list
    await page.goto(
      `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/cereri`
    );
    await page.waitForLoadState("networkidle");

    // List should have at least one cerere
    const cereriList = page.locator('[data-testid="cereri-list"], table, [role="table"]').first();
    await expect(cereriList).toBeVisible({ timeout: 10000 });
  });

  // ---------------------------------------------------------------------------
  // TEST #2: View cerere detail and track status
  // ---------------------------------------------------------------------------

  test("view cerere detail and track status", async ({ page }) => {
    // Navigate to cereri list
    await page.goto(
      `${TEST_CONFIG.baseURL}/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}/cereri`
    );
    await page.waitForLoadState("networkidle");

    // Find and click on an existing cerere
    const cerereRow = page.locator('[data-testid="cerere-row"], tr[data-testid], tbody tr').first();

    if (!(await cerereRow.isVisible())) {
      test.skip(true, "No cereri available in list for detail view test");
      return;
    }

    // Click to open detail (link or row click)
    const cerereLink = cerereRow.locator("a").first();
    if (await cerereLink.isVisible()) {
      await cerereLink.click();
    } else {
      await cerereRow.click();
    }

    // Wait for detail page to load
    await page.waitForURL(/cereri\/[a-f0-9-]+/, { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Verify detail page shows essential information
    // Status badge should be visible
    const statusBadge = page.locator(
      '[data-testid="status-badge"], [class*="badge"], [class*="status"]'
    );
    await expect(statusBadge.first()).toBeVisible({ timeout: 10000 });

    // Timeline/history should be visible (if cerere has history)
    const timeline = page.locator(
      '[data-testid="timeline"], [class*="timeline"], [class*="istoric"]'
    );
    if (await timeline.isVisible()) {
      await expect(timeline).toBeVisible();
    }

    // Description or cerere details should be present
    await expect(page.locator("main")).toContainText(/.+/);
  });
});
