import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/survey");
  });

  test("should display dashboard overview metrics", async ({ page }) => {
    // Check header
    await expect(page.getByRole("heading", { name: "Dashboard Chestionare" })).toBeVisible();
    await expect(
      page.getByText("Analiză și statistici răspunsuri chestionar digitalizare")
    ).toBeVisible();

    // Check metric cards
    await expect(page.getByText("Total Răspunsuri")).toBeVisible();
    await expect(page.getByText("Completate")).toBeVisible();
    await expect(page.getByText("Cetățeni")).toBeVisible();
    await expect(page.getByText("Funcționari")).toBeVisible();

    // Check that metrics show numbers (should be at least the test data)
    const totalResponses = page
      .locator("text=Total Răspunsuri")
      .locator("..")
      .locator("..")
      .getByText(/^\d+$/);
    await expect(totalResponses).toBeVisible();
  });

  test("should display charts", async ({ page }) => {
    // Check chart titles
    await expect(page.getByText("Distribuție Tip Respondent")).toBeVisible();
    await expect(page.getByText("Top 10 Localități")).toBeVisible();
    await expect(page.getByText("Evoluție Răspunsuri în Timp")).toBeVisible();

    // Charts should be rendered (recharts creates SVG elements)
    const charts = page.locator("svg");
    await expect(charts.first()).toBeVisible();
  });

  test("should display responses table", async ({ page }) => {
    // Check table header
    await expect(page.getByRole("heading", { name: "Răspunsuri Chestionar" })).toBeVisible();

    // Check table columns
    await expect(page.getByRole("columnheader", { name: "Nume" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Locație" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Tip" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Data" })).toBeVisible();
  });

  test("should filter responses by search", async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector("table", { timeout: 5000 });

    // Count initial rows
    const initialRows = await page.locator("tbody tr").count();

    // Search for specific name (using test data)
    await page.getByPlaceholder("Caută după nume, email, localitate...").fill("Survey");

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Should still have rows (since test data has "Survey" in it)
    const filteredRows = await page.locator("tbody tr").count();
    expect(filteredRows).toBeGreaterThan(0);

    // Search for non-existent name
    await page
      .getByPlaceholder("Caută după nume, email, localitate...")
      .fill("NonExistentName12345");
    await page.waitForTimeout(300);

    // Should show "no results" message
    await expect(page.getByText(/Nu există răspunsuri/i)).toBeVisible();
  });

  test("should filter responses by type", async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector("table", { timeout: 5000 });

    // Open type filter
    await page.getByRole("combobox", { name: /Toate tipurile/i }).click();

    // Select citizens only
    await page.getByRole("option", { name: "Cetățeni" }).click();

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // All visible rows should show "Cetățean" badge
    const rows = page.locator("tbody tr");
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i).getByText("Cetățean")).toBeVisible();
      }
    }
  });

  test("should filter responses by county", async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector("table", { timeout: 5000 });

    // Open county filter
    await page.getByRole("combobox", { name: /Toate județele/i }).click();

    // Check that counties are listed
    const options = page.getByRole("option");
    const optionsCount = await options.count();
    expect(optionsCount).toBeGreaterThan(1); // At least "Toate județele" + one county
  });

  test("should export CSV", async ({ page }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent("download", { timeout: 5000 });

    // Click export button
    await page.getByRole("button", { name: /Export CSV/i }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify filename pattern
    expect(download.suggestedFilename()).toMatch(/raspunsuri_chestionar_\d{4}-\d{2}-\d{2}\.csv/);
  });

  test("should handle pagination when more than 10 responses", async ({ page }) => {
    // Check if pagination controls exist
    const paginationInfo = page.getByText(/Pagina \d+ din \d+/);

    // If pagination exists, test it
    if (await paginationInfo.isVisible()) {
      // Click next page button
      await page.getByRole("button", { name: /Următorul/i }).click();

      // Should update page info
      await expect(page.getByText(/Pagina 2/)).toBeVisible();

      // Click previous page
      await page.getByRole("button", { name: /Anterior/i }).click();

      // Should go back to page 1
      await expect(page.getByText(/Pagina 1/)).toBeVisible();
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Dashboard should still be accessible
    await expect(page.getByRole("heading", { name: "Dashboard Chestionare" })).toBeVisible();

    // Metric cards should stack vertically and be visible
    await expect(page.getByText("Total Răspunsuri")).toBeVisible();
    await expect(page.getByText("Completate")).toBeVisible();

    // Charts should be visible (might need scrolling)
    const charts = page.locator("svg");
    await expect(charts.first()).toBeVisible();

    // Table should be scrollable
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("should be responsive on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Dashboard should be fully functional
    await expect(page.getByRole("heading", { name: "Dashboard Chestionare" })).toBeVisible();

    // All components should be visible
    await expect(page.getByText("Total Răspunsuri")).toBeVisible();
    await expect(page.getByText("Distribuție Tip Respondent")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("should show admin badge", async ({ page }) => {
    // Admin badge should be visible
    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("should reset filters when searching", async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector("table", { timeout: 5000 });

    // Apply type filter
    await page.getByRole("combobox", { name: /Toate tipurile/i }).click();
    await page.getByRole("option", { name: "Cetățeni" }).click();

    // Then search - should reset pagination to page 1
    await page.getByPlaceholder("Caută după nume, email, localitate...").fill("Test");

    // If pagination exists, should be on page 1
    const paginationInfo = page.getByText(/Pagina/);
    if (await paginationInfo.isVisible()) {
      await expect(page.getByText(/Pagina 1/)).toBeVisible();
    }
  });
});
