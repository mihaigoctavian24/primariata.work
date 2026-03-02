import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Role-Based Dashboard Rendering
 *
 * Tests that different user roles see appropriate dashboard content:
 * - cetățean: Personal dashboard with cereri, plăți, documents
 * - funcționar: Work queue with assigned cereri
 * - primar: Approval queue and primărie overview
 * - admin: User management and system health
 *
 * Note: These tests require test users with different roles to be seeded in the database
 */

test.describe("Role-Based Dashboard Rendering", () => {
  test.describe.configure({ mode: "serial" });

  test("cetățean sees personal dashboard with all widgets", async ({ page }) => {
    // TODO: Login as cetățean user
    // For now, skip - requires authentication setup
    test.skip(true, "Requires test user setup and authentication");

    await page.goto("/app/bucuresti/sector-1");

    // Verify cetățean-specific content
    await expect(page.getByText("Cereri Active")).toBeVisible();
    await expect(page.getByText("Statistici Financiare")).toBeVisible();
    await expect(page.getByText("Acțiuni Rapide")).toBeVisible();

    // Verify 3D Map (Spline iframe)
    const splineIframe = page.locator('iframe[title="3D Map Visualization"]');
    await expect(splineIframe).toBeVisible();

    // Verify dashboard sections exist
    await expect(
      page.locator("text=Recent Documents").or(page.locator("text=Documente Recente"))
    ).toBeVisible();
  });

  test("funcționar sees work queue dashboard", async ({ page }) => {
    // TODO: Login as funcționar user
    test.skip(true, "Requires test user setup and authentication");

    await page.goto("/app/bucuresti/sector-1");

    // Verify funcționar-specific content
    await expect(page.getByRole("heading", { name: /Bun venit,/ })).toBeVisible();
    await expect(page.getByText("Rol: Funcționar")).toBeVisible();
    await expect(page.getByText("Cereri Asignate")).toBeVisible();

    // Verify quick stats for funcționar
    await expect(page.getByText("Pending")).toBeVisible();
    await expect(page.getByText("În Procesare")).toBeVisible();
    await expect(page.getByText("Finalizate")).toBeVisible();

    // Verify departament info if present
    const departamentSection = page.locator("text=Departament");
    if (await departamentSection.isVisible()) {
      await expect(departamentSection).toBeVisible();
    }
  });

  test("primar sees approval queue and primărie overview", async ({ page }) => {
    // TODO: Login as primar user
    test.skip(true, "Requires test user setup and authentication");

    await page.goto("/app/bucuresti/sector-1");

    // Verify primar-specific content
    await expect(page.getByRole("heading", { name: /Primărie/ })).toBeVisible();
    await expect(page.getByText(/Primar:/)).toBeVisible();
    await expect(page.getByText("Cereri care Necesită Aprobare")).toBeVisible();

    // Verify financial overview
    await expect(page.getByText("Situație Financiară")).toBeVisible();
    await expect(page.getByText("Încasări Totale")).toBeVisible();

    // Verify staff performance section
    await expect(page.getByText("Performanță Staff")).toBeVisible();

    // Verify citizen satisfaction widget
    await expect(page.getByText("Satisfacție Cetățeni")).toBeVisible();
  });

  test("admin sees user management dashboard", async ({ page }) => {
    // TODO: Login as admin user
    test.skip(true, "Requires test user setup and authentication");

    await page.goto("/app/bucuresti/sector-1");

    // Verify admin-specific content
    await expect(page.getByRole("heading", { name: /Administrator/ })).toBeVisible();
    await expect(page.getByText("Management Utilizatori")).toBeVisible();

    // Verify user stats
    await expect(page.getByText("Cetățeni")).toBeVisible();
    await expect(page.getByText("Funcționari")).toBeVisible();
    await expect(page.getByText("Admini")).toBeVisible();
    await expect(page.getByText("Invitații")).toBeVisible();

    // Verify system health monitoring
    await expect(page.getByText("Sănătate Sistem")).toBeVisible();
    await expect(page.getByText("Database")).toBeVisible();
    await expect(page.getByText("Authentication")).toBeVisible();
    await expect(page.getByText("Storage")).toBeVisible();

    // Verify admin action buttons
    await expect(page.getByRole("button", { name: /Gestionare Utilizatori/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Invită Staff/ })).toBeVisible();
  });

  test("shows loading state while fetching user profile", async ({ page }) => {
    test.skip(true, "Requires authentication and slow network simulation");

    // Simulate slow network to catch loading state
    await page.route("**/api/user/profile", async (route) => {
      await page.waitForTimeout(2000); // Delay response
      await route.continue();
    });

    await page.goto("/app/bucuresti/sector-1");

    // Verify loading spinner appears
    await expect(page.getByText("Se încarcă dashboard-ul...")).toBeVisible();
    await expect(page.locator("svg").filter({ hasText: "Loader" })).toBeVisible();
  });

  test("shows error state when profile fetch fails", async ({ page }) => {
    test.skip(true, "Requires authentication and error simulation");

    // Simulate API error
    await page.route("**/api/user/profile", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: { message: "Internal server error" },
        }),
      });
    });

    await page.goto("/app/bucuresti/sector-1");

    // Verify error message appears
    await expect(
      page.getByRole("heading", { name: "Eroare la încărcarea profilului" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Reîncarcă Pagina" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Înapoi Acasă" })).toBeVisible();
  });

  test("shows deactivated account message when user is inactive", async ({ page }) => {
    test.skip(true, "Requires authentication with inactive user");

    // Mock inactive user response
    await page.route("**/api/user/profile", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            message: "User account is deactivated",
            code: "ACCOUNT_DEACTIVATED",
          },
        }),
      });
    });

    await page.goto("/app/bucuresti/sector-1");

    // Verify deactivated message appears
    await expect(page.getByRole("heading", { name: "Cont Dezactivat" })).toBeVisible();
    await expect(page.getByText(/Contul tău a fost dezactivat/)).toBeVisible();
  });

  test("handles unknown role gracefully", async ({ page }) => {
    test.skip(true, "Requires authentication with custom role");

    // Mock user with unknown role
    await page.route("**/api/user/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "test-user",
            email: "test@example.com",
            nume: "Test",
            prenume: "User",
            rol: "unknown_role", // Invalid role
            departament: null,
            permisiuni: null,
            primarie_id: null,
            localitate_id: 1,
            avatar_url: null,
            telefon: null,
            cnp: null,
            activ: true,
          },
        }),
      });
    });

    await page.goto("/app/bucuresti/sector-1");

    // Verify unknown role fallback
    await expect(page.getByRole("heading", { name: "Rol Necunoscut" })).toBeVisible();
    await expect(page.getByText(/Rolul tău \(unknown_role\) nu este recunoscut/)).toBeVisible();
  });
});
