/**
 * Backfill User Locations Script
 *
 * Fixes existing users with NULL localitate_id and primarie_id by:
 * 1. Finding all users with NULL location fields
 * 2. Attempting to infer location from their cereri (requests) history
 * 3. If no cereri exist, marking them for manual location re-selection
 *
 * Usage:
 *   npx tsx scripts/backfill-user-locations.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UserWithoutLocation {
  id: string;
  email: string;
  created_at: string;
}

interface CerereLocation {
  primarie_id: string;
}

async function main() {
  console.log("🔍 Starting user location backfill...\n");

  // Step 1: Find all users with NULL location
  console.log("Step 1: Finding users with NULL location...");
  const { data: usersWithoutLocation, error: usersError } = await supabase
    .from("utilizatori")
    .select("id, email, created_at")
    .is("localitate_id", null)
    .is("primarie_id", null)
    .eq("rol", "cetatean") // Only fix cetățeni (staff have primarie_id from invitations)
    .order("created_at", { ascending: false });

  if (usersError) {
    console.error("❌ Error fetching users:", usersError);
    process.exit(1);
  }

  if (!usersWithoutLocation || usersWithoutLocation.length === 0) {
    console.log("✅ No users need location backfill! All users have locations set.");
    process.exit(0);
  }

  console.log(`Found ${usersWithoutLocation.length} users without location:\n`);

  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Step 2: Process each user
  for (const user of usersWithoutLocation as UserWithoutLocation[]) {
    console.log(`\n📧 Processing user: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleDateString("ro-RO")}`);

    // Try to infer location from cereri (requests) history
    const { data: cereri, error: cereriError } = await supabase
      .from("cereri")
      .select("primarie_id")
      .eq("solicitant_id", user.id)
      .not("primarie_id", "is", null)
      .limit(1)
      .single();

    if (cereriError && cereriError.code !== "PGRST116") {
      // PGRST116 = no rows
      console.error(`   ❌ Error fetching cereri:`, cereriError.message);
      errorCount++;
      continue;
    }

    if (!cereri) {
      console.log(`   ⚠️  No cereri found - cannot infer location`);
      console.log(`   → User will need to re-select location on next login`);
      skippedCount++;
      continue;
    }

    // We found a cerere with location data!
    const cerereLocation = cereri as CerereLocation;
    console.log(`   ✅ Found location from cerere history:`);
    console.log(`      - primarie_id: ${cerereLocation.primarie_id}`);

    // Get primărie details to verify
    const { data: primarie, error: primarieError } = await supabase
      .from("primarii")
      .select("id, nume_oficial, localitate_id")
      .eq("id", cerereLocation.primarie_id)
      .single();

    if (primarieError || !primarie) {
      console.error(`   ❌ Error fetching primărie:`, primarieError?.message);
      errorCount++;
      continue;
    }

    // Update user with inferred location
    const { error: updateError } = await supabase
      .from("utilizatori")
      .update({
        primarie_id: primarie.id,
        localitate_id: primarie.localitate_id,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(`   ❌ Error updating user:`, updateError.message);
      errorCount++;
      continue;
    }

    console.log(`   ✅ Updated user with primărie: ${primarie.nume_oficial}`);
    fixedCount++;
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 BACKFILL SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total users processed: ${usersWithoutLocation.length}`);
  console.log(`✅ Fixed (inferred from cereri): ${fixedCount}`);
  console.log(`⚠️  Skipped (no cereri history): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log("=".repeat(60));

  if (skippedCount > 0) {
    console.log("\n⚠️  Users without cereri history will be prompted to select");
    console.log("   their location on next login via the location picker.");
  }

  console.log("\n✅ Backfill completed!");
}

// Run the script
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
