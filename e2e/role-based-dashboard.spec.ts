import { test, expect } from "@playwright/test";
import { authenticateAs, TEST_CONFIG } from "./helpers/auth";

/**
 * E2E Tests for Role-Based Dashboard Rendering
 *
 * Tests that different user roles see appropriate dashboard content:
 * - cetatean: Personal dashboard with cereri active, financial stats, documents
 * - functionar: Work queue with stat cards and SLA-sorted cereri
 * - primar: Approval queue, financial overview, staff metrics
 * - admin: User management, cereri overview, activity feed
 *
 * All tests authenticate via centralized authenticateAs helper (11-01).
 */

test.describe("Role-Based Dashboard Rendering", () => {
  test.describe.configure({ mode: "serial" });

  const dashboardUrl = `/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}`;

  test("cetatean sees personal dashboard with all widgets", async ({ page }) => {
    await authenticateAs(page, "cetatean");
    await page.goto(dashboardUrl);
    await page.waitForLoadState("networkidle");

    // CetateeanDashboard renders "Cereri Active" heading when there are active cereri
    // and "Statistici Financiare" section heading (always present)
    await expect(page.getByText("Statistici Financiare")).toBeVisible({ timeout: 15000 });

    // Quick Actions section is always rendered
    await expect(
      page.getByText("Actiuni Rapide").or(page.getByText("Acțiuni Rapide"))
    ).toBeVisible();

    // RecentDocumentsWidget is always rendered (even if empty)
    await expect(page.getByText("Documente Recente").or(page.getByText("documente"))).toBeVisible();

    // No Spline 3D iframe -- replaced with Leaflet map in Phase 2
    const splineIframe = page.locator('iframe[title="3D Map Visualization"]');
    await expect(splineIframe).not.toBeVisible();
  });

  test("functionar sees work queue dashboard", async ({ page }) => {
    await authenticateAs(page, "functionar");
    await page.goto(dashboardUrl);
    await page.waitForLoadState("networkidle");

    // Welcome banner with user name
    await expect(page.getByText(/Bun venit,/)).toBeVisible({ timeout: 15000 });

    // Role label in welcome banner
    await expect(page.getByText(/Rol: Functionar/)).toBeVisible();

    // Stat cards: Pending, Depasit Termen, In Procesare, Finalizate Azi
    await expect(page.getByText("Pending")).toBeVisible();
    await expect(page.getByText("In Procesare")).toBeVisible();
    await expect(page.getByText("Finalizate Azi")).toBeVisible();

    // Cereri queue heading
    await expect(page.getByText(/Cereri.*Ordonate dupa SLA/)).toBeVisible();
  });

  test("primar sees approval queue and primarie overview", async ({ page }) => {
    await authenticateAs(page, "primar");
    await page.goto(dashboardUrl);
    await page.waitForLoadState("networkidle");

    // Welcome banner with Primarie name
    await expect(page.getByText(/Primarie/)).toBeVisible({ timeout: 15000 });

    // Primar name label
    await expect(page.getByText(/Primar:/)).toBeVisible();

    // Approval queue section
    await expect(page.getByText("Cereri care Necesita Aprobare")).toBeVisible();

    // Financial overview section
    await expect(page.getByText("Situatie Financiara")).toBeVisible();

    // Staff performance section (still exists in current PrimarDashboard)
    await expect(page.getByText("Performanta Staff")).toBeVisible();
  });

  test("admin sees management dashboard", async ({ page }) => {
    await authenticateAs(page, "admin");
    await page.goto(dashboardUrl);
    await page.waitForLoadState("networkidle");

    // Welcome banner with Administrator title
    await expect(page.getByText(/Administrator/)).toBeVisible({ timeout: 15000 });

    // User management section
    await expect(page.getByText("Management Utilizatori")).toBeVisible();

    // User stat cards
    await expect(page.getByText("Cetateni")).toBeVisible();
    await expect(page.getByText("Functionari")).toBeVisible();
    await expect(page.getByText("Admini")).toBeVisible();

    // Cereri overview (replaced System Health in Phase 5)
    await expect(page.getByText(/Cereri.*Privire de Ansamblu/)).toBeVisible();

    // Admin action buttons
    await expect(page.getByRole("button", { name: /Gestionare Utilizatori/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Invita Staff/ })).toBeVisible();
  });

  test.fixme("shows loading state while fetching user profile", async ({ page }) => {
    // Cannot reliably simulate loading state with real auth session --
    // page.route intercept for profile API races with Supabase auth check.
    // The dashboard uses React Query which resolves faster than route intercepts.
    await authenticateAs(page, "cetatean");
    await page.goto(dashboardUrl);
  });

  test.fixme("shows error state when profile fetch fails", async ({ page }) => {
    // Cannot simulate API error with real auth session --
    // the dashboard page gates on Supabase session, not /api/user/profile.
    // Route-level mock would need to run before auth middleware check.
    await authenticateAs(page, "cetatean");
    await page.goto(dashboardUrl);
  });

  test.fixme("shows deactivated account message when user is inactive", async ({ page }) => {
    // Requires a user with activ=false in the database --
    // cannot be simulated with route mocks since auth middleware
    // redirects inactive users before dashboard renders.
    await authenticateAs(page, "cetatean");
    await page.goto(dashboardUrl);
  });

  test.fixme("handles unknown role gracefully", async ({ page }) => {
    // Cannot simulate unknown role with real auth session --
    // role is determined from user_primarii join, not from API mock.
    // Would need a test user with an invalid role in the database.
    await authenticateAs(page, "cetatean");
    await page.goto(dashboardUrl);
  });
});
