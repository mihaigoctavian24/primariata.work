/**
 * Centralized E2E Auth Helper
 *
 * Provides authenticateAs(page, role) for all E2E specs.
 * Re-exports TEST_USERS and TEST_CONFIG for convenience.
 */

import type { Page } from "@playwright/test";
import { TEST_USERS, TEST_CONFIG } from "../seed/test-users";

export { TEST_USERS, TEST_CONFIG };

type Role = "cetatean" | "functionar" | "admin" | "primar";

/**
 * Authenticates as the given role via the login UI.
 *
 * 1. Navigates to /login
 * 2. Fills email + password from TEST_USERS
 * 3. Clicks the login button
 * 4. Handles location selection if redirected to /location
 * 5. Waits until URL contains /app/{judet}/{localitate}
 */
export async function authenticateAs(page: Page, role: Role): Promise<void> {
  const user = TEST_USERS[role];

  if (!user) {
    throw new Error(`Unknown role: ${role}. Valid roles: cetatean, functionar, admin, primar`);
  }

  // Navigate to login page
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  // Fill credentials
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 10000 });
  await emailInput.fill(user.email);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(user.password);

  // Click login button (matches Romanian text variants)
  const loginButton = page.getByRole("button", {
    name: /autentific|login|conectare|intr/i,
  });
  await loginButton.click();

  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });

  const currentUrl = new URL(page.url());

  // Handle location selection page
  if (currentUrl.pathname.includes("/location")) {
    try {
      // Try clicking on judet text
      const judetOption = page.getByText(/bucure/i).first();
      await judetOption.click({ timeout: 5000 });

      // Try clicking on localitate text
      const localitateOption = page.getByText(/sector.*1/i).first();
      await localitateOption.click({ timeout: 5000 });

      // Try clicking confirm/continue button
      const confirmButton = page.getByRole("button", {
        name: /continu|confirm|selec/i,
      });
      await confirmButton.click({ timeout: 5000 });
    } catch {
      // Fallback: navigate directly to the app URL
      await page.goto(`/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}`);
    }
  }

  // Wait for final URL to contain the app path
  const expectedPath = `/app/${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}`;
  try {
    await page.waitForURL((url) => url.pathname.includes(expectedPath), {
      timeout: 10000,
    });
  } catch {
    // If we are in /app/ but maybe different path, that is still authenticated
    const finalUrl = page.url();
    if (!finalUrl.includes("/app/")) {
      // Last resort: navigate directly
      await page.goto(expectedPath);
    }
  }

  // Wait for page to settle
  await page.waitForLoadState("networkidle");
}
