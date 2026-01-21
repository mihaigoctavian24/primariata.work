/**
 * Diagnostic Test for Auth Helper
 *
 * Minimal test to identify what's failing in beforeAll hook
 */
import { test, expect, type Page } from "@playwright/test";
import {
  getOrCreateTestPrimarie,
  createAdminSession,
  setAuthenticatedSession,
  cleanupTestAdmin,
  type TestPrimarie,
  type TestAdmin,
} from "../tests/helpers/auth-helper";

// Use unique email per test run to avoid race conditions across parallel browsers
const TEST_ADMIN_EMAIL = `diagnostic-admin-${Date.now()}@test.local`;

test.describe("Diagnostic: Auth Helper", () => {
  let adminPage: Page;
  let testAdmin: TestAdmin;
  let testPrimarie: TestPrimarie;

  test.beforeAll(async ({ browser }) => {
    console.log("Step 1: Getting or creating test primarie...");
    try {
      testPrimarie = await getOrCreateTestPrimarie();
      console.log("✅ Test primarie created:", testPrimarie.id);
    } catch (error) {
      console.error("❌ Failed to create test primarie:", error);
      throw error;
    }

    console.log("Step 2: Creating admin session...");
    try {
      testAdmin = await createAdminSession(TEST_ADMIN_EMAIL, testPrimarie.id);
      console.log("✅ Admin session created:", testAdmin.id);
    } catch (error) {
      console.error("❌ Failed to create admin session:", error);
      throw error;
    }

    console.log("Step 3: Creating authenticated page...");
    try {
      adminPage = await browser.newPage();
      await setAuthenticatedSession(adminPage, testAdmin);
      console.log("✅ Authenticated session set");
    } catch (error) {
      console.error("❌ Failed to set authenticated session:", error);
      throw error;
    }

    console.log("Step 4: Navigating to /admin/users...");
    try {
      await adminPage.goto("/admin/users");
      console.log("✅ Navigation attempted");
      await adminPage.waitForURL("/admin/users", { timeout: 10000 });
      console.log("✅ Successfully navigated to /admin/users");
    } catch (error) {
      console.error("❌ Failed to navigate:", error);
      const currentURL = adminPage.url();
      console.error("Current URL:", currentURL);
      throw error;
    }
  });

  test.afterAll(async () => {
    if (testAdmin) {
      await cleanupTestAdmin(testAdmin.id);
    }
    await adminPage?.close();
  });

  test("beforeAll hook completed successfully", async () => {
    // If we get here, beforeAll succeeded
    expect(testPrimarie).toBeDefined();
    expect(testAdmin).toBeDefined();
    expect(adminPage).toBeDefined();
  });
});
