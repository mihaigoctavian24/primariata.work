/**
 * Check if dashboard revamp tables exist in database
 * Run with: npx tsx scripts/check-dashboard-tables.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log("🔍 Checking dashboard revamp tables...\n");

  try {
    // Check notifications table
    console.log("1️⃣ Checking notifications table...");
    const { error: notifError } = await supabase.from("notifications").select("id").limit(1);

    if (notifError) {
      console.log("   ❌ notifications table does NOT exist");
      console.log("   Error:", notifError.message);
    } else {
      console.log("   ✅ notifications table EXISTS");
    }

    // Check user_achievements table
    console.log("\n2️⃣ Checking user_achievements table...");
    const { error: achievError } = await supabase.from("user_achievements").select("id").limit(1);

    if (achievError) {
      console.log("   ❌ user_achievements table does NOT exist");
      console.log("   Error:", achievError.message);
    } else {
      console.log("   ✅ user_achievements table EXISTS");
    }

    // Check progress_data column in cereri
    console.log("\n3️⃣ Checking progress_data column in cereri...");
    const { data: cereri, error: cereriError } = await supabase
      .from("cereri")
      .select("id, progress_data")
      .limit(1);

    if (cereriError) {
      console.log("   ❌ progress_data column does NOT exist in cereri");
      console.log("   Error:", cereriError.message);
    } else {
      console.log("   ✅ progress_data column EXISTS in cereri");
      if (cereri && cereri.length > 0 && cereri[0]) {
        console.log("   Sample data:", JSON.stringify(cereri[0].progress_data, null, 2));
      }
    }

    console.log("\n✅ Database check complete!");
  } catch (error) {
    console.error("❌ Error checking tables:", error);
  }
}

checkTables();
