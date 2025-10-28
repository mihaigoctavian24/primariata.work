import { test, expect } from "@playwright/test";

test.describe("Survey Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/survey/start");
  });

  test("should complete full survey flow as citizen", async ({ page }) => {
    // Step 1: Personal Information
    await expect(page.getByRole("heading", { name: "Date personale" })).toBeVisible();
    await page.getByRole("textbox", { name: "Prenume *" }).fill("Ion");
    await page.getByRole("textbox", { name: "Nume *", exact: true }).fill("Popescu");
    await page.getByRole("textbox", { name: "Email (opțional)" }).fill("ion.popescu@test.com");

    // Select county
    await page.getByRole("combobox", { name: "Selectează județul", exact: true }).click();
    await page.getByRole("option", { name: "Alba" }).click();

    // Wait for localities to load and select
    await page.waitForTimeout(500);
    await page.getByRole("combobox", { name: "Selectează localitatea", exact: true }).click();
    await page.getByRole("option", { name: "Daia Română" }).first().click();

    await page.getByRole("button", { name: "Continuă" }).click();

    // Step 2: Respondent Type
    await expect(page.getByRole("heading", { name: "Categoria ta" })).toBeVisible();
    await page.getByRole("button", { name: /Cetățean/i }).click();

    // Step 3: Digital Services Priority
    await expect(page.getByRole("heading", { name: /prioritizează servicii/i })).toBeVisible();

    // Drag and drop first 3 items (simulating priority selection)
    const firstService = page.locator('[draggable="true"]').first();
    await expect(firstService).toBeVisible();

    // Just mark some items as selected for the test
    await page.getByRole("button", { name: "Continuă" }).click();

    // Step 4: Barriers and Challenges
    await expect(page.getByRole("heading", { name: /provocări/i })).toBeVisible();

    // Select some checkboxes
    const checkboxes = page.getByRole("checkbox");
    const count = await checkboxes.count();
    if (count > 0) {
      await checkboxes.first().check();
    }

    await page.getByRole("button", { name: "Continuă" }).click();

    // Step 5: Additional Feedback
    await expect(page.getByRole("heading", { name: /feedback/i })).toBeVisible();
    await page.getByRole("textbox").fill("Acest chestionar este foarte util pentru digitalizare.");
    await page.getByRole("button", { name: /Trimite/i }).click();

    // Verify success page
    await expect(page.getByText(/Mulțumim/i)).toBeVisible({ timeout: 10000 });
  });

  test("should validate required fields in step 1", async ({ page }) => {
    // Try to continue without filling required fields
    await page.getByRole("button", { name: "Continuă" }).click();

    // Should show validation errors or stay on page
    await expect(page.getByRole("heading", { name: "Date personale" })).toBeVisible();
  });

  test("should allow navigation back and forth", async ({ page }) => {
    // Fill step 1
    await page.getByRole("textbox", { name: "Prenume *" }).fill("Test");
    await page.getByRole("textbox", { name: "Nume *", exact: true }).fill("User");

    await page.getByRole("combobox", { name: "Selectează județul", exact: true }).click();
    await page.getByRole("option", { name: "Alba" }).click();
    await page.waitForTimeout(500);
    await page.getByRole("combobox", { name: "Selectează localitatea", exact: true }).click();
    await page.getByRole("option", { name: "Daia Română" }).first().click();

    await page.getByRole("button", { name: "Continuă" }).click();

    // Should be on step 2
    await expect(page.getByRole("heading", { name: "Categoria ta" })).toBeVisible();

    // Go back
    await page.getByRole("button", { name: "Înapoi" }).click();

    // Should be back on step 1 with data preserved
    await expect(page.getByRole("heading", { name: "Date personale" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Prenume *" })).toHaveValue("Test");
    await expect(page.getByRole("textbox", { name: "Nume *", exact: true })).toHaveValue("User");
  });

  test("should show progress bar", async ({ page }) => {
    // Step 1 should show 20%
    await expect(page.getByText("20%")).toBeVisible();
    await expect(page.getByText("Pasul 1 din 5")).toBeVisible();
  });

  test("should be accessible via keyboard", async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press("Tab"); // Logo
    await page.keyboard.press("Tab"); // Theme toggle
    await page.keyboard.press("Tab"); // Back button
    await page.keyboard.press("Tab"); // First name input

    // Should focus on first name input
    await expect(page.getByRole("textbox", { name: "Prenume *" })).toBeFocused();

    // Type using keyboard
    await page.keyboard.type("Ion");
    await expect(page.getByRole("textbox", { name: "Prenume *" })).toHaveValue("Ion");
  });

  test("should handle county and locality dependencies", async ({ page }) => {
    // Initially, we should see a message to select county first
    await expect(page.getByText(/Se încarcă județele/i)).toBeVisible();

    // After counties load, select one
    await page.waitForTimeout(1000); // Wait for counties to load
    await page.getByRole("combobox", { name: "Selectează județul", exact: true }).click();
    await page.getByRole("option", { name: "Alba" }).click();

    // After county selection, locality dropdown should show options
    await page.waitForTimeout(500);
    await page.getByRole("combobox", { name: "Selectează localitatea", exact: true }).click();

    // Should show locality options
    const options = page.getByRole("option");
    const count = await options.count();
    expect(count).toBeGreaterThan(0); // Should have at least one locality
  });
});
