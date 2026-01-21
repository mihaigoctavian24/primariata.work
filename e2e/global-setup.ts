/**
 * Playwright Global Setup
 *
 * Loads environment variables from .env.local before all tests run.
 * This ensures Supabase connection details are available to test helpers.
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
    console.error("❌ Missing required environment variables:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPlease ensure .env.local file exists with these variables.");
    throw new Error("Missing required environment variables for E2E tests");
  }

  console.log("✅ Environment variables loaded successfully for E2E tests");
  console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(
    `   - Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "***" + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-4) : "NOT SET"}`
  );
}

export default globalSetup;
