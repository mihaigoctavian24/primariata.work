#!/usr/bin/env tsx
/**
 * Fix test user location by updating their utilizatori record
 * with correct localitate_id for Sector 1, București
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("🔍 Finding Sector 1 București...");

  // Step 1: Find București județ
  const { data: judet, error: judetError } = await supabase
    .from("judete")
    .select("id, nume")
    .eq("nume", "București")
    .single();

  if (judetError || !judet) {
    console.error("❌ Could not find București județ:", judetError);
    process.exit(1);
  }

  console.log(`✅ Found județ: ${judet.nume} (ID: ${judet.id})`);

  // Step 2: Find Sector 1 localitate
  const { data: localitate, error: localitateError } = await supabase
    .from("localitati")
    .select("id, nume, slug, tip")
    .eq("judet_id", judet.id)
    .eq("slug", "sector-1-b")
    .single();

  if (localitateError || !localitate) {
    console.error("❌ Could not find Sector 1 București:", localitateError);
    process.exit(1);
  }

  console.log(
    `✅ Found localitate: ${localitate.nume} (ID: ${localitate.id}, Slug: ${localitate.slug})`
  );

  // Step 3: Find primarie for Sector 1
  const { data: primarie, error: primarieError } = await supabase
    .from("primarii")
    .select("id")
    .eq("localitate_id", localitate.id)
    .eq("activa", true)
    .single();

  if (primarieError || !primarie) {
    console.error("❌ Could not find active primărie for Sector 1:", primarieError);
    process.exit(1);
  }

  console.log(`✅ Found primărie: ID ${primarie.id}`);

  // Step 4: Find ALL users (to debug what's actually in the database)
  const { data: allUsers, error: allUsersError } = await supabase
    .from("utilizatori")
    .select("id, email, primarie_id, localitate_id");

  if (allUsersError) {
    console.error("❌ Could not query all users:", allUsersError);
    process.exit(1);
  }

  console.log(`\n📋 Total users in database: ${allUsers?.length || 0}`);
  if (allUsers && allUsers.length > 0) {
    console.log("\nAll users:");
    allUsers.forEach((u) => {
      console.log(
        `  - ${u.email}: primarie=${u.primarie_id || "NULL"}, localitate=${u.localitate_id || "NULL"}`
      );
    });
  }

  // Step 5: Find users missing localitate_id but have primarie_id for Sector 1
  const { data: testUsers, error: usersError } = await supabase
    .from("utilizatori")
    .select("id, email, primarie_id, localitate_id")
    .eq("primarie_id", primarie.id)
    .is("localitate_id", null);

  if (usersError) {
    console.error("❌ Could not query test users:", usersError);
    process.exit(1);
  }

  console.log(
    `\n📋 Found ${testUsers?.length || 0} users with primarie_id=${primarie.id} but missing localitate_id`
  );

  if (!testUsers || testUsers.length === 0) {
    console.log("ℹ️ No users need fixing. Creating a summary of correct values:");
    console.log(`\nCorrect values for Sector 1, București:`);
    console.log(`  - județ_id: ${judet.id}`);
    console.log(`  - localitate_id: ${localitate.id}`);
    console.log(`  - primarie_id: ${primarie.id}`);
    console.log(`  - slug: ${localitate.slug}`);
    process.exit(0);
  }

  // Step 5: Update each test user
  for (const user of testUsers) {
    console.log(`\n👤 User: ${user.email}`);
    console.log(
      `   Current: primarie_id=${user.primarie_id}, localitate_id=${user.localitate_id || "NULL"}`
    );

    // Only update if localitate_id is missing or wrong
    if (user.localitate_id !== localitate.id || user.primarie_id !== primarie.id) {
      const { error: updateError } = await supabase
        .from("utilizatori")
        .update({
          primarie_id: primarie.id,
          localitate_id: localitate.id,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error(`   ❌ Update failed:`, updateError);
      } else {
        console.log(`   ✅ Updated: primarie_id=${primarie.id}, localitate_id=${localitate.id}`);
      }
    } else {
      console.log(`   ℹ️ Already correct, no update needed`);
    }
  }

  console.log(`\n🎉 All done!`);
  console.log(`\nYou can now:`);
  console.log(`  1. Navigate to http://localhost:3000/app/sector-1-b/bucuresti-sectorul-1/cereri`);
  console.log(`  2. Click "Cerere Nouă"`);
  console.log(`  3. Verify /api/tipuri-cereri returns 200 OK`);
}

main().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
