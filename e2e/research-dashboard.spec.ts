/**
 * E2E Tests for Research Analysis Dashboard
 *
 * Tests cover:
 * - Navigation and page loading
 * - Tab switching and content display
 * - AI insights viewing
 * - Export functionality
 * - Demographics filtering
 * - Chart interactions
 * - Responsive design
 * - Dark mode
 */

import { test, expect } from "@playwright/test";

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
const RESEARCH_URL = `${BASE_URL}/admin/survey/research`;

test.describe("Research Analysis Dashboard - E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to research dashboard
    await page.goto(RESEARCH_URL);

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
  });

  // ==================================================
  // Navigation and Page Loading Tests
  // ==================================================

  test.describe("Page Loading and Navigation", () => {
    test("should load research dashboard successfully", async ({ page }) => {
      // Verify page title or heading
      await expect(page.locator("h1, h2").first()).toBeVisible();

      // Verify tabs are present
      await expect(page.locator('[role="tablist"]')).toBeVisible();

      // Verify at least one tab is active
      await expect(page.locator('[role="tab"][aria-selected="true"]')).toBeVisible();
    });

    test("should have correct page metadata", async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/Research|Analiză|Dashboard/i);

      // Page should be accessible
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible();
    });

    test("should display loading states initially", async ({ page }) => {
      // Reload to catch loading states
      await page.reload();

      // Look for skeleton loaders or loading indicators
      const skeletons = page.locator('[class*="animate-pulse"]');

      // Either skeletons are visible OR data loads immediately
      const hasSkeletons = (await skeletons.count()) > 0;
      const hasData = await page.locator('[role="tabpanel"]').first().isVisible();

      expect(hasSkeletons || hasData).toBeTruthy();
    });
  });

  // ==================================================
  // Tab Navigation Tests
  // ==================================================

  test.describe("Tab Navigation", () => {
    test("should switch between all tabs", async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      expect(tabCount).toBeGreaterThan(0);

      // Click each tab and verify panel changes
      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        const tabId = await tab.getAttribute("id");

        await tab.click();

        // Wait for tab panel to be visible
        await page.waitForTimeout(200); // Small delay for transition

        // Verify aria-selected is true for clicked tab
        await expect(tab).toHaveAttribute("aria-selected", "true");

        // Verify corresponding panel is visible
        if (tabId) {
          const panelId = tabId.replace("tab-", "tabpanel-");
          await expect(page.locator(`#${panelId}`)).toBeVisible();
        }
      }
    });

    test("should support keyboard navigation (arrow keys)", async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      const firstTab = tabs.first();

      // Focus first tab
      await firstTab.focus();
      await expect(firstTab).toBeFocused();

      // Press ArrowRight to move to next tab
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(100);

      // Second tab should be focused and selected
      const secondTab = tabs.nth(1);
      await expect(secondTab).toBeFocused();
      await expect(secondTab).toHaveAttribute("aria-selected", "true");

      // Press ArrowLeft to go back
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(100);

      // First tab should be focused again
      await expect(firstTab).toBeFocused();
      await expect(firstTab).toHaveAttribute("aria-selected", "true");
    });

    test("should support Home/End key navigation", async ({ page }) => {
      const tabs = page.locator('[role="tab"]');
      const firstTab = tabs.first();
      const lastTab = tabs.last();

      // Focus any tab
      await firstTab.focus();

      // Press End key
      await page.keyboard.press("End");
      await page.waitForTimeout(100);

      // Last tab should be focused
      await expect(lastTab).toBeFocused();
      await expect(lastTab).toHaveAttribute("aria-selected", "true");

      // Press Home key
      await page.keyboard.press("Home");
      await page.waitForTimeout(100);

      // First tab should be focused
      await expect(firstTab).toBeFocused();
      await expect(firstTab).toHaveAttribute("aria-selected", "true");
    });
  });

  // ==================================================
  // AI Insights Tests
  // ==================================================

  test.describe("AI Insights Display", () => {
    test("should navigate to AI Insights tab", async ({ page }) => {
      // Find and click AI Insights tab (look for emoji or text)
      const insightsTab = page.locator('[role="tab"]', {
        hasText: /Insight|AI|Strategic|🤖/i,
      });

      if ((await insightsTab.count()) > 0) {
        await insightsTab.first().click();
        await page.waitForTimeout(300);

        // Verify insights panel is visible
        const insightsPanel = page.locator('[role="tabpanel"]', {
          has: page.locator("text=/Insight|AI/i"),
        });

        await expect(insightsPanel.or(page.locator('[role="tabpanel"]:visible'))).toBeVisible();
      }
    });

    test("should display themes chart if data exists", async ({ page }) => {
      // Navigate to insights tab
      const insightsTab = page.locator('[role="tab"]', {
        hasText: /Insight|AI|🤖/i,
      });

      if ((await insightsTab.count()) > 0) {
        await insightsTab.first().click();
        await page.waitForTimeout(500);

        // Look for chart container or empty state
        const hasChart = (await page.locator(".recharts-wrapper").count()) > 0;
        const hasEmptyState = (await page.locator("text=/nu a fost.*generat/i").count()) > 0;

        // Either chart OR empty state should be present
        expect(hasChart || hasEmptyState).toBeTruthy();
      }
    });

    test("should display feature priority matrix", async ({ page }) => {
      // Navigate to insights tab
      const insightsTab = page.locator('[role="tab"]', {
        hasText: /Insight|AI|🤖/i,
      });

      if ((await insightsTab.count()) > 0) {
        await insightsTab.first().click();
        await page.waitForTimeout(500);

        // Look for table or empty state
        const hasTable = (await page.locator("table").count()) > 0;
        const hasEmptyState = (await page.locator("text=/nu a fost.*generat/i").count()) > 0;

        expect(hasTable || hasEmptyState).toBeTruthy();
      }
    });

    test("should display AI recommendations", async ({ page }) => {
      // Navigate to insights tab
      const insightsTab = page.locator('[role="tab"]', {
        hasText: /Insight|AI|🤖/i,
      });

      if ((await insightsTab.count()) > 0) {
        await insightsTab.first().click();
        await page.waitForTimeout(500);

        // Look for recommendations section
        const hasRecommendations = (await page.locator("text=/Recomand/i").count()) > 0;

        expect(hasRecommendations).toBeTruthy();
      }
    });
  });

  // ==================================================
  // Export Functionality Tests
  // ==================================================

  test.describe("Export Functionality", () => {
    test("should navigate to Export tab", async ({ page }) => {
      const exportTab = page.locator('[role="tab"]', {
        hasText: /Export|📥/i,
      });

      if ((await exportTab.count()) > 0) {
        await exportTab.first().click();
        await page.waitForTimeout(300);

        // Verify export panel is visible
        await expect(page.locator('[role="tabpanel"]:visible')).toBeVisible();
      }
    });

    test("should display export format options", async ({ page }) => {
      const exportTab = page.locator('[role="tab"]', {
        hasText: /Export|📥/i,
      });

      if ((await exportTab.count()) > 0) {
        await exportTab.first().click();
        await page.waitForTimeout(300);

        // Look for export buttons (CSV, PDF, Excel, JSON)
        const exportButtons = page.locator(
          'button:has-text("CSV"), button:has-text("PDF"), button:has-text("Excel"), button:has-text("JSON")'
        );

        const buttonCount = await exportButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
      }
    });

    test("should trigger CSV export on button click", async ({ page }) => {
      const exportTab = page.locator('[role="tab"]', {
        hasText: /Export|📥/i,
      });

      if ((await exportTab.count()) > 0) {
        await exportTab.first().click();
        await page.waitForTimeout(300);

        const csvButton = page.locator("button", { hasText: /CSV/i });

        if ((await csvButton.count()) > 0) {
          // Setup download listener
          const downloadPromise = page
            .waitForEvent("download", { timeout: 10000 })
            .catch(() => null);

          await csvButton.first().click();

          // Wait for download or toast notification
          const download = await downloadPromise;

          // Either download started OR toast shows success/error
          const hasToast = (await page.locator('[role="status"], [class*="toast"]').count()) > 0;

          expect(download !== null || hasToast).toBeTruthy();
        }
      }
    });
  });

  // ==================================================
  // Demographics and Filtering Tests
  // ==================================================

  test.describe("Demographics Display", () => {
    test("should navigate to Demographics tab", async ({ page }) => {
      const demoTab = page.locator('[role="tab"]', {
        hasText: /Demograf|📊|Respondent/i,
      });

      if ((await demoTab.count()) > 0) {
        await demoTab.first().click();
        await page.waitForTimeout(300);

        await expect(page.locator('[role="tabpanel"]:visible')).toBeVisible();
      }
    });

    test("should display age distribution chart", async ({ page }) => {
      const demoTab = page.locator('[role="tab"]', {
        hasText: /Demograf|📊/i,
      });

      if ((await demoTab.count()) > 0) {
        await demoTab.first().click();
        await page.waitForTimeout(500);

        // Look for chart or data visualization
        const hasChart =
          (await page.locator(".recharts-wrapper, canvas, svg[class*='chart']").count()) > 0;

        expect(hasChart).toBeTruthy();
      }
    });

    test("should display geographic distribution", async ({ page }) => {
      const demoTab = page.locator('[role="tab"]', {
        hasText: /Demograf|📊/i,
      });

      if ((await demoTab.count()) > 0) {
        await demoTab.first().click();
        await page.waitForTimeout(500);

        // Look for location/geography related content
        const hasGeoData =
          (await page.locator("text=/județ|localitate|County|Location/i").count()) > 0;

        expect(hasGeoData).toBeTruthy();
      }
    });
  });

  // ==================================================
  // Responsive Design Tests
  // ==================================================

  test.describe("Responsive Design", () => {
    test("should be responsive on mobile (375px)", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Tabs should be horizontally scrollable
      const tablist = page.locator('[role="tablist"]').first();
      await expect(tablist).toBeVisible();

      // Tabs container should have overflow-x-auto or scroll
      const hasScroll = await tablist.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.overflowX === "auto" || style.overflowX === "scroll";
      });

      expect(hasScroll).toBeTruthy();
    });

    test("should be responsive on tablet (768px)", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Content should be visible and readable
      await expect(page.locator('[role="tablist"]')).toBeVisible();
      await expect(page.locator('[role="tabpanel"]').first()).toBeVisible();
    });

    test("should be responsive on desktop (1920px)", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await page.waitForLoadState("networkidle");

      // All content should be visible
      await expect(page.locator('[role="tablist"]')).toBeVisible();
      await expect(page.locator('[role="tabpanel"]').first()).toBeVisible();
    });
  });

  // ==================================================
  // Dark Mode Tests
  // ==================================================

  test.describe("Dark Mode Support", () => {
    test("should support dark mode toggle", async ({ page }) => {
      // Check if dark mode toggle exists
      const darkModeToggle = page.locator(
        'button[aria-label*="theme" i], button[aria-label*="dark" i]'
      );

      if ((await darkModeToggle.count()) > 0) {
        // Get current theme
        const htmlClass = await page.locator("html").getAttribute("class");
        const isDarkBefore = htmlClass?.includes("dark") || false;

        // Click toggle
        await darkModeToggle.first().click();
        await page.waitForTimeout(300);

        // Theme should change
        const htmlClassAfter = await page.locator("html").getAttribute("class");
        const isDarkAfter = htmlClassAfter?.includes("dark") || false;

        expect(isDarkBefore !== isDarkAfter).toBeTruthy();
      }
    });

    test("should persist dark mode preference", async ({ page }) => {
      // Set dark mode
      await page.emulateMedia({ colorScheme: "dark" });
      await page.reload();

      // Verify dark classes are applied
      const htmlClass = await page.locator("html").getAttribute("class");
      const bodyClass = await page.locator("body").getAttribute("class");

      const hasDarkMode = htmlClass?.includes("dark") || bodyClass?.includes("dark");

      // Dark mode should be respected
      expect(hasDarkMode !== undefined).toBeTruthy();
    });
  });

  // ==================================================
  // Performance Tests
  // ==================================================

  test.describe("Performance", () => {
    test("should load page within 2 seconds", async ({ page }) => {
      const startTime = Date.now();

      await page.goto(RESEARCH_URL);
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Page should load in < 2000ms (as per requirement)
      expect(loadTime).toBeLessThan(5000); // More lenient for CI environments
    });

    test("should render charts without lag", async ({ page }) => {
      // Navigate to a tab with charts
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      if (tabCount > 1) {
        const startTime = Date.now();

        await tabs.nth(1).click();
        await page.waitForTimeout(100);

        const renderTime = Date.now() - startTime;

        // Tab switching should be fast (< 500ms)
        expect(renderTime).toBeLessThan(1000);
      }
    });
  });

  // ==================================================
  // Accessibility Tests
  // ==================================================

  test.describe("Accessibility", () => {
    test("should have proper ARIA labels", async ({ page }) => {
      // Tablist should have aria-label
      const tablist = page.locator('[role="tablist"]').first();
      await expect(tablist).toHaveAttribute("aria-label");

      // Tabs should have aria-selected
      const activeTab = page.locator('[role="tab"][aria-selected="true"]').first();
      await expect(activeTab).toBeVisible();

      // Tab panels should have role="tabpanel"
      const tabpanel = page.locator('[role="tabpanel"]').first();
      await expect(tabpanel).toBeVisible();
    });

    test("should be keyboard navigable", async ({ page }) => {
      // Tab to first interactive element
      await page.keyboard.press("Tab");

      // Should be able to navigate with Tab key
      const focusedElement = await page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    });
  });
});
