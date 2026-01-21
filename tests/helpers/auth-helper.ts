import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Page } from "@playwright/test";

/**
 * Auth Helper for E2E Tests
 *
 * Provides utilities to bypass OAuth and create authenticated sessions
 * directly using Supabase service role privileges for testing purposes.
 */

export interface TestAdmin {
  id: string;
  email: string;
  primarieId: string;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface TestPrimarie {
  id: string;
  nume: string;
  slug: string;
  localitate_id: number;
}

/**
 * Creates or retrieves test primarie for integration tests
 */
export async function getOrCreateTestPrimarie(): Promise<TestPrimarie> {
  const supabase = createServiceRoleClient();

  // Check if test primarie exists
  const { data: existing } = await supabase
    .from("primarii")
    .select("id, nume_oficial, slug, localitate_id")
    .eq("slug", "test-primarie-e2e")
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      nume: existing.nume_oficial,
      slug: existing.slug,
      localitate_id: existing.localitate_id || 1, // Fallback to Buftea
    };
  }

  // Use fixed locality ID that we know exists in the database
  // This avoids querying for test localities that may not exist
  const localitate = { id: 1 }; // Buftea, Ilfov (known existing locality)

  // Create test primarie
  const { data: primarie, error } = await supabase
    .from("primarii")
    .insert({
      slug: "test-primarie-e2e",
      nume_oficial: "Primăria Test E2E",
      localitate_id: localitate.id,
      activa: true,
      setup_complet: true,
    })
    .select("id, nume_oficial, slug, localitate_id")
    .single();

  if (error) {
    // If duplicate key error (race condition with parallel tests), fetch existing
    if (error.code === "23505" || error.message.includes("duplicate key")) {
      const { data: existingAfterRace } = await supabase
        .from("primarii")
        .select("id, nume_oficial, slug, localitate_id")
        .eq("slug", "test-primarie-e2e")
        .maybeSingle();

      if (existingAfterRace) {
        return {
          id: existingAfterRace.id,
          nume: existingAfterRace.nume_oficial,
          slug: existingAfterRace.slug,
          localitate_id: existingAfterRace.localitate_id || 1, // Fallback to Buftea
        };
      }
    }

    throw new Error(`Failed to create test primarie: ${error?.message}`);
  }

  if (!primarie) {
    throw new Error("Failed to create test primarie: no data returned");
  }

  return {
    id: primarie.id,
    nume: primarie.nume_oficial,
    slug: primarie.slug,
    localitate_id: primarie.localitate_id || 1, // Fallback to Buftea
  };
}

/**
 * Creates admin user with authenticated session for E2E tests
 * Bypasses OAuth flow by directly creating auth.users and utilizatori records
 *
 * @param email Admin email
 * @param primarieId Primarie ID to assign admin to
 * @returns TestAdmin with session tokens
 */
export async function createAdminSession(email: string, primarieId: string): Promise<TestAdmin> {
  const supabase = createServiceRoleClient();

  // Check if user already exists
  const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
  const existing = existingAuthUser?.users.find((u) => u.email === email);

  let userId: string;

  if (existing) {
    // User exists - generate new session
    userId = existing.id;

    // Generate session for existing user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (sessionError || !sessionData) {
      throw new Error(`Failed to generate session for existing user: ${sessionError?.message}`);
    }

    // Extract tokens from verification URL (workaround)
    // In real implementation, we'd use signInWithPassword or similar
    // For tests, we'll create a fresh user each time with confirmed email
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw new Error(`Failed to delete existing user: ${deleteError.message}`);
    }

    // Delete from utilizatori table as well
    await supabase.from("utilizatori").delete().eq("id", userId);
  }

  // Create new user with confirmed email
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    email_confirm: true,
    user_metadata: {
      full_name: "Admin Test",
      prenume: "Admin",
      nume: "Test",
    },
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create auth user: ${authError?.message}`);
  }

  userId = authData.user.id;

  // Create utilizatori record with admin role
  const { error: utilizatorError } = await supabase.from("utilizatori").insert({
    id: userId,
    email: email,
    prenume: "Admin",
    nume: "Test",
    rol: "admin",
    primarie_id: primarieId,
    activ: true,
    email_verificat: true,
  });

  if (utilizatorError) {
    throw new Error(`Failed to create utilizatori record: ${utilizatorError.message}`);
  }

  // Generate session tokens
  // Note: For E2E tests, we need actual session tokens
  // We'll use admin.generateLink to get a magic link and extract tokens
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: email,
  });

  if (linkError || !linkData) {
    throw new Error(`Failed to generate magic link: ${linkError?.message}`);
  }

  // Extract access and refresh tokens from the properties
  // The linkData contains hashed_token which we can't use directly
  // For testing, we'll create a real session using signInWithPassword
  // But first we need to set a password

  const testPassword = "TestPassword123!";
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password: testPassword,
  });

  if (updateError) {
    throw new Error(`Failed to set user password: ${updateError.message}`);
  }

  // Now sign in to get real tokens
  const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email,
    password: testPassword,
  });

  if (signInError || !sessionData.session) {
    throw new Error(`Failed to sign in: ${signInError?.message}`);
  }

  const accessToken = sessionData.session.access_token;
  const refreshToken = sessionData.session.refresh_token;

  return {
    id: userId,
    email: email,
    primarieId: primarieId,
    session: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  };
}

/**
 * Sets authenticated session by performing actual login through browser UI
 * This ensures all cookies and storage are set correctly by Supabase client
 *
 * @param page Playwright page object
 * @param admin TestAdmin with email and password
 */
export async function setAuthenticatedSession(page: Page, admin: TestAdmin): Promise<void> {
  // Navigate to login page
  await page.goto("/auth/login");

  // Wait for page to load
  await page.waitForLoadState("domcontentloaded");

  // Fill in email and password
  await page.fill('input[type="email"]', admin.email);

  // The password was set in createAdminSession to "TestPassword123!"
  await page.fill('input[type="password"]', "TestPassword123!");

  // Click login button
  await page.click('button:has-text("Intră în cont")');

  // Wait for navigation after login (should redirect to app or admin)
  // Give it 15 seconds to complete the auth flow
  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
      timeout: 15000,
    });
  } catch (error) {
    // If redirect doesn't happen, log current state for debugging
    console.error("Login did not redirect as expected");
    console.error("Current URL:", page.url());
    throw error;
  }
}

/**
 * Cleans up test admin user and associated data
 *
 * @param adminId Admin user ID to clean up
 */
export async function cleanupTestAdmin(adminId: string): Promise<void> {
  const supabase = createServiceRoleClient();

  // Delete from utilizatori (cascades via FK)
  await supabase.from("utilizatori").delete().eq("id", adminId);

  // Delete from auth.users
  await supabase.auth.admin.deleteUser(adminId);
}

/**
 * Cleans up test primarie and all associated data
 *
 * @param primarieId Primarie ID to clean up
 */
export async function cleanupTestPrimarie(primarieId: string): Promise<void> {
  const supabase = createServiceRoleClient();

  // Delete primarie (cascades to related tables via FK constraints)
  await supabase.from("primarii").delete().eq("id", primarieId);
}
