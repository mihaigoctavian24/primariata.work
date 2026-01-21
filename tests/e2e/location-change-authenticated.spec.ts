import { test, expect } from "@playwright/test";

/**
 * E2E Test: Location Change for Authenticated Users
 *
 * Verifies that authenticated users can change their location and the database updates correctly.
 *
 * Test Flow:
 * 1. Login with existing user
 * 2. Navigate to location picker
 * 3. Select new location (Arad, Arad)
 * 4. Verify redirect to dashboard
 * 5. Verify database updated with new location
 */

test.describe("Location Change - Authenticated User", () => {
  test("should update database when authenticated user changes location", async ({ page }) => {
    // Step 1: Login
    await page.goto("http://localhost:3000/auth/login");
    await page.waitForLoadState("networkidle");

    // Fill login form
    await page.fill('input[name="email"]', "octmihai@gmail.com");
    await page.fill('input[name="password"]', "your-password-here"); // Replace with actual password
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL("**/app/**", { timeout: 10000 });

    // Step 2: Navigate to location picker (change location)
    await page.goto("http://localhost:3000/location");
    await page.waitForLoadState("networkidle");

    // Step 3: Select Arad (județ) and Arad (localitate)
    // Wait for județe wheel picker to load
    await page.waitForSelector('[data-testid="judet-wheel-picker"]', { timeout: 5000 });

    // Find and click Arad in județ picker
    await page.click("text=Arad"); // This should select Arad județ

    // Wait for localități to load
    await page.waitForSelector('[data-testid="localitate-wheel-picker"]', { timeout: 5000 });

    // Find and click Arad in localitate picker
    const localitateOptions = page
      .locator('[data-testid="localitate-wheel-picker"] >> text=Arad')
      .first();
    await localitateOptions.click();

    // Submit the form
    await page.click('button[type="submit"]');

    // Step 4: Verify redirect to dashboard with new location
    await page.waitForURL("**/app/arad/arad", { timeout: 10000 });

    // Verify success toast appeared
    await expect(page.locator("text=Locație salvată!")).toBeVisible({ timeout: 5000 });

    // Step 5: Verify database updated (check via API)
    // We'll check the user's location via the profile endpoint
    const response = await page.request.get("http://localhost:3000/api/user/profile");
    const userData = await response.json();

    // Verify location updated to Arad (ID 13806)
    expect(userData.localitate_id).toBe(13806);
    expect(userData.primarie_id).toBeTruthy(); // Should have primarie_id set

    console.log("✅ Database updated successfully:", {
      localitate_id: userData.localitate_id,
      primarie_id: userData.primarie_id,
    });
  });

  test("should show location in dashboard after change", async ({ page }) => {
    // Similar test but focuses on UI verification
    await page.goto("http://localhost:3000/auth/login");
    await page.waitForLoadState("networkidle");

    // Login
    await page.fill('input[name="email"]', "octmihai@gmail.com");
    await page.fill('input[name="password"]', "your-password-here");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/app/**", { timeout: 10000 });

    // Change location
    await page.goto("http://localhost:3000/location");
    await page.waitForLoadState("networkidle");

    // Select Cluj-Napoca
    await page.click("text=Cluj"); // județ
    await page.waitForSelector('[data-testid="localitate-wheel-picker"]', { timeout: 5000 });
    await page.click("text=Cluj-Napoca"); // localitate
    await page.click('button[type="submit"]');

    // Verify redirect
    await page.waitForURL("**/app/cluj/cluj-napoca", { timeout: 10000 });

    // Verify dashboard shows Cluj-Napoca
    await expect(page.locator("text=Cluj-Napoca")).toBeVisible({ timeout: 5000 });
  });
});
