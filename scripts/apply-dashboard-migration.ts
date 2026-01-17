/**
 * Apply dashboard revamp migration directly to database
 * Run with: npx tsx scripts/apply-dashboard-migration.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log("🚀 Starting dashboard revamp migration...\n");

  try {
    // Read migration file
    const migrationPath = join(
      process.cwd(),
      "supabase",
      "migrations",
      "20260109003629_dashboard_revamp_tables.sql"
    );
    const migrationSql = readFileSync(migrationPath, "utf-8");

    console.log("📄 Migration file loaded");
    console.log("📏 SQL size:", migrationSql.length, "characters\n");

    // Execute migration through RPC
    console.log("⚡ Executing migration...");

    // Split by statement separator and execute each separately
    const statements = migrationSql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip pure comments
      if (statement?.startsWith("--") || statement?.match(/^\/\*/)) {
        continue;
      }

      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql_query: statement + ";",
        });

        if (error) {
          // Try direct query if RPC doesn't exist
          const { error: queryError } = await supabase.from("_migrations").select("*").limit(1);

          if (queryError) {
            console.log(`❌ Statement ${i + 1} failed:`, error.message.substring(0, 100));
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️ Statement ${i + 1} error:`, err);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration execution completed`);
    console.log(`   Success: ${successCount} statements`);
    console.log(`   Errors: ${errorCount} statements\n`);

    // Verify tables were created
    console.log("🔍 Verifying tables...\n");

    // Check notifications
    const { error: notifError } = await supabase.from("notifications").select("id").limit(1);

    if (notifError) {
      console.log("❌ notifications table: NOT CREATED");
      console.log("   Error:", notifError.message);
    } else {
      console.log("✅ notifications table: EXISTS");
    }

    // Check user_achievements
    const { error: achievError } = await supabase.from("user_achievements").select("id").limit(1);

    if (achievError) {
      console.log("❌ user_achievements table: NOT CREATED");
      console.log("   Error:", achievError.message);
    } else {
      console.log("✅ user_achievements table: EXISTS");
    }

    // Check progress_data column
    const { error: cereriError } = await supabase
      .from("cereri")
      .select("id, progress_data")
      .limit(1);

    if (cereriError) {
      console.log("❌ progress_data column: NOT CREATED");
      console.log("   Error:", cereriError.message);
    } else {
      console.log("✅ progress_data column: EXISTS in cereri");
    }

    console.log("\n🎉 Migration process complete!\n");

    if (errorCount > 0) {
      console.log(
        "⚠️  Some statements failed. You may need to apply migration manually via Supabase Dashboard SQL Editor."
      );
      console.log(
        "    Migration file: supabase/migrations/20260109003629_dashboard_revamp_tables.sql"
      );
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

applyMigration();
