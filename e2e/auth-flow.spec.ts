import { test, expect } from "@playwright/test";

/**
 * Auth Flow E2E Tests
 *
 * Tests the complete authentication lifecycle:
 * Register -> Verify page -> Login -> Dashboard -> Logout
 *
 * @smoke - Critical path test
 * @requirement TEST-06 - Auth E2E flow
 */

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const TEST_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  judet: "bucuresti",
  localitate: "sectorul-1",
};

// Test user credentials from environment (set in .env.local or CI)
const TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL || "test.cereri@primariata.work",
  password: process.env.E2E_TEST_USER_PASSWORD || "TestPassword123!",
  fullName: "E2E Test User",
};

// =============================================================================
// TEST SUITE: AUTH FLOW
// =============================================================================

test.describe("Auth Flow E2E @smoke", () => {
  test.describe.configure({ mode: "serial" });

  // ---------------------------------------------------------------------------
  // TEST #1: Registration Flow
  // ---------------------------------------------------------------------------

  test("register new account and reach verification page", async ({ page }) => {
    // Navigate to registration page
    await page.goto(`${TEST_CONFIG.baseURL}/auth/register`);
    await page.waitForLoadState("networkidle");

    // Verify registration form is visible
    const heading = page.getByRole("heading", { name: /înregistrare|cont nou|register|creează/i });
    await expect(heading).toBeVisible();

    // Fill registration form with unique email to avoid conflicts
    const uniqueEmail = `e2e.test.${Date.now()}@primariata.work`;

    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    await emailInput.fill(uniqueEmail);

    const nameInput = page.getByLabel(/nume/i).first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(TEST_USER.fullName);
    }

    const passwordInput = page.getByLabel(/parol/i).first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(TEST_USER.password);

    // Confirm password field (if present)
    const confirmPasswordInput = page.getByLabel(/confirm/i);
    if (await confirmPasswordInput.isVisible()) {
      await confirmPasswordInput.fill(TEST_USER.password);
    }

    // Check terms & privacy policy checkbox (added in Phase 08-01)
    const termsCheckbox = page.getByRole("checkbox").first();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // Submit registration form
    const submitButton = page.getByRole("button", {
      name: /înregistrare|creează|register|trimite/i,
    });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Verify redirect to verification/success page or confirmation message
    await expect(page.getByText(/verificare|confirmare|email trimis|verif|succes/i)).toBeVisible({
      timeout: 15000,
    });
  });

  // ---------------------------------------------------------------------------
  // TEST #2: Login Flow
  // ---------------------------------------------------------------------------

  test("login with existing credentials and reach dashboard", async ({ page }) => {
    // Navigate to login page
    await page.goto(`${TEST_CONFIG.baseURL}/login`);
    await page.waitForLoadState("networkidle");

    // Verify login form is visible
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Fill login form
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/parol/i).fill(TEST_USER.password);

    // Submit login
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

    // Wait for dashboard to load
    await page.waitForURL(`**/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}**`, {
      timeout: 15000,
    });

    // Verify dashboard content is visible
    await expect(page.locator("body")).toContainText(/dashboard|panou|bun venit/i);
  });

  // ---------------------------------------------------------------------------
  // TEST #3: Logout Flow
  // ---------------------------------------------------------------------------

  test("logout and redirect to landing page", async ({ page }) => {
    // First login
    await page.goto(`${TEST_CONFIG.baseURL}/login`);
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/parol/i).fill(TEST_USER.password);
    await page.getByRole("button", { name: /autentific|login|conectare/i }).click();

    // Wait for authenticated state
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

    await page.waitForURL(`**/app/**`, { timeout: 15000 });

    // Navigate to logout
    await page.goto(`${TEST_CONFIG.baseURL}/auth/logout`);

    // Verify redirect to landing page or login
    await page.waitForURL(/\/(login)?$/, { timeout: 15000 });

    // Verify user is no longer authenticated (landing page or login page visible)
    const isLanding = await page.getByText(/primăria|digitalizare|landing/i).isVisible();
    const isLogin = await page.getByLabel(/email/i).isVisible();
    expect(isLanding || isLogin).toBeTruthy();
  });
});
