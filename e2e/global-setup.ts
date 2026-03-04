/**
 * Playwright Global Setup
 *
 * Loads environment variables from .env.local before all tests run,
 * then seeds E2E test data (users, cereri, plati, etc.) idempotently.
 */
import { config } from "dotenv";
import { resolve } from "path";

async function globalSetup() {
  // Load environment variables from .env.local
  const envPath = resolve(__dirname, "..", ".env.local");
  config({ path: envPath });

  // Verify critical environment variables are loaded
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPlease ensure .env.local file exists with these variables.");
    throw new Error("Missing required environment variables for E2E tests");
  }

  console.log("Environment variables loaded successfully for E2E tests");
  console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(
    `   - Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "***" + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-4) : "NOT SET"}`
  );

  // Seed E2E test data (idempotent -- safe to re-run)
  console.log("Seeding E2E test data...");
  try {
    const { seedE2EData } = await import("./seed/seed-e2e-data");
    await seedE2EData();
    console.log("E2E seed complete.");
  } catch (error) {
    console.error("E2E seed failed:", error);
    throw new Error(
      `E2E seed failed. Tests cannot run without seeded data. Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export default globalSetup;
