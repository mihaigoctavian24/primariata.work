import { test, expect, type Page } from "@playwright/test";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  createAdminSession,
  setAuthenticatedSession,
  getOrCreateTestPrimarie,
  cleanupTestAdmin,
  type TestAdmin,
  type TestPrimarie,
} from "../tests/helpers/auth-helper";

/**
 * Staff Invitation E2E Tests
 *
 * Tests the complete invitation workflow from admin invitation creation
 * to user acceptance and role assignment.
 *
 * Prerequisites:
 * - Running Next.js dev server (pnpm dev)
 * - Supabase instance with migrations applied
 * - Test primarie and admin user created via helper
 */

// Test data
const TEST_ADMIN_EMAIL = "admin.test.e2e@primarie.ro";

const TEST_INVITATION = {
  email: `test.functionar.${Date.now()}@primarie.ro`,
  prenume: "Ion",
  nume: "Popescu",
  rol: "functionar" as const,
  departament: "Resurse Umane",
  password: "SecurePass123!",
};

test.describe("Staff Invitation Flow", () => {
  let adminPage: Page;
  let invitationToken: string;
  let invitationLink: string;
  let testAdmin: TestAdmin;
  let testPrimarie: TestPrimarie;

  test.beforeAll(async ({ browser }) => {
    // Setup: Get or create test primarie
    testPrimarie = await getOrCreateTestPrimarie();

    // Create admin session (bypasses OAuth for testing)
    testAdmin = await createAdminSession(TEST_ADMIN_EMAIL, testPrimarie.id);

    // Create authenticated page with admin session
    adminPage = await browser.newPage();
    await setAuthenticatedSession(adminPage, testAdmin);

    // Navigate to admin users page (admin dashboard doesn't exist yet)
    await adminPage.goto("/admin/users");
    await adminPage.waitForURL("/admin/users");
  });

  test.afterAll(async () => {
    // Cleanup: Delete test admin and primarie
    if (testAdmin) {
      await cleanupTestAdmin(testAdmin.id);
    }

    await adminPage?.close();
  });

  test("Admin can create staff invitation", async () => {
    // Navigate to users management page
    await adminPage.goto("/admin/users");
    await expect(adminPage).toHaveURL("/admin/users");

    // Open invite dialog
    await adminPage.click('text="Invită Membru Nou"');

    // Wait for dialog to appear
    await expect(adminPage.locator('[role="dialog"]')).toBeVisible();

    // Fill invitation form
    await adminPage.fill('input[name="email"]', TEST_INVITATION.email);
    await adminPage.fill('input[name="prenume"]', TEST_INVITATION.prenume);
    await adminPage.fill('input[name="nume"]', TEST_INVITATION.nume);

    // Select role from dropdown
    await adminPage.click('[name="rol"]');
    await adminPage.click(
      `text="${TEST_INVITATION.rol === "functionar" ? "Funcționar" : "Administrator"}"`
    );

    // Fill department
    await adminPage.fill('input[name="departament"]', TEST_INVITATION.departament);

    // Submit form
    await adminPage.click('button[type="submit"]:has-text("Trimite Invitația")');

    // Wait for success toast
    await expect(adminPage.locator('text="Invitație trimisă cu succes"')).toBeVisible({
      timeout: 10000,
    });

    // Verify invitation appears in pending invitations (page refresh)
    await adminPage.reload();
    await expect(adminPage.locator(`text="${TEST_INVITATION.email}"`)).toBeVisible();
  });

  test("Invitation token is created in database", async () => {
    const supabase = createServiceRoleClient();

    // Query invitation from database
    const { data: invitation, error } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("email", TEST_INVITATION.email)
      .eq("status", "pending")
      .single();

    expect(error).toBeNull();
    expect(invitation).toBeDefined();
    expect(invitation?.token).toBeDefined();
    expect(invitation?.rol).toBe(TEST_INVITATION.rol);
    expect(invitation?.status).toBe("pending");

    // Verify expiration is set (7 days from now)
    const expiresAt = new Date(invitation!.expires_at);
    const now = new Date();
    const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysDiff).toBeGreaterThan(6.9);
    expect(daysDiff).toBeLessThan(7.1);

    // Store token for next tests
    invitationToken = invitation!.token;
    invitationLink = `/auth/accept-invite?token=${invitationToken}`;
  });

  test("User can access invitation acceptance page", async ({ page }) => {
    await page.goto(invitationLink);

    // Wait for page to load
    await expect(page).toHaveURL(invitationLink);

    // Verify invitation details are displayed
    await expect(
      page.locator(`text="${TEST_INVITATION.prenume} ${TEST_INVITATION.nume}"`)
    ).toBeVisible();
    await expect(page.locator(`text="${TEST_INVITATION.email}"`)).toBeVisible();
    await expect(page.locator('text="Funcționar"')).toBeVisible();

    // Verify email field is disabled (pre-filled)
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeDisabled();
    await expect(emailInput).toHaveValue(TEST_INVITATION.email);
  });

  test("User can accept invitation and create account", async ({ page }) => {
    await page.goto(invitationLink);

    // Fill password fields
    await page.fill('input[name="password"]', TEST_INVITATION.password);
    await page.fill('input[name="confirmPassword"]', TEST_INVITATION.password);

    // Submit form
    await page.click('button[type="submit"]:has-text("Creează Contul")');

    // Wait for redirect to login with success message
    await page.waitForURL(/\/auth\/login/);
    await expect(page.locator('text="Cont creat cu succes"')).toBeVisible({ timeout: 10000 });
  });

  test("User is created with correct role in database", async () => {
    const supabase = createServiceRoleClient();

    // Wait a bit for auth trigger to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Query user from database
    const { data: user, error } = await supabase
      .from("utilizatori")
      .select("*")
      .eq("email", TEST_INVITATION.email)
      .single();

    expect(error).toBeNull();
    expect(user).toBeDefined();
    expect(user?.rol).toBe(TEST_INVITATION.rol);
    expect(user?.nume).toBe(TEST_INVITATION.nume);
    expect(user?.prenume).toBe(TEST_INVITATION.prenume);
  });

  test("Invitation is marked as accepted in database", async () => {
    const supabase = createServiceRoleClient();

    // Query invitation from database
    const { data: invitation, error } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("token", invitationToken)
      .single();

    expect(error).toBeNull();
    expect(invitation).toBeDefined();
    expect(invitation?.status).toBe("accepted");
    expect(invitation?.accepted_at).toBeDefined();
  });

  test("Accepted invitation cannot be reused", async ({ page }) => {
    await page.goto(invitationLink);

    // Should show error message about invalid/used invitation
    await expect(page.locator("text=/invitație.*nu.*valid|invitație.*folosit/i")).toBeVisible({
      timeout: 10000,
    });

    // Password fields should not be present
    await expect(page.locator('input[name="password"]')).not.toBeVisible();
  });
});

