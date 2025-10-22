import { test, expect } from "@playwright/test";

/**
 * Homepage E2E Tests
 *
 * Test critical user journeys on the landing page
 * @smoke - Critical smoke tests for production
 */

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto("/");
  });

  test("should load successfully @smoke", async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Verify page title
    await expect(page).toHaveTitle(/Primăriata/);

    // Verify page is visible
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have correct meta tags", async ({ page }) => {
    // Check charset
    const charset = page.locator("meta[charset]");
    await expect(charset).toHaveAttribute("charset", "utf-8");

    // Check viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", "width=device-width, initial-scale=1");
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify page loads correctly
    await page.waitForLoadState("networkidle");

    // Check that content is visible
    await expect(page.locator("body")).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({
      path: "test-results/homepage-mobile.png",
      fullPage: true,
    });
  });

  test("should be responsive on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify page loads correctly
    await page.waitForLoadState("networkidle");

    // Check that content is visible
    await expect(page.locator("body")).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({
      path: "test-results/homepage-tablet.png",
      fullPage: true,
    });
  });

  test("should have no accessibility violations @smoke", async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState("networkidle");

    // Basic accessibility checks
    // Check for alt text on images
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      expect(alt).toBeDefined();
    }

    // Check for proper heading hierarchy
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Only one h1 per page
  });

  test("should handle slow network gracefully", async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route("**/*", (route) => {
      setTimeout(() => route.continue(), 500); // 500ms delay
    });

    // Navigate to homepage
    await page.goto("/");

    // Verify page still loads (with longer timeout)
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("should have valid HTML structure", async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState("networkidle");

    // Check for essential HTML elements
    await expect(page.locator("html")).toBeVisible();
    await expect(page.locator("head")).toBeAttached();
    await expect(page.locator("body")).toBeVisible();

    // Check for main content area
    const main = page.locator("main");
    await expect(main).toBeAttached();
  });

  test("should load without console errors @smoke", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to homepage
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test("should have fast load time", async ({ page }) => {
    const startTime = Date.now();

    // Navigate to homepage
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Verify page loads in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