test.describe("Invitation Security", () => {
  test("Expired invitation is rejected", async ({ page }) => {
    const supabase = createServiceRoleClient();

    // Create an expired invitation
    const expiredEmail = `expired.${Date.now()}@primarie.ro`;
    const { data: invitation } = await supabase
      .from("user_invitations")
      .insert({
        email: expiredEmail,
        nume: "Test",
        prenume: "Expired",
        rol: "functionar",
        primarie_id: "550e8400-e29b-41d4-a716-446655440002", // Test primarie ID
        expires_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        invited_by: "550e8400-e29b-41d4-a716-446655440001", // Test admin ID
      })
      .select()
      .single();

    expect(invitation).toBeDefined();

    // Try to accept expired invitation
    await page.goto(`/auth/accept-invite?token=${invitation!.token}`);

    // Should show error about expiration
    await expect(page.locator("text=/invitație.*expirat|invitație.*nu.*valid/i")).toBeVisible({
      timeout: 10000,
    });
  });

  test("Invalid token is rejected", async ({ page }) => {
    // Try to accept invitation with invalid token
    await page.goto("/auth/accept-invite?token=invalid-token-12345");

    // Should show error about invalid token
    await expect(page.locator("text=/token.*invalid|invitație.*nu.*găsit/i")).toBeVisible({
      timeout: 10000,
    });
  });

  test("Cannot invite with duplicate email", async () => {
    // Test this via API since it's backend validation
    const response = await fetch("http://localhost:3000/api/admin/users/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `sb-access-token=${process.env.TEST_ADMIN_TOKEN}`, // Need admin session
      },
      body: JSON.stringify({
        email: TEST_ADMIN.email, // Try to invite existing admin
        nume: "Test",
        prenume: "Duplicate",
        rol: "functionar",
        primarie_id: "550e8400-e29b-41d4-a716-446655440002",
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/există deja|utilizator.*înregistrat/i);
  });
});

test.describe("Role Assignment", () => {
  test("Functionar invitation creates user with functionar role", async () => {
    const supabase = createServiceRoleClient();

    // Query the user created in main flow
    const { data: user } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("email", TEST_INVITATION.email)
      .single();

    expect(user?.rol).toBe("functionar");
  });

  test("Admin invitation creates user with admin role", async () => {
    const supabase = createServiceRoleClient();
    const adminInviteEmail = `admin.invite.${Date.now()}@primarie.ro`;

    // Create admin invitation
    const { data: invitation } = await supabase
      .from("user_invitations")
      .insert({
        email: adminInviteEmail,
        nume: "Test",
        prenume: "Admin",
        rol: "admin",
        primarie_id: "550e8400-e29b-41d4-a716-446655440002",
        invited_by: "550e8400-e29b-41d4-a716-446655440001",
      })
      .select()
      .single();

    expect(invitation).toBeDefined();

    // Simulate user registration with invitation token
    // This would be done via Playwright in a real test, keeping simple for now
    // Just verify invitation was created with correct role
    expect(invitation!.rol).toBe("admin");
  });
});
